import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock, Copy } from 'lucide-react';
import { WithCatalog, type CatalogIndex } from '../../learn/catalog';
import type { Checklist, ExamSession } from '../../learn/types';
import { progressActions, useProgress } from '../../learn/progress';
import { absoluteUrl, copyText, whatsappUrl } from '../../learn/share';
import { useSeo } from '../../learn/seo';
import MathText from '../../components/learn/MathText';
import { Breadcrumbs, NotFound, ProgressBar } from '../../components/learn/ui';

function nextSession(sessions: ExamSession[]): { session: ExamSession; days: number } | null {
  const now = Date.now();
  const upcoming = sessions
    .map((session) => ({ session, days: Math.ceil((new Date(`${session.starts}T00:00:00`).getTime() - now) / 86400000) }))
    .filter((s) => s.days >= 0)
    .sort((a, b) => a.days - b.days);
  return upcoming[0] ?? null;
}

const Countdown: React.FC<{ index: CatalogIndex }> = ({ index }) => {
  const next = nextSession(index.catalog.sessions);
  if (!next) return null;
  const panic = next.days <= 14;
  return (
    <div className={`rounded-xl border p-4 flex items-center gap-3 ${panic ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
      <Clock className={`h-6 w-6 flex-shrink-0 ${panic ? 'text-red-600' : 'text-blue-600'}`} aria-hidden="true" />
      <p className="text-sm text-gray-800">
        <span className="font-semibold">{next.days} {next.days === 1 ? 'day' : 'days'}</span> until the {next.session.name}
        {next.session.approximate ? ' (approximate start; check your own timetable)' : ''}.
        {panic ? ' Final stretch: one checklist a night.' : ''}
      </p>
    </div>
  );
};

const List: React.FC<{ index: CatalogIndex }> = ({ index }) => {
  const progress = useProgress();
  useSeo({
    title: 'Night-before maths exam checklists',
    description: 'A 60-minute, tick-as-you-go plan for the evening before each maths paper.',
    path: '/crash',
  });
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Night-before checklists</h1>
        <p className="text-gray-600 mt-1">One focused hour the evening before the paper. Tick each item as you finish it.</p>
      </header>
      <Countdown index={index} />
      <ul className="grid md:grid-cols-2 gap-4">
        {index.catalog.checklists.map((c) => {
          const done = (progress.checks[c.slug] ?? []).length;
          return (
            <li key={c.slug}>
              <Link to={`/crash/${c.slug}`} className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-500 transition">
                <span className="block font-semibold text-gray-900">{index.syllabus(c.syllabus)?.short}: {c.paper}</span>
                <span className="block text-sm text-gray-600 mt-1 mb-3">{c.items.length} items, about {c.items.reduce((s, i) => s + (i.minutes ?? 0), 0)} minutes</span>
                <ProgressBar value={done} max={c.items.length} />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const Detail: React.FC<{ index: CatalogIndex; checklist: Checklist }> = ({ index, checklist }) => {
  const progress = useProgress();
  const [copied, setCopied] = useState(false);
  const ticked = progress.checks[checklist.slug] ?? [];
  const path = `/crash/${checklist.slug}`;
  const message = `${checklist.title} - tick it off the night before: ${absoluteUrl(path)}`;

  useSeo({
    title: checklist.title,
    description: `A ${checklist.items.length}-step plan for the night before ${index.syllabus(checklist.syllabus)?.short ?? ''} ${checklist.paper}.`,
    path,
  });

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <Breadcrumbs items={[{ label: 'Night-before checklists', to: '/crash' }, { label: checklist.paper }]} />
      <h1 className="text-3xl font-bold text-gray-900">{checklist.title}</h1>
      <Countdown index={index} />
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <ProgressBar value={ticked.length} max={checklist.items.length} label="Done" />
        <ul className="mt-4 divide-y divide-gray-100">
          {checklist.items.map((item, i) => {
            const on = ticked.includes(i);
            const topic = index.topic(item.topic);
            return (
              <li key={i} className="py-3 flex gap-3 items-start">
                <input
                  id={`check-${i}`}
                  type="checkbox"
                  checked={on}
                  onChange={() => progressActions.toggleCheck(checklist.slug, i)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor={`check-${i}`} className={`flex-1 cursor-pointer ${on ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  <MathText text={item.text} />
                </label>
                <span className="flex flex-col items-end gap-1 flex-shrink-0 text-xs">
                  {item.minutes && <span className="text-gray-500">{item.minutes} min</span>}
                  {topic && <Link to={`${index.topicPath(topic)}?tab=notes`} className="text-blue-600 hover:underline">Revise</Link>}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex flex-wrap gap-2 print:hidden">
        <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700">Send to your class group</a>
        <button
          type="button"
          onClick={async () => {
            if (await copyText(message)) {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
        >
          <Copy className="h-4 w-4" aria-hidden="true" /> {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
    </div>
  );
};

/** /crash and /crash/:slug */
const Crash: React.FC = () => {
  const { slug } = useParams();
  return (
    <WithCatalog>
      {(index) => {
        if (!slug) return <List index={index} />;
        const checklist = index.catalog.checklists.find((c) => c.slug === slug);
        return checklist ? <Detail key={slug} index={index} checklist={checklist} /> : <NotFound what="checklist" />;
      }}
    </WithCatalog>
  );
};

export default Crash;
