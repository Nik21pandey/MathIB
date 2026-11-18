import React, { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Calculator, Eye, EyeOff, Lightbulb, PlayCircle, Printer, RefreshCw, Zap } from 'lucide-react';
import { WithCatalog, type CatalogIndex } from '../../learn/catalog';
import type { Difficulty, Syllabus, Topic } from '../../learn/types';
import { DIFFICULTY_LABEL, DIFFICULTY_ORDER } from '../../learn/types';
import { generatorTitle, makeDrill, topicSpec } from '../../learn/quiz';
import { topicMastery, useProgress } from '../../learn/progress';
import { worksheetCode } from '../../learn/share';
import { useSeo } from '../../learn/seo';
import { useWorksheet } from '../../contexts/WorksheetContext';
import MathText, { MathBlock } from '../../components/learn/MathText';
import QuestionCard from '../../components/learn/QuestionCard';
import Investigation, { BandsTable } from '../../components/learn/Investigation';
import { Breadcrumbs, EmptyState, MasteryDot, NotFound, Tag } from '../../components/learn/ui';

type TabId = 'investigate' | 'notes' | 'drills' | 'exam';

const NotesTab: React.FC<{ topic: Topic }> = ({ topic }) => (
  <div className="space-y-5">
    {topic.video && (
      <a href={topic.video} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 font-medium hover:bg-gray-50">
        <PlayCircle className="h-5 w-5 text-red-600" aria-hidden="true" /> Watch the topic video
      </a>
    )}
    <section className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-900 mb-3">Key points</h2>
      <ul className="space-y-2.5">
        {topic.notes.points.map((p, i) => (
          <li key={i} className="flex gap-3 text-gray-800 leading-relaxed">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" aria-hidden="true" />
            <MathText text={p} className="flex-1" />
          </li>
        ))}
      </ul>
    </section>

    {topic.notes.formulas.length > 0 && (
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Cheat sheet</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {topic.notes.formulas.map((f) => (
            <div key={f.label} className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-2">
              <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{f.label}</div>
              <MathBlock tex={f.tex} className="text-gray-900" />
            </div>
          ))}
        </div>
      </section>
    )}

    {topic.notes.gdc.length > 0 && (
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
          <Calculator className="h-5 w-5 text-gray-600" aria-hidden="true" /> Calculator keystrokes
        </h2>
        <ul className="space-y-2">
          {topic.notes.gdc.map((g, i) => <li key={i} className="text-gray-800"><MathText text={g} /></li>)}
        </ul>
      </section>
    )}

    {topic.notes.traps.length > 0 && (
      <section className="bg-amber-50 rounded-xl border border-amber-200 p-5">
        <h2 className="flex items-center gap-2 font-semibold text-amber-900 mb-3">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" /> Examiner traps
        </h2>
        <ul className="space-y-2">
          {topic.notes.traps.map((t, i) => (
            <li key={i} className="flex gap-3 text-gray-800">
              <Lightbulb className="h-4 w-4 mt-1 text-amber-600 flex-shrink-0" aria-hidden="true" />
              <MathText text={t} className="flex-1" />
            </li>
          ))}
        </ul>
      </section>
    )}
  </div>
);

const DrillsTab: React.FC<{ topic: Topic }> = ({ topic }) => {
  const [generator, setGenerator] = useState(topic.generators[0]);
  const [seed, setSeed] = useState(1);
  const [shown, setShown] = useState<number[]>([]);
  const [showAll, setShowAll] = useState(false);
  const items = useMemo(() => makeDrill(generator, seed, 12), [generator, seed]);
  const quizSeed = useMemo(() => Math.floor(Math.random() * 90000) + 10000, []);

  if (topic.generators.length === 0) {
    return (
      <EmptyState title="No fluency drill for this topic yet.">
        This topic needs a calculator or written reasoning, so practise it in the exam bank.
      </EmptyState>
    );
  }
  const reset = (fn: () => void) => {
    fn();
    setShown([]);
    setShowAll(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        {topic.generators.length > 1 && topic.generators.map((g) => (
          <button
            key={g}
            type="button"
            aria-pressed={generator === g}
            onClick={() => reset(() => setGenerator(g))}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border ${generator === g ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            {generatorTitle(g)}
          </button>
        ))}
        <span className="ml-auto flex flex-wrap gap-2">
          <button type="button" onClick={() => setShowAll((v) => !v)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
            {showAll ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            {showAll ? 'Hide answers' : 'Show all answers'}
          </button>
          <button type="button" onClick={() => reset(() => setSeed((s) => s + 1))} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> New set
          </button>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
            <Printer className="h-4 w-4" aria-hidden="true" /> Print drill
          </button>
          <Link to={`/quiz/${topicSpec(topic.id, quizSeed)}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
            <Zap className="h-4 w-4" aria-hidden="true" /> Timed 5-question quiz
          </Link>
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-1">{generatorTitle(generator)}: set {seed}</h2>
        <p className="text-sm text-gray-600 mb-4 print:hidden">Short, repetitive questions to build speed. Tap a question to check its answer. Every new set is different.</p>
        <ol className="grid md:grid-cols-2 gap-x-8 gap-y-3 list-decimal list-inside">
          {items.map((item, i) => {
            const open = showAll || shown.includes(i);
            return (
              <li key={`${generator}-${seed}-${i}`} className="text-gray-900 marker:text-gray-500 marker:font-medium">
                <button
                  type="button"
                  onClick={() => setShown((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]))}
                  aria-expanded={open}
                  className="text-left hover:text-blue-700"
                >
                  <MathText text={item.prompt} />
                </button>
                {open && (
                  <div className="ml-5 mt-1 text-emerald-700 font-medium print:hidden">
                    <MathText text={item.answer} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="hidden print:block">
        <h3 className="font-semibold mt-6 mb-2">Answers</h3>
        <ol className="grid grid-cols-3 gap-x-6 gap-y-1 list-decimal list-inside text-sm">
          {items.map((item, i) => <li key={i}><MathText text={item.answer} /></li>)}
        </ol>
      </div>
    </div>
  );
};

const ExamTab: React.FC<{ index: CatalogIndex; topic: Topic; syllabus: Syllabus }> = ({ index, topic, syllabus }) => {
  const worksheet = useWorksheet();
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const all = index.questionsOf(topic.id);
  const shown = all.filter((q) => difficulty === 'all' || q.difficulty === difficulty);

  if (all.length === 0) return <EmptyState title="Exam questions for this topic are on their way." />;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span role="group" aria-label="Filter by difficulty" className="flex flex-wrap gap-2">
          {(['all', ...DIFFICULTY_ORDER] as const).map((d) => {
            const n = d === 'all' ? all.length : all.filter((q) => q.difficulty === d).length;
            if (n === 0) return null;
            return (
              <button
                key={d}
                type="button"
                aria-pressed={difficulty === d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1 rounded-full text-sm font-medium border ${difficulty === d ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                {d === 'all' ? 'All' : DIFFICULTY_LABEL[d]} ({n})
              </button>
            );
          })}
        </span>
        <span className="ml-auto flex flex-wrap gap-2">
          <button type="button" onClick={() => worksheet.addMany(shown.map((q) => q.id))} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
            Add all to worksheet
          </button>
          <Link
            to={`/worksheet/print?ids=${worksheetCode(shown.map((q) => q.id))}&title=${encodeURIComponent(`${syllabus.short}: ${topic.name}`)}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
          >
            <Printer className="h-4 w-4" aria-hidden="true" /> Print as worksheet
          </Link>
        </span>
      </div>
      <p className="text-sm text-gray-600">Questions run from easy to exam-style. Try each one on paper before opening the mark scheme.</p>
      {shown.map((q, i) => <QuestionCard key={q.id} question={q} number={i + 1} />)}
      {topic.bands && <BandsTable bands={topic.bands} />}
    </div>
  );
};

const Workspace: React.FC<{ index: CatalogIndex; topic: Topic; syllabus: Syllabus }> = ({ index, topic, syllabus }) => {
  const progress = useProgress();
  const [params, setParams] = useSearchParams();
  const section = syllabus.sections.find((s) => s.slug === topic.section);
  const questionCount = index.questionsOf(topic.id).length;

  const tabs: { id: TabId; label: string }[] = [
    ...(topic.investigation ? [{ id: 'investigate' as TabId, label: 'Investigation' }] : []),
    { id: 'notes', label: 'Notes and cheat sheet' },
    { id: 'drills', label: 'Fluency drills' },
    { id: 'exam', label: `Exam bank (${questionCount})` },
  ];
  const requested = params.get('tab') as TabId | null;
  const active = tabs.some((t) => t.id === requested) ? (requested as TabId) : tabs[0].id;

  const path = index.topicPath(topic);
  useSeo({
    title: `${topic.name}: ${syllabus.short} notes, drills and exam questions`,
    description: `${topic.summary} Revision notes, fluency drills and ${questionCount} graded exam questions with mark schemes for ${syllabus.name}.`,
    path,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: `${topic.name} (${syllabus.short})`,
      description: topic.summary,
      learningResourceType: ['Revision notes', 'Practice questions'],
      educationalLevel: syllabus.name,
      teaches: topic.name,
      isAccessibleForFree: true,
    },
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Breadcrumbs items={[
        { label: 'Learn', to: '/learn' },
        { label: syllabus.short, to: `/${syllabus.slug}` },
        { label: section?.name ?? topic.section, to: `/${syllabus.slug}/${topic.section}` },
        { label: topic.name },
      ]} />
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-3xl font-bold text-gray-900 mr-2">{topic.name}</h1>
        {topic.tag && <Tag tone="blue">{topic.tag}</Tag>}
        {topic.removedIn && <Tag tone="orange">Leaves the syllabus in 2029</Tag>}
      </div>
      <p className="text-gray-600 mt-1">{topic.summary}</p>
      <div className="mt-2 mb-5"><MasteryDot mastery={topicMastery(progress, index, topic.id)} showLabel /></div>

      <div role="tablist" aria-label="Topic sections" className="flex flex-wrap gap-1 border-b border-gray-200 mb-6 print:hidden">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            id={`tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setParams({ tab: t.id }, { replace: true })}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${active === t.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`}>
        {active === 'investigate' && topic.investigation && <Investigation data={topic.investigation} />}
        {active === 'notes' && <NotesTab topic={topic} />}
        {active === 'drills' && <DrillsTab topic={topic} />}
        {active === 'exam' && <ExamTab index={index} topic={topic} syllabus={syllabus} />}
      </div>
    </div>
  );
};

const TopicWorkspace: React.FC = () => {
  const { syllabus: syllabusSlug, section, topic: topicSlug } = useParams();
  return (
    <WithCatalog>
      {(index) => {
        const syllabus = index.syllabus(syllabusSlug);
        const topic = index.topicBySlug(syllabusSlug, section, topicSlug);
        if (!syllabus || !topic) return <NotFound what="topic" />;
        return <Workspace key={topic.id} index={index} topic={topic} syllabus={syllabus} />;
      }}
    </WithCatalog>
  );
};

export default TopicWorkspace;
