import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { WithCatalog, type CatalogIndex } from '../../learn/catalog';
import type { Question } from '../../learn/types';
import { DIFFICULTY_LABEL, MINUTES_PER_MARK } from '../../learn/types';
import { absoluteUrl, parseWorksheetCode, worksheetCode } from '../../learn/share';
import { SITE_NAME, useSeo } from '../../learn/seo';
import MathText from '../../components/learn/MathText';
import { EmptyState, QrCode } from '../../components/learn/ui';
import { renderQuestionDiagram } from '../../components/learn/MathDiagram';

type Mode = 'student' | 'scheme';

/** Dotted/Ruled working space sized proportionally to question marks (2-3 questions per page). */
const WorkingSpace: React.FC<{ marks: number }> = ({ marks }) => (
  <div className="ws-lines" style={{ height: `${Math.min(10, Math.max(2, marks + 1)) * 6.5}mm` }} aria-hidden="true" />
);

const StudentQuestion: React.FC<{ q: Question; n: number; topicName?: string }> = ({ q, n, topicName }) => (
  <section className="ws-question border-b border-gray-200 pb-4 mb-5">
    <div className="flex flex-wrap items-center gap-2 mb-2">
      <span className="font-extrabold text-sm text-gray-900">{n}.</span>
      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
        q.difficulty === 'hard' || q.difficulty === 'exam'
          ? 'bg-rose-100 text-rose-800 border border-rose-300'
          : 'bg-amber-100 text-amber-800 border border-amber-300'
      }`}>
        {DIFFICULTY_LABEL[q.difficulty].toUpperCase()}
      </span>
      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
        q.calc
          ? 'bg-blue-50 text-blue-800 border border-blue-200'
          : 'bg-gray-900 text-white'
      }`}>
        {q.calc ? 'CALCULATOR' : 'NO CALCULATOR'}
      </span>
      {q.criterion && (
        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-purple-100 text-purple-800">
          CRITERION {q.criterion}
        </span>
      )}
      {topicName && <span className="text-xs text-gray-500 ml-1">{topicName}</span>}
      <span className="ml-auto text-xs font-bold text-gray-700">Total: [{q.marks}]</span>
    </div>

    <div className="pl-4">
      <MathText text={q.stem} as="div" className="text-gray-900 leading-relaxed text-sm" />
      {renderQuestionDiagram(q.id)}
      {q.parts.length === 0 ? (
        <>
          <WorkingSpace marks={q.marks} />
          <div className="flex justify-end items-center gap-2 mt-1 text-xs text-gray-600">
            <span>Answer: ...........................................................</span>
            <span className="font-bold text-gray-900">[{q.marks}]</span>
          </div>
        </>
      ) : (
        <div className="space-y-3 mt-2">
          {q.parts.map((p) => (
            <div key={p.label} className="ws-part">
              <div className="flex gap-2 items-baseline text-sm">
                <span className="font-bold text-gray-800 flex-shrink-0">({p.label})</span>
                <MathText text={p.text} className="flex-1 text-gray-900" />
                <span className="font-bold text-gray-800 flex-shrink-0">[{p.marks}]</span>
              </div>
              <WorkingSpace marks={p.marks} />
              <div className="flex justify-end text-xs text-gray-600 mt-0.5">
                <span>({p.label}) ...........................................................</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
);

const SchemeQuestion: React.FC<{ q: Question; n: number; topicName?: string }> = ({ q, n, topicName }) => (
  <section className="ws-question mb-5 break-inside-avoid">
    <div className="flex items-center justify-between bg-gray-100 border border-gray-300 px-3 py-1.5 rounded-t-md">
      <div className="flex items-center gap-2">
        <span className="font-extrabold text-sm text-gray-900">{n}.</span>
        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white border border-gray-300 text-gray-800">
          {DIFFICULTY_LABEL[q.difficulty].toUpperCase()}
        </span>
        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white border border-gray-300 text-gray-800">
          {q.calc ? 'CALCULATOR' : 'NO CALCULATOR'}
        </span>
        {topicName && <span className="text-xs font-medium text-gray-600">{topicName}</span>}
      </div>
      <span className="text-xs font-bold text-gray-900">Total: {q.marks}</span>
    </div>

    <table className="w-full text-xs border-collapse border border-t-0 border-gray-300">
      <thead>
        <tr className="bg-gray-50 text-left text-[11px] font-bold text-gray-700 border-b border-gray-300">
          <th className="py-1.5 px-2.5 w-16 border-r border-gray-300">Question</th>
          <th className="py-1.5 px-2.5 w-1/3 border-r border-gray-300">Final Answer</th>
          <th className="py-1.5 px-2.5 w-14 text-center border-r border-gray-300">Marks</th>
          <th className="py-1.5 px-2.5">Partial Marks / Examiner Guidance</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-gray-200 align-top">
          <td className="py-2 px-2.5 font-mono font-semibold text-gray-900 border-r border-gray-300">
            Q{n}
          </td>
          <td className="py-2 px-2.5 font-semibold text-gray-900 border-r border-gray-300">
            <MathText text={q.answer} />
          </td>
          <td className="py-2 px-2.5 text-center font-bold text-gray-900 border-r border-gray-300">
            {q.marks}
          </td>
          <td className="py-2 px-2.5 space-y-1">
            {q.scheme.map((line, i) => (
              <div key={i} className="flex gap-2 items-baseline">
                <span className="font-mono font-bold text-blue-800 bg-blue-50 px-1 rounded flex-shrink-0">
                  {line.mark}
                </span>
                <MathText text={line.text} className="text-gray-800" />
              </div>
            ))}
          </td>
        </tr>
      </tbody>
    </table>
  </section>
);

const Sheet: React.FC<{ index: CatalogIndex }> = ({ index }) => {
  const [params, setParams] = useSearchParams();
  const mode: Mode = params.get('mode') === 'scheme' ? 'scheme' : 'student';
  const title = params.get('title') || 'Full Syllabus Practice Worksheet';
  const questions = parseWorksheetCode(params.get('ids') ?? '')
    .map((id) => index.question(id))
    .filter((q): q is Question => Boolean(q));
  const marks = questions.reduce((s, q) => s + q.marks, 0);
  const minutes = Math.round(marks * MINUTES_PER_MARK);
  const solutionsUrl = absoluteUrl(`/w/${worksheetCode(questions.map((q) => q.id))}`);
  const host = window.location.host.includes('localhost') ? 'www.mathib.com' : window.location.host;

  useSeo({ title: `${title} (${mode === 'student' ? 'Practice Worksheet' : 'Markscheme'})` });

  const setMode = (m: Mode) => {
    const next = new URLSearchParams(params);
    next.set('mode', m);
    setParams(next, { replace: true });
  };

  if (questions.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <EmptyState title="There are no questions on this worksheet.">
          <Link to="/worksheet-builder" className="text-blue-600 hover:underline">Open the worksheet builder</Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="ws-screen min-h-screen bg-gray-200 py-6 print:bg-white print:py-0">
      <div className="max-w-[210mm] mx-auto mb-4 px-4 flex flex-wrap items-center gap-3 print:hidden">
        <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden bg-white" role="group">
          {(['student', 'scheme'] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-sm font-semibold ${mode === m ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {m === 'student' ? 'Student Practice Worksheet' : 'Examiner Markscheme'}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
        >
          <Printer className="h-4 w-4" aria-hidden="true" /> Print / Save as PDF
        </button>
        <Link to="/worksheet-builder" className="text-sm text-blue-700 font-medium hover:underline ml-auto">
          Back to Worksheet Builder
        </Link>
      </div>

      {/* Running Header & Footer for Printed Pages */}
      <div className="ws-running-header">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-base tracking-tight text-blue-800">{SITE_NAME}</span>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-gray-500 border-l border-gray-300 pl-3">
            IBDP • MYP • IGCSE • A-LEVEL
          </span>
        </div>
        <span className="ws-running-qr">
          <span className="text-right leading-tight text-[10px] text-gray-600">
            Scan for live step-by-step<br />markscheme & video solutions
          </span>
          <QrCode value={solutionsUrl} size={68} />
        </span>
      </div>

      <div className="ws-running-footer">
        <span className="font-semibold text-blue-800">{host}</span>
        <span>Learn • Practise • Excel</span>
        <span>{title} ({mode === 'student' ? 'Worksheet' : 'Markscheme'})</span>
      </div>

      <div className="ws-page bg-white mx-auto shadow print:shadow-none relative">
        <table className="w-full">
          <thead><tr><td><div className="ws-header-space" /></td></tr></thead>
          <tfoot><tr><td><div className="ws-footer-space" /></td></tr></tfoot>
          <tbody>
            <tr>
              <td>
                {/* Page 1 Cover Banner (Matches 0580 Practice Worksheet / Markscheme Standard) */}
                <header className="mb-6 border-2 border-gray-900 rounded-lg p-4 bg-gray-50/60">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-300 pb-3">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider bg-blue-700 text-white mb-1">
                        {mode === 'student' ? 'PRACTICE WORKSHEET' : 'MARKSCHEME'}
                      </span>
                      <h1 className="text-xl font-extrabold text-gray-900">{title}</h1>
                    </div>
                    <div className="flex gap-1.5 text-[10px] font-bold">
                      {['IBDP', 'MYP', 'IGCSE', 'A-LEVEL'].map((b) => (
                        <span key={b} className="px-2 py-1 rounded bg-white border border-gray-300 text-gray-700">{b}</span>
                      ))}
                    </div>
                  </div>

                  {/* 4-Box Summary Strip */}
                  <div className="grid grid-cols-4 gap-3 my-3 text-center">
                    <div className="bg-white border border-gray-300 rounded p-2">
                      <div className="text-[10px] font-bold uppercase text-gray-500">QUESTIONS</div>
                      <div className="text-base font-extrabold text-gray-900">{questions.length}</div>
                    </div>
                    <div className="bg-white border border-gray-300 rounded p-2">
                      <div className="text-[10px] font-bold uppercase text-gray-500">TOTAL MARKS</div>
                      <div className="text-base font-extrabold text-gray-900">{marks}</div>
                    </div>
                    <div className="bg-white border border-gray-300 rounded p-2">
                      <div className="text-[10px] font-bold uppercase text-gray-500">SUGGESTED TIME</div>
                      <div className="text-base font-extrabold text-gray-900">{minutes} min</div>
                    </div>
                    <div className="bg-white border border-gray-300 rounded p-2">
                      <div className="text-[10px] font-bold uppercase text-gray-500">SCORE</div>
                      <div className="text-base font-extrabold text-gray-900">____ / {marks}</div>
                    </div>
                  </div>

                  {mode === 'student' ? (
                    <>
                      <div className="grid grid-cols-3 gap-4 mt-3 pt-2 text-xs text-gray-700">
                        <div className="border-b border-gray-500 pb-1 font-medium">Name:</div>
                        <div className="border-b border-gray-500 pb-1 font-medium">Batch / Class:</div>
                        <div className="border-b border-gray-500 pb-1 font-medium">Date:</div>
                      </div>
                      <div className="mt-3 text-[11px] text-gray-700 space-y-0.5">
                        <p><strong>INSTRUCTIONS:</strong> Answer all questions. Show all your working clearly — method marks (M) are available.</p>
                        <p>Give non-exact numerical answers correct to 3 significant figures unless specified otherwise.</p>
                      </div>
                    </>
                  ) : (
                    <div className="mt-2 text-[11px] text-gray-800 space-y-1.5 bg-white border border-gray-300 rounded p-2.5">
                      <div className="font-bold uppercase text-gray-900">EXAMINER MARKING NOTES</div>
                      <p>Award method marks (<strong>M</strong>) for a correct method even if the final answer is inaccurate; accuracy marks (<strong>A</strong>) depend on the preceding M mark. Independent marks (<strong>B</strong>) and reasoning marks (<strong>R</strong>) may be awarded independently.</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 pt-1 text-[10px] font-mono text-gray-700">
                        <span><strong>M</strong> = Method mark</span>
                        <span><strong>A</strong> = Accuracy mark</span>
                        <span><strong>B</strong> = Independent mark</span>
                        <span><strong>R</strong> = Reasoning mark</span>
                        <span><strong>FT</strong> = Follow through</span>
                        <span><strong>oe</strong> = Or equivalent</span>
                        <span><strong>cao</strong> = Correct answer only</span>
                        <span><strong>isw</strong> = Ignore subsequent working</span>
                      </div>
                    </div>
                  )}
                </header>

                {questions.map((q, i) => {
                  const t = index.topic(q.topic);
                  return mode === 'student' ? (
                    <StudentQuestion key={q.id} q={q} n={i + 1} topicName={t?.name} />
                  ) : (
                    <SchemeQuestion key={q.id} q={q} n={i + 1} topicName={t?.name} />
                  );
                })}

                <p className="mt-6 text-center text-xs font-bold uppercase tracking-widest text-gray-600 border-t border-gray-300 pt-4">
                  {mode === 'student' ? `••• END OF WORKSHEET (TOTAL: ${marks} MARKS) •••` : `••• END OF MARKSCHEME (TOTAL: ${marks} MARKS) •••`}
                </p>
                <p className="mt-2 text-center text-[10px] text-gray-400">
                  {SITE_NAME} is an independent mathematics resource platform and is not affiliated with or endorsed by the IBO or Cambridge International.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const WorksheetPrint: React.FC = () => <WithCatalog>{(index) => <Sheet index={index} />}</WithCatalog>;

export default WorksheetPrint;
