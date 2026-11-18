import React, { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { WithCatalog, type CatalogIndex } from '../../learn/catalog';
import { LEVELS } from '../../learn/generators';
import { buildQuiz, formatDateKey, formatDuration, todayKey, topicSpec } from '../../learn/quiz';
import { useProgress } from '../../learn/progress';
import { parseBeat } from '../../learn/share';
import { useSeo } from '../../learn/seo';
import QuizRunner from '../../components/learn/QuizRunner';
import DailyFiveWidget from '../../components/learn/DailyFiveWidget';
import { Breadcrumbs, NotFound } from '../../components/learn/ui';

/** /daily-5 - today's challenge for each level plus the last week's results. */
export const DailyFive: React.FC = () => {
  const progress = useProgress();
  useSeo({
    title: 'Daily 5: five maths questions a day for IGCSE, MYP, IB and A Level',
    description: 'A free five-question maths challenge every day, by level. Build a streak and challenge a friend to beat your score and time.',
    path: '/daily-5',
  });

  const days = useMemo(() => {
    const out: string[] = [];
    const d = new Date();
    for (let i = 0; i < 7; i++) {
      out.push(todayKey(d));
      d.setDate(d.getDate() - 1);
    }
    return out;
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Daily 5</h1>
        <p className="text-gray-600 mt-1">Five questions, a timer, and a score to send to a friend. No login needed.</p>
      </header>
      <DailyFiveWidget />
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Your last 7 days</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                <th scope="col" className="py-2 pr-4 font-semibold">Day</th>
                {LEVELS.map((l) => <th key={l.id} scope="col" className="py-2 pr-4 font-semibold">{l.label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {days.map((day) => (
                <tr key={day}>
                  <th scope="row" className="py-2 pr-4 font-medium text-gray-800 text-left whitespace-nowrap">{formatDateKey(day)}</th>
                  {LEVELS.map((l) => {
                    const r = progress.daily[`${day}.${l.id}`];
                    return (
                      <td key={l.id} className="py-2 pr-4">
                        {r ? (
                          <span className="text-gray-900">{r.score}/5 <span className="text-gray-500">in {formatDuration(r.seconds)}</span></span>
                        ) : (
                          <Link to={`/quiz/d.${l.id}.${day}`} className="text-blue-600 hover:underline">Play</Link>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const QuizView: React.FC<{ index: CatalogIndex; spec: string }> = ({ index, spec }) => {
  const [params] = useSearchParams();
  const quiz = useMemo(() => buildQuiz(spec, index), [spec, index]);
  const retrySeed = useMemo(() => Math.floor(Math.random() * 90000) + 10000, [spec]);
  const beat = parseBeat(params.get('beat'));

  useSeo({
    title: quiz ? quiz.title : 'Quiz',
    description: beat
      ? `You have been challenged: beat ${beat.score}/5 in ${formatDuration(beat.seconds)} on the same five questions.`
      : 'Five quick maths questions with a timer. Share your score and challenge a friend.',
  });

  if (!quiz) return <NotFound what="quiz" />;
  const topic = quiz.topicId ? index.topic(quiz.topicId) : undefined;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Breadcrumbs items={quiz.kind === 'daily'
        ? [{ label: 'Daily 5', to: '/daily-5' }, { label: quiz.subtitle }]
        : [{ label: topic?.name ?? 'Topic', to: topic ? index.topicPath(topic) : '/contents' }, { label: 'Quiz' }]} />
      <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
      <p className="text-gray-600 mt-1 mb-5">{quiz.subtitle}</p>
      <QuizRunner
        key={spec}
        quiz={quiz}
        beat={beat}
        retryPath={quiz.topicId ? `/quiz/${topicSpec(quiz.topicId, retrySeed)}` : undefined}
      />
    </div>
  );
};

/** /quiz/:spec - a Daily 5, a topic quiz, or a friend's challenge (?beat=score-seconds). */
export const QuizPage: React.FC = () => {
  const { spec } = useParams();
  return <WithCatalog>{(index) => (spec ? <QuizView index={index} spec={spec} /> : <NotFound what="quiz" />)}</WithCatalog>;
};

export default DailyFive;
