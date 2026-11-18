import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Flame } from 'lucide-react';
import { LEVELS } from '../../learn/generators';
import { dailySpec, formatDateKey, todayKey } from '../../learn/quiz';
import { dailyStreak, useProgress } from '../../learn/progress';

/** Today's five-question challenge for each level, with the visitor's streak. */
const DailyFiveWidget: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const progress = useProgress();
  const today = todayKey();
  const streak = dailyStreak(progress);

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-gray-900`}>Daily 5</h2>
          <p className="text-gray-600 text-sm mt-1">Five quick questions, new every day. {formatDateKey(today)}.</p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 text-sm font-medium">
          <Flame className="h-4 w-4" aria-hidden="true" />
          {streak > 0 ? `${streak}-day streak` : 'Start a streak today'}
        </div>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {LEVELS.map((level) => {
          const done = progress.daily[`${today}.${level.id}`];
          return (
            <Link
              key={level.id}
              to={`/quiz/${dailySpec(level.id, today)}`}
              className={`group flex items-center justify-between gap-2 rounded-xl border-2 px-4 py-3 transition-colors ${done ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'}`}
            >
              <span>
                <span className="block font-semibold text-gray-900">{level.label}</span>
                <span className="block text-xs text-gray-600">{done ? `Done: ${done.score}/5` : '5 questions, about 4 minutes'}</span>
              </span>
              {done
                ? <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                : <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" aria-hidden="true" />}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default DailyFiveWidget;
