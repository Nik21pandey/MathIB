import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { WithCatalog, type CatalogIndex } from '../../learn/catalog';
import type { Question } from '../../learn/types';
import { DIFFICULTY_LABEL } from '../../learn/types';
import { plainText, useSeo } from '../../learn/seo';
import { parseWorksheetCode } from '../../learn/share';
import QuestionCard from '../../components/learn/QuestionCard';
import { Breadcrumbs, DifficultyBadge, EmptyState, NotFound } from '../../components/learn/ui';

const Single: React.FC<{ index: CatalogIndex; question: Question }> = ({ index, question }) => {
  const topic = index.topic(question.topic);
  const syllabus = index.syllabus(topic?.syllabus);
  const others = index.questionsOf(question.topic).filter((q) => q.id !== question.id);
  const stem = plainText(question.stem);

  useSeo({
    title: `${stem.slice(0, 70)} - ${syllabus?.short ?? ''} ${topic?.name ?? ''} worked solution`,
    description: `${stem} Step-by-step mark scheme (${question.marks} marks, ${DIFFICULTY_LABEL[question.difficulty].toLowerCase()}) for ${syllabus?.name ?? 'maths'}.`,
    path: index.questionPath(question),
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Quiz',
      name: `${topic?.name ?? 'Maths'} practice question`,
      about: { '@type': 'Thing', name: topic?.name },
      educationalLevel: syllabus?.name,
      hasPart: {
        '@type': 'Question',
        text: stem,
        acceptedAnswer: { '@type': 'Answer', text: plainText(question.answer) },
      },
    },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {topic && syllabus && (
        <Breadcrumbs items={[
          { label: syllabus.short, to: `/${syllabus.slug}` },
          { label: topic.name, to: index.topicPath(topic) },
          { label: 'Question' },
        ]} />
      )}
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{topic?.name}: {DIFFICULTY_LABEL[question.difficulty].toLowerCase()} question with mark scheme</h1>
      <QuestionCard question={question} />

      {others.length > 0 && topic && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">More {topic.name} questions</h2>
          <ul className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {others.map((q) => (
              <li key={q.id}>
                <Link to={index.questionPath(q)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                  <DifficultyBadge difficulty={q.difficulty} />
                  <span className="flex-1 text-sm text-gray-800 truncate">{plainText(q.stem)}</span>
                  <span className="text-xs text-gray-500">[{q.marks}]</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm">
            <Link to={`${index.topicPath(topic)}?tab=notes`} className="text-blue-600 hover:underline">Revise the notes for {topic.name}</Link>
          </p>
        </section>
      )}
    </div>
  );
};

/** /question/:slug - one question on its own indexable page. */
export const QuestionPage: React.FC = () => {
  const { slug } = useParams();
  return (
    <WithCatalog>
      {(index) => {
        const question = index.questionBySlug(slug);
        return question ? <Single key={question.id} index={index} question={question} /> : <NotFound what="question" />;
      }}
    </WithCatalog>
  );
};

const Solutions: React.FC<{ index: CatalogIndex; ids: string[] }> = ({ index, ids }) => {
  const questions = ids.map((id) => index.question(id)).filter((q): q is Question => Boolean(q));
  useSeo({ title: 'Worksheet solutions and mark schemes', description: 'Step-by-step mark schemes for the questions on your worksheet.' });
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">Worksheet solutions</h1>
      <p className="text-gray-600 mt-1 mb-6">Mark schemes for the {questions.length} questions on your worksheet, in the same order. Check your working line by line.</p>
      {questions.length === 0 ? (
        <EmptyState title="This worksheet link has no questions we recognise.">
          <Link to="/contents" className="text-blue-600 hover:underline">Browse topics instead</Link>
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {questions.map((q, i) => <QuestionCard key={q.id} question={q} number={i + 1} defaultOpen showTopic />)}
        </div>
      )}
    </div>
  );
};

/** /w/:code - where the QR code on a printed worksheet leads. */
export const WorksheetSolutions: React.FC = () => {
  const { code } = useParams();
  return <WithCatalog>{(index) => <Solutions index={index} ids={parseWorksheetCode(code)} />}</WithCatalog>;
};

export default QuestionPage;
