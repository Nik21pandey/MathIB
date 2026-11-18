import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { WithCatalog, type CatalogIndex } from '../../learn/catalog';
import { topicMastery, useProgress } from '../../learn/progress';
import { topicSpec } from '../../learn/quiz';
import { useSeo } from '../../learn/seo';
import { MasteryDot, Tag, EmptyState } from '../../components/learn/ui';

const pill = 'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border transition-colors';

const ContentsTable: React.FC<{ index: CatalogIndex }> = ({ index }) => {
  const progress = useProgress();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [syllabus, setSyllabus] = useState('all');
  const quizSeed = useMemo(() => Math.floor(Math.random() * 90000) + 10000, []);

  const live = index.catalog.syllabuses.filter((s) => s.status === 'live');
  const rows = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return index.catalog.topics
      .filter((t) => syllabus === 'all' || t.syllabus === syllabus)
      .map((t) => {
        const syl = index.syllabus(t.syllabus);
        const section = syl?.sections.find((s) => s.slug === t.section);
        const haystack = `${t.name} ${t.summary} ${syl?.name ?? ''} ${syl?.short ?? ''} ${syl?.code ?? ''} ${section?.name ?? ''}`.toLowerCase();
        return { topic: t, syl, section, haystack };
      })
      .filter((r) => words.every((w) => r.haystack.includes(w)))
      .sort((a, b) => a.topic.name.localeCompare(b.topic.name));
  }, [index, query, syllabus]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">Contents</h1>
      <p className="text-gray-600 mt-1 mb-5">Every topic on one page. Type a topic and go straight to the notes, the drill or the exam questions.</p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try "surds", "binomial" or "criterion B"'
          aria-label="Search topics"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Filter by syllabus">
        {[{ slug: 'all', short: 'All syllabuses' }, ...live].map((s) => (
          <button
            key={s.slug}
            type="button"
            aria-pressed={syllabus === s.slug}
            onClick={() => setSyllabus(s.slug)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border ${syllabus === s.slug ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            {s.short}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState title={`No topics match "${query}".`}>Check the spelling or clear the search to see everything.</EmptyState>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Topic</th>
                <th scope="col" className="px-4 py-3 font-semibold hidden md:table-cell">Syllabus</th>
                <th scope="col" className="px-4 py-3 font-semibold">Go to</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(({ topic, syl, section }) => {
                const path = index.topicPath(topic);
                const count = index.questionsOf(topic.id).length;
                return (
                  <tr key={topic.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MasteryDot mastery={topicMastery(progress, index, topic.id)} />
                        <Link to={path} className="font-medium text-gray-900 hover:text-blue-600">{topic.name}</Link>
                        {topic.tag && <Tag tone="blue">{topic.tag}</Tag>}
                      </div>
                      <div className="md:hidden text-xs text-gray-500 mt-0.5 ml-4">{syl?.short}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                      <Link to={`/${topic.syllabus}`} className="hover:text-blue-600">{syl?.short}</Link>
                      <span className="text-gray-400"> · {section?.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Link to={`${path}?tab=notes`} className={`${pill} border-blue-200 text-blue-700 hover:bg-blue-50`}>Notes</Link>
                        {topic.investigation && (
                          <Link to={`${path}?tab=investigate`} className={`${pill} border-purple-200 text-purple-700 hover:bg-purple-50`}>Investigation</Link>
                        )}
                        {topic.generators.length > 0 && (
                          <Link to={`${path}?tab=drills`} className={`${pill} border-emerald-200 text-emerald-700 hover:bg-emerald-50`}>Skill drill</Link>
                        )}
                        {count > 0 && (
                          <Link to={`${path}?tab=exam`} className={`${pill} border-indigo-200 text-indigo-700 hover:bg-indigo-50`}>Exam questions ({count})</Link>
                        )}
                        {topic.generators.length > 0 && (
                          <Link to={`/quiz/${topicSpec(topic.id, quizSeed)}`} className={`${pill} border-amber-200 text-amber-700 hover:bg-amber-50`}>Quiz</Link>
                        )}
                        {topic.video && (
                          <a href={topic.video} target="_blank" rel="noopener noreferrer" className={`${pill} border-gray-200 text-gray-700 hover:bg-gray-50`}>Video</a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-gray-500">{rows.length} of {index.catalog.topics.length} topics. The dot shows your progress: grey not started, red needs work, amber improving, green strong.</p>
    </div>
  );
};

const Contents: React.FC = () => {
  useSeo({
    title: 'Contents: every maths topic with notes, drills and exam questions',
    description: 'One searchable index of IGCSE, IB MYP, IB Diploma and A Level maths topics. Jump straight to revision notes, fluency drills and graded exam questions.',
    path: '/contents',
  });
  return <WithCatalog>{(index) => <ContentsTable index={index} />}</WithCatalog>;
};

export default Contents;
