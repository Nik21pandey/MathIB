import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Calculator, Info, Printer } from 'lucide-react';
import { WithCatalog, type CatalogIndex } from '../../learn/catalog';
import type { Difficulty, Section, Syllabus, Topic } from '../../learn/types';
import { DIFFICULTY_LABEL, DIFFICULTY_ORDER } from '../../learn/types';
import { progressActions, topicMastery, useProgress } from '../../learn/progress';
import { worksheetCode } from '../../learn/share';
import { useSeo } from '../../learn/seo';
import { useWorksheet } from '../../contexts/WorksheetContext';
import { Breadcrumbs, MasteryDot, NotFound, ProgressBar, Tag } from '../../components/learn/ui';
import QuestionCard from '../../components/learn/QuestionCard';

const TopicRow: React.FC<{ index: CatalogIndex; topic: Topic; version?: string }> = ({ index, topic, version }) => {
  const progress = useProgress();
  const removed = Boolean(topic.removedIn) && version === topic.removedIn;
  const count = index.questionsOf(topic.id).length;
  return (
    <li>
      <Link
        to={index.topicPath(topic)}
        className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 ${removed ? 'opacity-50' : ''}`}
      >
        <MasteryDot mastery={topicMastery(progress, index, topic.id)} />
        <span className="flex-1 min-w-0">
          <span className={`font-medium text-gray-900 ${removed ? 'line-through' : ''}`}>{topic.name}</span>
          <span className="block text-sm text-gray-600 truncate">{topic.summary}</span>
        </span>
        {topic.tag && <Tag tone="blue">{topic.tag}</Tag>}
        {topic.removedIn && (
          <Tag tone="orange">{removed ? 'Not in the new syllabus' : 'Leaves in 2029'}</Tag>
        )}
        <span className="hidden sm:inline text-xs text-gray-500 whitespace-nowrap">{count} questions</span>
        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
      </Link>
    </li>
  );
};

const VersionToggle: React.FC<{ syllabus: Syllabus; version: string }> = ({ syllabus, version }) => {
  if (!syllabus.versions) return null;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Syllabus version</span>
        <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden" role="group" aria-label="Syllabus version">
          {syllabus.versions.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={version === v.id}
              onClick={() => progressActions.setVersion(syllabus.slug, v.id)}
              className={`px-4 py-2 text-sm font-medium text-left ${version === v.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {v.label}
              <span className={`block text-xs font-normal ${version === v.id ? 'text-blue-100' : 'text-gray-500'}`}>{v.detail}</span>
            </button>
          ))}
        </div>
      </div>
      {syllabus.versionNote && (
        <p className="mt-3 flex gap-2 text-sm text-gray-600">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" aria-hidden="true" />
          {syllabus.versionNote}
        </p>
      )}
      <div className="mt-6 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl p-5 text-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-gray-900 mb-1">
            Full Syllabus Exam Pack
          </span>
          <h2 className="text-lg font-bold">Want Combined Revision Notes, Topical Past Papers & Predicted Mock Papers for {syllabus.short}?</h2>
          <p className="text-sm text-blue-100 mt-0.5">Download printer-ready combined PDFs with full step-by-step examiner mark schemes.</p>
        </div>
        <Link to="/bundles" className="px-4 py-2.5 rounded-lg bg-white text-blue-800 font-semibold text-sm hover:bg-blue-50 flex-shrink-0">
          View {syllabus.short} PDF Bundles â†’
        </Link>
      </div>
    </div>
  );
};

const useVersion = (syllabus: Syllabus | undefined) => {
  const progress = useProgress();
  if (!syllabus?.versions) return undefined;
  return progress.versions[syllabus.slug] ?? syllabus.versions[0].id;
};

const Overview: React.FC<{ index: CatalogIndex; syllabus: Syllabus }> = ({ index, syllabus }) => {
  const progress = useProgress();
  const version = useVersion(syllabus);
  const topics = index.topicsOf(syllabus.slug).filter((t) => !(t.removedIn && version === t.removedIn));
  const strong = topics.filter((t) => topicMastery(progress, index, t.id).status === 'green').length;
  const checklists = index.catalog.checklists.filter((c) => c.syllabus === syllabus.slug);

  useSeo({
    title: `${syllabus.short} maths: topic notes, drills and exam questions`,
    description: `${syllabus.name}. ${syllabus.blurb}`,
    path: `/${syllabus.slug}`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: syllabus.name,
      description: syllabus.blurb,
      provider: { '@type': 'Organization', name: 'MathIB' },
    },
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Breadcrumbs items={[{ label: 'Learn', to: '/learn' }, { label: syllabus.short }]} />
      <h1 className="text-3xl font-bold text-gray-900">{syllabus.name}</h1>
      <p className="text-gray-600 mt-1 mb-5">{syllabus.blurb}</p>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <ProgressBar value={strong} max={topics.length} label="Topics you are strong on" />
          <p className="mt-2 text-xs text-gray-500">Mark exam questions as "Got it" and take topic quizzes to turn topics green.</p>
        </div>
        {syllabus.papers.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">The papers</h2>
            <ul className="space-y-1 text-sm text-gray-700">
              {syllabus.papers.map((p) => (
                <li key={p.name} className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-gray-500">{p.duration} Â· {p.marks} marks</span>
                  <Tag tone={p.calc ? 'gray' : 'orange'}>
                    <Calculator className="h-3 w-3 mr-1" aria-hidden="true" />{p.calc ? 'Calculator' : 'Non-calculator'}
                  </Tag>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {version && <VersionToggle syllabus={syllabus} version={version} />}

      <div className="space-y-6">
        {syllabus.sections.map((section) => {
          const sectionTopics = index.topicsOf(syllabus.slug, section.slug);
          if (sectionTopics.length === 0) return null;
          return (
            <section key={section.slug} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${section.hub ? 'border-blue-300' : 'border-gray-200'}`}>
              <div className={`px-4 py-3 border-b ${section.hub ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold text-gray-900">{section.name}</h2>
                  <Link to={`/${syllabus.slug}/${section.slug}`} className="text-sm font-medium text-blue-600 hover:underline">
                    {section.hub ? 'Open the hub' : 'All questions in this section'}
                  </Link>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{section.blurb}</p>
              </div>
              <ul className="divide-y divide-gray-100">
                {sectionTopics.map((t) => <TopicRow key={t.id} index={index} topic={t} version={version} />)}
              </ul>
            </section>
          );
        })}
      </div>

      {checklists.length > 0 && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h2 className="font-semibold text-gray-900 mb-1">Exam tomorrow?</h2>
          <ul className="text-sm space-y-1">
            {checklists.map((c) => (
              <li key={c.slug}><Link to={`/crash/${c.slug}`} className="text-blue-700 hover:underline">{c.title}</Link></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const SectionView: React.FC<{ index: CatalogIndex; syllabus: Syllabus; section: Section }> = ({ index, syllabus, section }) => {
  const worksheet = useWorksheet();
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const topics = index.topicsOf(syllabus.slug, section.slug);
  const all = topics.flatMap((t) => index.questionsOf(t.id));
  const shown = all
    .filter((q) => difficulty === 'all' || q.difficulty === difficulty)
    .sort((a, b) => DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty));
  const path = `/${syllabus.slug}/${section.slug}`;

  useSeo({
    title: `${syllabus.short} ${section.name}: ${all.length} practice questions with mark schemes`,
    description: section.blurb,
    path,
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Breadcrumbs items={[{ label: 'Learn', to: '/learn' }, { label: syllabus.short, to: `/${syllabus.slug}` }, { label: section.name }]} />
      <h1 className="text-3xl font-bold text-gray-900">{section.name}</h1>
      <p className="text-gray-600 mt-1 mb-5 max-w-3xl">{section.blurb}</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {topics.map((t) => (
          <Link key={t.id} to={index.topicPath(t)} className="rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-500 transition">
            <span className="flex items-center gap-2 font-medium text-gray-900">
              {t.name}
              {t.tag && <Tag tone="blue">{t.tag}</Tag>}
            </span>
            <span className="block text-sm text-gray-600 mt-1">{t.summary}</span>
            <span className="block text-xs text-gray-500 mt-2">Notes Â· drills Â· {index.questionsOf(t.id).length} exam questions</span>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mr-2">All {all.length} questions</h2>
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
        <span className="ml-auto flex gap-2">
          <button type="button" onClick={() => worksheet.addMany(shown.map((q) => q.id))} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
            Add these {shown.length} to worksheet
          </button>
          <Link
            to={`/worksheet/print?ids=${worksheetCode(shown.map((q) => q.id))}&title=${encodeURIComponent(`${syllabus.short}: ${section.name}`)}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
          >
            <Printer className="h-4 w-4" aria-hidden="true" /> Print as worksheet
          </Link>
        </span>
      </div>
      <div className="space-y-4">
        {shown.map((q, i) => <QuestionCard key={q.id} question={q} number={i + 1} showTopic />)}
      </div>
    </div>
  );
};

const SyllabusPage: React.FC = () => {
  const { syllabus: syllabusSlug, section: sectionSlug } = useParams();
  return (
    <WithCatalog>
      {(index) => {
        const syllabus = index.syllabus(syllabusSlug);
        if (!syllabus || syllabus.status !== 'live') return <NotFound what="page" />;
        if (!sectionSlug) return <Overview index={index} syllabus={syllabus} />;
        const section = syllabus.sections.find((s) => s.slug === sectionSlug);
        if (!section) return <NotFound what="section" />;
        return <SectionView key={section.slug} index={index} syllabus={syllabus} section={section} />;
      }}
    </WithCatalog>
  );
};

export default SyllabusPage;

