import React, { useState } from 'react';
import { Check, Eye, X } from 'lucide-react';
import type { Band, Investigation as InvestigationData } from '../../learn/types';
import MathText from './MathText';

/** Achievement bands, written in student language. */
export const BandsTable: React.FC<{ bands: Band[]; title?: string }> = ({ bands, title = 'What each achievement level looks like' }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
    <dl className="space-y-2">
      {bands.map((b) => (
        <div key={b.band} className="flex gap-3 text-sm">
          <dt className="w-12 flex-shrink-0 font-semibold text-purple-700">{b.band}</dt>
          <dd className="text-gray-700">{b.text}</dd>
        </div>
      ))}
    </dl>
    <p className="mt-3 text-xs text-gray-500">A guide in plain language. Your teacher marks against the published MYP criteria.</p>
  </div>
);

const NumberCell: React.FC<{ answer: number; label: string }> = ({ answer, label }) => {
  const [value, setValue] = useState('');
  const filled = value.trim() !== '';
  const right = filled && Number(value) === answer;
  return (
    <span className="inline-flex items-center gap-1">
      <input
        type="text"
        inputMode="numeric"
        aria-label={label}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`w-16 px-2 py-1 text-center rounded-md border ${!filled ? 'border-gray-300' : right ? 'border-emerald-500 bg-emerald-50' : 'border-red-400 bg-red-50'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
      />
      {filled && (right
        ? <Check className="h-4 w-4 text-emerald-600" aria-label="Correct" />
        : <X className="h-4 w-4 text-red-500" aria-label="Not yet correct" />)}
    </span>
  );
};

/**
 * Interactive Criterion B task: complete the table, predict a later stage, then work
 * through describe, general rule, verify and justify, revealing a model answer for each.
 */
const Investigation: React.FC<{ data: InvestigationData }> = ({ data }) => {
  const [revealed, setRevealed] = useState<number[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const columns = [...data.given.map(([n, v]) => ({ n, v, blank: false })), ...data.blanks.map(([n, v]) => ({ n, v, blank: true }))];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-2">{data.title}</h3>
        <MathText text={data.intro} as="p" className="text-gray-700 leading-relaxed" />

        <h4 className="mt-5 mb-2 text-sm font-semibold text-gray-900">1. Complete the table</h4>
        <div className="overflow-x-auto">
          <table className="text-sm border-collapse">
            <tbody>
              <tr>
                <th scope="row" className="text-left pr-4 py-2 font-medium text-gray-700 whitespace-nowrap">{data.inputLabel}</th>
                {columns.map((c) => <td key={c.n} className="px-3 py-2 text-center border border-gray-200 bg-gray-50 font-medium">{c.n}</td>)}
              </tr>
              <tr>
                <th scope="row" className="text-left pr-4 py-2 font-medium text-gray-700 whitespace-nowrap">{data.outputLabel}</th>
                {columns.map((c) => (
                  <td key={c.n} className="px-3 py-2 text-center border border-gray-200">
                    {c.blank ? <NumberCell answer={c.v} label={`${data.outputLabel} when ${data.inputLabel} is ${c.n}`} /> : c.v}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="mt-5 mb-2 text-sm font-semibold text-gray-900">2. Predict</h4>
        <p className="text-gray-700 flex flex-wrap items-center gap-2">
          Without building it, predict the value for stage {data.predict.n}:
          <NumberCell answer={data.predict.answer} label={`Prediction for stage ${data.predict.n}`} />
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-1">3. Describe, generalise, verify, justify</h3>
        <p className="text-sm text-gray-600 mb-4">Write your own answer first. Then reveal the model answer and compare.</p>
        <ol className="space-y-5">
          {data.steps.map((step, i) => {
            const isOpen = revealed.includes(i);
            return (
              <li key={i}>
                <label htmlFor={`step-${i}`} className="block font-medium text-gray-900 mb-1">{step.prompt}</label>
                <textarea
                  id={`step-${i}`}
                  rows={2}
                  value={notes[i] ?? ''}
                  onChange={(e) => setNotes((n) => ({ ...n, [i]: e.target.value }))}
                  placeholder="Your answer"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 print:hidden"
                />
                {isOpen ? (
                  <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-gray-900">
                    <span className="font-medium text-purple-800 mr-1">Model answer:</span>
                    <MathText text={step.reveal} />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRevealed((r) => [...r, i])}
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-purple-700 hover:text-purple-900 print:hidden"
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" /> Reveal model answer
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <BandsTable bands={data.bands} />
    </div>
  );
};

export default Investigation;
