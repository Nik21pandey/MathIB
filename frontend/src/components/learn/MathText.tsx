import React from 'react';
import katex from 'katex';

export type Token =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: Token[] }
  | { type: 'italic'; value: Token[] }
  | { type: 'code'; value: string }
  | { type: 'math'; value: string; display: boolean };

/**
 * Splits content text into plain text, **bold**, *italic*, `code`, inline maths ($...$)
 * and display maths ($$...$$). "\$" is treated as a literal dollar sign.
 */
export function tokenize(text: string): Token[] {
  if (!text) return [];
  const tokens: Token[] = [];
  let buffer = '';

  const flush = () => {
    if (buffer) tokens.push({ type: 'text', value: buffer });
    buffer = '';
  };

  let i = 0;
  while (i < text.length) {
    const ch = text[i];

    // Escaped dollar sign: "\$" -> literal "$"
    if (ch === '\\' && text[i + 1] === '$') {
      buffer += '$';
      i += 2;
      continue;
    }

    // Display math: "$$ ... $$"
    if (ch === '$' && text[i + 1] === '$') {
      const end = text.indexOf('$$', i + 2);
      if (end !== -1) {
        flush();
        tokens.push({ type: 'math', value: text.slice(i + 2, end).trim(), display: true });
        i = end + 2;
        continue;
      }
    }

    // Inline math: "$ ... $"
    // Must not be followed by a space, and closing $ must not be preceded by a space
    if (ch === '$' && text[i + 1] && text[i + 1] !== ' ' && text[i + 1] !== '\t' && text[i + 1] !== '\n') {
      let end = i + 1;
      while (end < text.length && !(text[end] === '$' && text[end - 1] !== '\\')) {
        end++;
      }
      if (end < text.length && text[end - 1] !== ' ' && text[end - 1] !== '\t') {
        flush();
        tokens.push({ type: 'math', value: text.slice(i + 1, end), display: false });
        i = end + 1;
        continue;
      }
    }

    // Bold: "** ... **"
    if (ch === '*' && text[i + 1] === '*') {
      const end = text.indexOf('**', i + 2);
      if (end !== -1) {
        flush();
        tokens.push({ type: 'bold', value: tokenize(text.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }

    // Italic: "* ... *" (single asterisk, not followed by space)
    if (ch === '*' && text[i + 1] !== '*' && text[i + 1] !== ' ') {
      const end = text.indexOf('*', i + 1);
      if (end !== -1 && text[end - 1] !== ' ') {
        flush();
        tokens.push({ type: 'italic', value: tokenize(text.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }

    // Inline code: "` ... `"
    if (ch === '`') {
      const end = text.indexOf('`', i + 1);
      if (end !== -1) {
        flush();
        tokens.push({ type: 'code', value: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    buffer += ch;
    i++;
  }

  flush();
  return tokens;
}

const renderTokens = (tokens: Token[], keyPrefix = ''): React.ReactNode[] =>
  tokens.map((t, i) => {
    const key = `${keyPrefix}${i}`;
    if (t.type === 'text') {
      return <React.Fragment key={key}>{t.value}</React.Fragment>;
    }
    if (t.type === 'bold') {
      return <strong key={key} className="font-semibold text-gray-900">{renderTokens(t.value, `${key}-`)}</strong>;
    }
    if (t.type === 'italic') {
      return <em key={key} className="italic">{renderTokens(t.value, `${key}-`)}</em>;
    }
    if (t.type === 'code') {
      return <code key={key} className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-xs text-gray-800">{t.value}</code>;
    }
    if (t.type === 'math') {
      let html: string;
      try {
        html = katex.renderToString(t.value, {
          displayMode: t.display,
          throwOnError: false,
          output: 'htmlAndMathml',
        });
      } catch {
        return <code key={key} className="text-rose-600 font-mono">{t.value}</code>;
      }

      return t.display ? (
        <span
          key={key}
          className="block my-3 overflow-x-auto text-center"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <span
          key={key}
          className="inline-block px-0.5 align-baseline"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    return null;
  });

interface MathTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'div' | 'p';
}

/** Renders content text with inline and display maths via bundled KaTeX. */
const MathText: React.FC<MathTextProps> = ({ text, className, as = 'span' }) => {
  const Tag = as;
  return <Tag className={className}>{renderTokens(tokenize(text))}</Tag>;
};

/** Renders a single piece of LaTeX (no dollar signs) in display style. */
export const MathBlock: React.FC<{ tex: string; className?: string }> = ({ tex, className }) => (
  <MathText text={`$$${tex}$$`} className={className} as="div" />
);

export default MathText;
