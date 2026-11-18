// Builds the content catalog from the source modules in this folder.
//
//   node content/build.mjs
//
// Writes the same JSON to:
//   frontend/src/data/catalog.json          (bundled fallback so the site works with no backend)
//   backend/apps/learn/seed/catalog.json    (loaded by `python manage.py seed_learn`)
//
// It also validates the content: unique ids/slugs, marks that add up, and (when the
// `katex` package can be resolved) that every piece of LaTeX actually parses.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

import * as igcse from './igcse.mjs';
import * as ib from './ib.mjs';
import * as rest from './myp-alevel.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const errors = [];
const fail = (msg) => errors.push(msg);

const boards = [
  { id: 'cambridge', name: 'Cambridge International' },
  { id: 'ib', name: 'International Baccalaureate' },
];

// Approximate first day of the next written exam session. Edit these (or the Django
// admin once seeded) when the boards publish their final timetables.
const sessions = [
  { id: 'may-2027', name: 'May/June 2027 session', starts: '2027-04-26', approximate: true },
  { id: 'nov-2027', name: 'October/November 2027 session', starts: '2027-10-04', approximate: true },
];

const syllabuses = [igcse.syllabus, ...ib.syllabuses, ...rest.syllabuses];
const topics = [
  ...igcse.topics.map((t) => ({ syllabus: 'igcse-0580', ...t })),
  ...ib.topics,
  ...rest.topics,
];
const rawQuestions = [...igcse.questions, ...ib.questions, ...rest.questions];
const checklists = rest.checklists;

const topicById = new Map();
for (const t of topics) {
  if (topicById.has(t.id)) fail(`duplicate topic id ${t.id}`);
  topicById.set(t.id, t);
  const syl = syllabuses.find((s) => s.slug === t.syllabus);
  if (!syl) fail(`topic ${t.id}: unknown syllabus ${t.syllabus}`);
  else if (!syl.sections.some((s) => s.slug === t.section)) fail(`topic ${t.id}: unknown section ${t.section}`);
}

const markValue = (code) => {
  const m = /^[A-Z]+(\d+)$/.exec(code);
  if (!m) fail(`bad mark code ${code}`);
  return m ? Number(m[1]) : 0;
};

const seenQ = new Set();
const questions = rawQuestions.map(([id, topic, difficulty, marks, calc, stem, parts, scheme, answer, extra]) => {
  if (seenQ.has(id)) fail(`duplicate question id ${id}`);
  seenQ.add(id);
  const t = topicById.get(topic);
  if (!t) fail(`question ${id}: unknown topic ${topic}`);
  if (!['easy', 'medium', 'hard', 'exam'].includes(difficulty)) fail(`question ${id}: bad difficulty`);
  const schemeTotal = scheme.reduce((s, [code]) => s + markValue(code), 0);
  if (schemeTotal !== marks) fail(`question ${id}: mark scheme totals ${schemeTotal}, question is worth ${marks}`);
  if (parts) {
    const partTotal = parts.reduce((s, p) => s + p[2], 0);
    if (partTotal !== marks) fail(`question ${id}: parts total ${partTotal}, question is worth ${marks}`);
  }
  return {
    id,
    topic,
    slug: `${t ? t.slug : topic}-${difficulty}-${id}`,
    difficulty,
    marks,
    calc,
    stem,
    parts: parts ? parts.map(([label, text, m]) => ({ label, text, marks: m })) : [],
    scheme: scheme.map(([mark, text]) => ({ mark, text })),
    answer,
    video: null,
    ...(extra || {}),
  };
});

for (const c of checklists) {
  for (const item of c.items) if (item.topic && !topicById.has(item.topic)) fail(`checklist ${c.slug}: unknown topic ${item.topic}`);
}

// ---- LaTeX validation -------------------------------------------------------
// Same tokenising rules as frontend/src/components/learn/MathText.tsx.
export function mathSegments(text) {
  const out = [];
  const re = /\$\$([\s\S]+?)\$\$|(?<!\\)\$((?:\\.|[^$\\])+?)\$/g;
  let m;
  while ((m = re.exec(text))) out.push({ tex: m[1] ?? m[2], display: m[1] !== undefined });
  return out;
}

let katex = null;
try {
  const require = createRequire(import.meta.url);
  katex = require('katex');
} catch {
  console.warn('katex not found: skipping LaTeX validation (set NODE_PATH or `npm i katex` to enable).');
}
const checkText = (where, text) => {
  if (typeof text !== 'string') return;
  const dollars = text.replace(/\\\$/g, '').split('$').length - 1;
  if (dollars % 2) fail(`${where}: unbalanced $ in "${text.slice(0, 60)}"`);
  if (!katex) return;
  for (const seg of mathSegments(text)) {
    try {
      katex.renderToString(seg.tex, { displayMode: seg.display, throwOnError: true, strict: 'error' });
    } catch (e) {
      fail(`${where}: ${e.message}`);
    }
  }
};
const checkTex = (where, tex) => checkText(where, `$$${tex}$$`);

for (const t of topics) {
  checkText(`topic ${t.id} summary`, t.summary);
  t.notes.points.forEach((p) => checkText(`topic ${t.id} point`, p));
  t.notes.traps.forEach((p) => checkText(`topic ${t.id} trap`, p));
  t.notes.gdc.forEach((p) => checkText(`topic ${t.id} gdc`, p));
  t.notes.formulas.forEach((f) => checkTex(`topic ${t.id} formula ${f.label}`, f.tex));
  if (t.investigation) {
    checkText(`topic ${t.id} investigation`, t.investigation.intro);
    t.investigation.steps.forEach((s) => checkText(`topic ${t.id} step`, s.reveal));
  }
}
for (const q of questions) {
  checkText(`question ${q.id} stem`, q.stem);
  checkText(`question ${q.id} answer`, q.answer);
  q.parts.forEach((p) => checkText(`question ${q.id} part ${p.label}`, p.text));
  q.scheme.forEach((s) => checkText(`question ${q.id} scheme`, s.text));
}
for (const c of checklists) c.items.forEach((i) => checkText(`checklist ${c.slug}`, i.text));

if (errors.length) {
  console.error(`Content has ${errors.length} problem(s):\n - ${errors.join('\n - ')}`);
  process.exit(1);
}

const catalog = { version: 1, boards, sessions, syllabuses, topics, questions, checklists };
const json = JSON.stringify(catalog, null, 1) + '\n';
for (const rel of ['../frontend/src/data/catalog.json', '../backend/apps/learn/seed/catalog.json']) {
  const file = resolve(here, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, json);
  console.log('wrote', file);
}
console.log(`${syllabuses.length} syllabuses, ${topics.length} topics, ${questions.length} questions, ${checklists.length} checklists`);
