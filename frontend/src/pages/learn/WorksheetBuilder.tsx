import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, Check, ClipboardList, Copy, FileText, Plus, Trash2 } from 'lucide-react';
import { WithCatalog, type CatalogIndex } from '../../learn/catalog';
import type { Difficulty, Question } from '../../learn/types';
import { DIFFICULTY_LABEL, DIFFICULTY_ORDER, MINUTES_PER_MARK } from '../../learn/types';
import { absoluteUrl, copyText, worksheetCode } from '../../learn/share';
import { plainText, useSeo } from '../../learn/seo';
import { useWorksheet } from '../../contexts/WorksheetContext';
import MathText from '../../components/learn/MathText';
import { DifficultyBadge, EmptyState, Tag } from '../../components/learn/ui';

const selectClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500';

const Builder: React.FC<{ index: CatalogIndex }> = ({ index }) => {
  const worksheet = useWorksheet();
  const [syllabus, setSyllabus] = useState('all');
  const [topic, setTopic] = useState('all');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [calc, setCalc] = useState<'all' | 'non' | 'calc'>('all');
  const [copied, setCopied] = useState(false);

  const live = index.catalog.syllabuses.filter((s) => s.status === 'live');
  const topicOptions = index.catalog.topics.filter((t) => syllabus === 'all' || t.syllabus === syllabus);

  const available = useMemo(
    () =>
      index.catalog.questions.filter((q) => {
        const t = index.topic(q.topic);
        if (!t) return false;
        if (syllabus !== 'all' && t.syllabus !== syllabus) return false;
        if (topic !== 'all' && q.topic !== topic) return false;
        if (difficulty !== 'all' && q.difficulty !== difficulty) return false;
        if (calc === 'non' && q.calc) return false;
        if (calc === 'calc' && !q.calc) return false;
        return true;
      }),
    [index, syllabus, topic, difficulty, calc],
  );

  const chosen = worksheet.ids.map((id) => index.question(id)).filter((q): q is Question => Boolean(q));
  const marks = chosen.reduce((s, q) => s + q.marks, 0);
  const minutes = Math.round(marks * MINUTES_PER_MARK);
  const code = worksheetCode(chosen.map((q) => q.id));
  const printUrl = (mode: 'student' | 'scheme') => `/worksheet/print?mode=${mode}&ids=${code}&title=${encodeURIComponent(worksheet.title)}`;

  const copyLink = async () => {
    if (await copyText(absoluteUrl(`/w/${code}`))) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">Worksheet and paper builder</h1>
      <p className="text-gray-600 mt-1 mb-6">Tick questions here or anywhere on the site, then export a student question booklet and a matching mark scheme.</p>

      <div className="grid lg:grid-cols-5 gap-6">
        <section className="lg:col-span-3 space-y-4" aria-label="Question picker">
          <div className="bg-white rounded-xl border border-gray-200 p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <label className="text-sm font-medium text-gray-700">
              Syllabus
              <select className={`${selectClass} mt-1`} value={syllabus} onChange={(e) => { setSyllabus(e.target.value); setTopic('all'); }}>
                <option value="all">All syllabuses</option>
                {live.map((s) => <option key={s.slug} value={s.slug}>{s.short}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Topic
              <select className={`${selectClass} mt-1`} value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="all">All topics</option>
                {topicOptions.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Difficulty
              <select className={`${selectClass} mt-1`} value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty | 'all')}>
                <option value="all">Any difficulty</option>
                {DIFFICULTY_ORDER.map((d) => <option key={d} value={d}>{DIFFICULTY_LABEL[d]}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Calculator
              <select className={`${selectClass} mt-1`} value={calc} onChange={(e) => setCalc(e.target.value as 'all' | 'non' | 'calc')}>
                <option value="all">Either</option>
                <option value="non">Non-calculator only</option>
                <option value="calc">Calculator only</option>
              </select>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{available.length} questions match</p>
            <button type="button" onClick={() => worksheet.addMany(available.map((q) => q.id))} disabled={available.length === 0} className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-40">
              Add all {available.length}
            </button>
          </div>

          <ul className="space-y-2">
            {available.map((q) => {
              const on = worksheet.has(q.id);
              const t = index.topic(q.topic);
              return (
                <li key={q.id}>
                  <label className={`flex gap-3 items-start bg-white rounded-xl border p-4 cursor-pointer ${on ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 hover:border-blue-400'}`}>
                    <input type="checkbox" checked={on} onChange={() => worksheet.toggle(q.id)} className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="flex-1 min-w-0">
                      <span className="flex flex-wrap items-center gap-2 mb-1">
                        <DifficultyBadge difficulty={q.difficulty} />
                        {!q.calc && <Tag tone="orange">Non-calculator</Tag>}
                        {q.criterion && <Tag tone="purple">Criterion {q.criterion}</Tag>}
                        <span className="text-xs text-gray-500">{t?.name}</span>
                        <span className="ml-auto text-sm text-gray-600">[{q.marks}]</span>
                      </span>
                      <MathText text={q.stem} className="text-gray-900 text-sm" />
                    </span>
                    <span className={`flex-shrink-0 rounded-full p-1 ${on ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`} aria-hidden="true">
                      {on ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="lg:col-span-2" aria-label="Your worksheet">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:sticky lg:top-4">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
              <ClipboardList className="h-5 w-5 text-blue-600" aria-hidden="true" /> Your worksheet
            </h2>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Title
              <input type="text" value={worksheet.title} onChange={(e) => worksheet.setTitle(e.target.value)} className={`${selectClass} mt-1`} />
            </label>

            <dl className="grid grid-cols-3 gap-2 text-center mb-4">
              {[['Questions', chosen.length], ['Marks', marks], ['Minutes', minutes]].map(([label, value]) => (
                <div key={label} className="bg-gray-50 rounded-lg py-2">
                  <dd className="text-xl font-bold text-gray-900">{value}</dd>
                  <dt className="text-xs text-gray-500">{label}</dt>
                </div>
              ))}
            </dl>
            <p className="text-xs text-gray-500 -mt-2 mb-4">Time allowance is {MINUTES_PER_MARK} minutes per mark.</p>

            {chosen.length === 0 ? (
              <EmptyState title="No questions yet.">Tick questions on the left, or use "Add to worksheet" on any question.</EmptyState>
            ) : (
              <>
                <ol className="space-y-1.5 mb-4 max-h-80 overflow-y-auto pr-1">
                  {chosen.map((q, i) => (
                    <li key={q.id} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-2 py-1.5">
                      <span className="w-5 text-gray-500 text-right">{i + 1}.</span>
                      <span className="flex-1 truncate text-gray-800" title={plainText(q.stem)}>{plainText(q.stem)}</span>
                      <span className="text-xs text-gray-500">[{q.marks}]</span>
                      <button type="button" onClick={() => worksheet.move(q.id, -1)} disabled={i === 0} aria-label={`Move question ${i + 1} up`} className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30">
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => worksheet.move(q.id, 1)} disabled={i === chosen.length - 1} aria-label={`Move question ${i + 1} down`} className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30">
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => worksheet.remove(q.id)} aria-label={`Remove question ${i + 1}`} className="p-1 text-gray-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ol>
                <div className="space-y-2">
                  <Link to={printUrl('student')} target="_blank" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">
                    <FileText className="h-4 w-4" aria-hidden="true" /> Student question booklet (PDF)
                  </Link>
                  <Link to={printUrl('scheme')} target="_blank" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-blue-600 text-blue-700 font-medium hover:bg-blue-50">
                    <FileText className="h-4 w-4" aria-hidden="true" /> Teacher mark scheme (PDF)
                  </Link>
                  <button type="button" onClick={copyLink} className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
                    <Copy className="h-4 w-4" aria-hidden="true" /> {copied ? 'Link copied' : 'Copy link to online solutions'}
                  </button>
                  <button type="button" onClick={worksheet.clear} className="w-full text-sm text-gray-500 hover:text-red-600 py-1">Clear worksheet</button>
                </div>
                <p className="mt-3 text-xs text-gray-500">Each PDF opens in a new tab. Choose "Save as PDF" in the print dialog. Every page carries a QR code that takes students to the mark schemes.</p>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

const WorksheetBuilder: React.FC = () => {
  useSeo({
    title: 'Worksheet and exam paper builder for IGCSE, MYP, IB and A Level maths',
    description: 'Pick questions by syllabus, topic and difficulty, then export a student question booklet and a teacher mark scheme as PDFs.',
    path: '/worksheet-builder',
  });
  return <WithCatalog>{(index) => <Builder index={index} />}</WithCatalog>;
};

export default WorksheetBuilder;
