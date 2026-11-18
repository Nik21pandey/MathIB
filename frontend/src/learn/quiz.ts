import { GENERATORS, LEVELS, generatorById, hashString, mulberry32, shuffle } from './generators';
import type { CatalogIndex } from './catalog';

export interface QuizItem {
  key: string;
  skill: string;
  prompt: string;
  options: string[];
  correct: number;
}

export interface Quiz {
  spec: string;
  kind: 'daily' | 'topic';
  title: string;
  subtitle: string;
  topicId?: string;
  items: QuizItem[];
}

export const QUIZ_LENGTH = 5;

/** Local calendar date as yyyymmdd. */
export function todayKey(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}

export function formatDateKey(key: string): string {
  const d = new Date(Number(key.slice(0, 4)), Number(key.slice(4, 6)) - 1, Number(key.slice(6, 8)));
  return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

export const dailySpec = (level: string, dateKey = todayKey()) => `d.${level}.${dateKey}`;
export const topicSpec = (topicId: string, seed = Math.floor(Math.random() * 90000) + 10000) => `t.${topicId}.${seed}`;

function makeItems(spec: string, generatorIds: string[]): QuizItem[] {
  const rng = mulberry32(hashString(spec));
  const order = shuffle(rng, generatorIds);
  const items: QuizItem[] = [];
  for (let i = 0; i < QUIZ_LENGTH; i++) {
    const gen = generatorById(order[i % order.length]);
    if (!gen) continue;
    // Avoid showing the same question twice when one skill is used more than once.
    let made = gen.make(rng);
    for (let tries = 0; tries < 20 && items.some((it) => it.prompt === made.prompt); tries++) made = gen.make(rng);
    const options = shuffle(rng, [made.answer, ...made.distractors]);
    items.push({ key: `${spec}:${i}`, skill: gen.title, prompt: made.prompt, options, correct: options.indexOf(made.answer) });
  }
  return items;
}

/**
 * Rebuilds a quiz from its spec string. The spec is all that travels in a challenge
 * link, so two people opening the same link always get the same five questions.
 *
 *   d.<level>.<yyyymmdd>   Daily 5 for a level
 *   t.<topicId>.<seed>     topic quiz
 */
export function buildQuiz(spec: string, index: CatalogIndex): Quiz | null {
  const [kind, id, seed] = spec.split('.');
  if (!kind || !id || !seed || !/^\d+$/.test(seed)) return null;
  if (kind === 'd') {
    const level = LEVELS.find((l) => l.id === id);
    if (!level || seed.length !== 8) return null;
    return {
      spec,
      kind: 'daily',
      title: `Daily 5: ${level.label}`,
      subtitle: formatDateKey(seed),
      items: makeItems(spec, level.generators),
    };
  }
  if (kind === 't') {
    const topic = index.topic(id);
    if (!topic || topic.generators.length === 0) return null;
    const syllabus = index.syllabus(topic.syllabus);
    return {
      spec,
      kind: 'topic',
      title: `${topic.name}: 5-question quiz`,
      subtitle: syllabus ? syllabus.short : '',
      topicId: topic.id,
      items: makeItems(spec, topic.generators),
    };
  }
  return null;
}

export interface DrillItem { prompt: string; answer: string }

/** A page of fluency questions for one skill. A new seed gives a new page, forever. */
export function makeDrill(generatorId: string, seed: number, count = 10): DrillItem[] {
  const gen = generatorById(generatorId);
  if (!gen) return [];
  const rng = mulberry32(hashString(`${generatorId}:${seed}`));
  const out: DrillItem[] = [];
  for (let guard = 0; out.length < count && guard < count * 20; guard++) {
    const made = gen.make(rng);
    if (!out.some((d) => d.prompt === made.prompt)) out.push({ prompt: made.prompt, answer: made.answer });
  }
  return out;
}

export const generatorTitle = (id: string) => GENERATORS.find((g) => g.id === id)?.title ?? id;

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;
}
