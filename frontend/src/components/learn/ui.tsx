import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Difficulty } from '../../learn/types';
import { DIFFICULTY_LABEL } from '../../learn/types';
import type { Mastery, MasteryStatus } from '../../learn/progress';
import { encodeQr, qrSvgPath } from '../../learn/qr';

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  hard: 'bg-rose-50 text-rose-700 border-rose-200',
  exam: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export const DifficultyBadge: React.FC<{ difficulty: Difficulty }> = ({ difficulty }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${DIFFICULTY_STYLE[difficulty]}`}>
    {DIFFICULTY_LABEL[difficulty]}
  </span>
);

export const Tag: React.FC<{ children: React.ReactNode; tone?: 'gray' | 'blue' | 'purple' | 'orange' }> = ({ children, tone = 'gray' }) => {
  const tones = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tones[tone]}`}>{children}</span>;
};

const MASTERY_DOT: Record<MasteryStatus, string> = {
  none: 'bg-gray-300',
  red: 'bg-red-500',
  amber: 'bg-amber-400',
  green: 'bg-emerald-500',
};
const MASTERY_TEXT: Record<MasteryStatus, string> = {
  none: 'Not started',
  red: 'Needs work',
  amber: 'Improving',
  green: 'Strong',
};

/** Traffic-light dot. The label is always available to screen readers and on hover. */
export const MasteryDot: React.FC<{ mastery: Mastery; showLabel?: boolean }> = ({ mastery, showLabel }) => {
  const label = mastery.total > 0 ? `${MASTERY_TEXT[mastery.status]} (${mastery.correct}/${mastery.total})` : MASTERY_TEXT.none;
  return (
    <span className="inline-flex items-center gap-1.5" title={label}>
      <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${MASTERY_DOT[mastery.status]}`} aria-hidden="true" />
      {showLabel ? <span className="text-xs text-gray-600">{label}</span> : <span className="sr-only">{label}</span>}
    </span>
  );
};

export const ProgressBar: React.FC<{ value: number; max: number; label?: string }> = ({ value, max, label }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{label}</span>
          <span>{value}/{max}</span>
        </div>
      )}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export interface Crumb { label: string; to?: string }

export const Breadcrumbs: React.FC<{ items: Crumb[] }> = ({ items }) => (
  <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-gray-500 mb-4 print:hidden">
    {items.map((c, i) => (
      <React.Fragment key={`${c.label}-${i}`}>
        {i > 0 && <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />}
        {c.to ? (
          <Link to={c.to} className="hover:text-blue-600">{c.label}</Link>
        ) : (
          <span className="text-gray-900 font-medium">{c.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

/** QR code as crisp SVG. Renders nothing if the text is too long to encode. */
export const QrCode: React.FC<{ value: string; size?: number; className?: string }> = ({ value, size = 96, className }) => {
  const qr = useMemo(() => {
    try {
      return qrSvgPath(encodeQr(value));
    } catch {
      return null;
    }
  }, [value]);
  if (!qr) return null;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${qr.size} ${qr.size}`} className={className} role="img" aria-label="QR code linking to the solutions" shapeRendering="crispEdges">
      <rect width={qr.size} height={qr.size} fill="#ffffff" />
      <path d={qr.path} fill="#000000" />
    </svg>
  );
};

export const EmptyState: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center">
    <p className="font-medium text-gray-900">{title}</p>
    {children && <div className="mt-2 text-sm text-gray-600">{children}</div>}
  </div>
);

export const NotFound: React.FC<{ what: string }> = ({ what }) => (
  <div className="p-6 max-w-3xl mx-auto">
    <EmptyState title={`We could not find that ${what}.`}>
      <Link to="/contents" className="text-blue-600 hover:underline">Browse every topic in the contents index</Link>
    </EmptyState>
  </div>
);
