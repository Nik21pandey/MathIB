import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Check, ChevronDown, Link2, MessageCircle, PlayCircle, Plus, X } from 'lucide-react';
import type { Question } from '../../learn/types';
import { useCatalog } from '../../learn/catalog';
import { progressActions, useProgress } from '../../learn/progress';
import { absoluteUrl, copyText, nativeShare, whatsappUrl } from '../../learn/share';
import { plainText } from '../../learn/seo';
import { useWorksheet } from '../../contexts/WorksheetContext';
import MathText from './MathText';
import { DifficultyBadge, Tag } from './ui';
import { renderQuestionDiagram } from './MathDiagram';

interface QuestionCardProps {
  question: Question;
  number?: number;
  /** Open the mark scheme straight away (used on the worksheet solutions page). */
  defaultOpen?: boolean;
  /** Show which topic the question belongs to. */
  showTopic?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question: q, number, defaultOpen = false, showTopic = false }) => {
  const { index } = useCatalog();
  const worksheet = useWorksheet();
  const progress = useProgress();
  const [open, setOpen] = useState(defaultOpen);
  const [showAnswer, setShowAnswer] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const topic = index?.topic(q.topic);
  const path = index ? index.questionPath(q) : `/question/${q.slug}`;
  const inWorksheet = worksheet.has(q.id);
  const selfMark = progress.marks[q.id];
  const schemeId = `scheme-${q.id}`;

  const shareText = `Stuck on this one - can anyone help? ${plainText(q.stem)}`;
  const shareUrl = absoluteUrl(path);

  const askGroup = async () => {
    const shared = await nativeShare('Maths question', shareText, shareUrl);
    if (!shared) setShareOpen((v) => !v);
  };
  const copyLink = async () => {
    if (await copyText(`${shareText}\n${shareUrl}`)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className="bg-white rounded-xl border border-gray-200 shadow-sm print:shadow-none print:border-0">
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {number !== undefined && <span className="text-sm font-semibold text-gray-900">Question {number}</span>}
          <DifficultyBadge difficulty={q.difficulty} />
          <Tag tone={q.calc ? 'gray' : 'orange'}>
            <Calculator className="h-3 w-3 mr-1" aria-hidden="true" />
            {q.calc ? 'Calculator' : 'Non-calculator'}
          </Tag>
          {q.criterion && <Tag tone="purple">Criterion {q.criterion}</Tag>}
          {showTopic && topic && index && (
            <Link to={index.topicPath(topic)} className="text-xs text-blue-600 hover:underline">{topic.name}</Link>
          )}
          <span className="ml-auto text-sm font-medium text-gray-700">[{q.marks} {q.marks === 1 ? 'mark' : 'marks'}]</span>
        </div>

        <MathText text={q.stem} as="div" className="text-gray-900 leading-relaxed" />
        {renderQuestionDiagram(q.id)}
        {q.parts.length > 0 && (
          <ol className="mt-3 space-y-2">
            {q.parts.map((p) => (
              <li key={p.label} className="flex gap-3">
                <span className="font-medium text-gray-700 flex-shrink-0">({p.label})</span>
                <MathText text={p.text} className="flex-1 text-gray-900" />
                <span className="text-sm text-gray-500 flex-shrink-0">[{p.marks}]</span>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={schemeId}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
            {open ? 'Hide mark scheme' : 'Mark scheme'}
          </button>
          <button
            type="button"
            onClick={() => setShowAnswer((v) => !v)}
            aria-expanded={showAnswer}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {showAnswer ? 'Hide answer' : 'Final answer'}
          </button>
          {q.video && (
            <a href={q.video} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
              <PlayCircle className="h-4 w-4" aria-hidden="true" /> Video solution
            </a>
          )}
          <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border cursor-pointer ${inWorksheet ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <input type="checkbox" className="sr-only" checked={inWorksheet} onChange={() => worksheet.toggle(q.id)} />
            {inWorksheet ? <Check className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
            {inWorksheet ? 'On worksheet' : 'Add to worksheet'}
          </label>
          <button type="button" onClick={askGroup} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Stuck? Ask your group
          </button>
          <Link to={path} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 ml-auto" title="Open this question on its own page">
            <Link2 className="h-4 w-4" aria-hidden="true" /> <span className="sr-only">Open question page</span>
          </Link>
        </div>

        {shareOpen && (
          <div className="mt-3 flex flex-wrap items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm print:hidden">
            <span className="text-gray-700">Send this question with a link to the solution:</span>
            <a href={whatsappUrl(`${shareText}\n${shareUrl}`)} target="_blank" rel="noopener noreferrer" className="px-3 py-1 rounded-md bg-green-600 text-white font-medium hover:bg-green-700">WhatsApp</a>
            <button type="button" onClick={copyLink} className="px-3 py-1 rounded-md border border-gray-300 font-medium text-gray-700 hover:bg-white">
              {copied ? 'Copied' : 'Copy for Discord'}
            </button>
          </div>
        )}

        {showAnswer && (
          <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
            <span className="font-medium text-gray-700 mr-2">Answer:</span>
            <MathText text={q.answer} />
          </div>
        )}
      </div>

      {open && (
        <div id={schemeId} className="border-t border-gray-200 bg-blue-50/40 p-5 rounded-b-xl">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Mark scheme</h4>
          <ol className="space-y-2">
            {q.scheme.map((line, i) => (
              <li key={i} className="flex gap-3 items-baseline">
                <MathText text={line.text} className="flex-1 text-gray-900" />
                <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-100 rounded px-1.5 py-0.5 flex-shrink-0">{line.mark}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-gray-500">M = method, A = accuracy, B = independent mark, R = reasoning.</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 print:hidden">
            <span className="text-sm text-gray-700">How did it go?</span>
            <button
              type="button"
              aria-pressed={selfMark === 'y'}
              onClick={() => progressActions.markQuestion(q.id, selfMark === 'y' ? null : 'y')}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${selfMark === 'y' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'}`}
            >
              <Check className="h-4 w-4" aria-hidden="true" /> Got it
            </button>
            <button
              type="button"
              aria-pressed={selfMark === 'n'}
              onClick={() => progressActions.markQuestion(q.id, selfMark === 'n' ? null : 'n')}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${selfMark === 'n' ? 'bg-red-600 border-red-600 text-white' : 'border-red-300 text-red-700 hover:bg-red-50'}`}
            >
              <X className="h-4 w-4" aria-hidden="true" /> Not yet
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

export default QuestionCard;
