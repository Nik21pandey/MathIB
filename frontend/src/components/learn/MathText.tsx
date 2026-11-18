import React, { useEffect, useState } from 'react';

// KaTeX is loaded from a <script> tag in index.html, so no extra npm package is needed.
interface KatexApi {
  renderToString: (tex: string, options?: { displayMode?: boolean; throwOnError?: boolean; output?: string }) => string;
}
declare global {
  interface Window { katex?: KatexApi }
}

export type Token =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: Token[] }
  | { type: 'math'; value: string; display: boolean };

/**
 * Splits content text into plain text, **bold**, inline maths ($...$) and display
 * maths ($$...$$). "\$" is a literal dollar sign.
 */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let buffer = '';
  const flush = () => {
    if (buffer) tokens.push({ type: 'text', value: buffer });
    buffer = '';
  };
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '\\' && text[i + 1] === '$') {
      buffer += '$';
      i += 2;
    } else if (ch === '$' && text[i + 1] === '$') {
      const end = text.indexOf('$$', i + 2);
      if (end === -1) {
        buffer += text.slice(i);
        break;
      }
      flush();
      tokens.push({ type: 'math', value: text.slice(i + 2, end), display: true });
      i = end + 2;
    } else if (ch === '$') {
      let end = i + 1;
      while (end < text.length && !(text[end] === '$' && text[end - 1] !== '\\')) end++;
      if (end >= text.length) {
        buffer += text.slice(i);
        break;
      }
      flush();
      tokens.push({ type: 'math', value: text.slice(i + 1, end), display: false });
      i = end + 1;
    } else if (ch === '*' && text[i + 1] === '*') {
      const end = text.indexOf('**', i + 2);
      if (end === -1) {
        buffer += text.slice(i);
        break;
      }
      flush();
      tokens.push({ type: 'bold', value: tokenize(text.slice(i + 2, end)) });
      i = end + 2;
    } else {
      buffer += ch;
      i += 1;
    }
  }
  flush();
  return tokens;
}

/** Re-renders once the KaTeX script has finished loading. */
function useKatex(): KatexApi | undefined {
  const [api, setApi] = useState<KatexApi | undefined>(() => window.katex);
  useEffect(() => {
    if (api) return;
    const onReady = () => setApi(window.katex);
    window.addEventListener('katex-ready', onReady);
    // In case the script loaded between the first render and this effect.
    if (window.katex) onReady();
    return () => window.removeEventListener('katex-ready', onReady);
  }, [api]);
  return api;
}

const renderTokens = (tokens: Token[], katex: KatexApi | undefined, keyPrefix = ''): React.ReactNode[] =>
  tokens.map((t, i) => {
    const key = `${keyPrefix}${i}`;
    if (t.type === 'text') return <React.Fragment key={key}>{t.value}</React.Fragment>;
    if (t.type === 'bold') return <strong key={key} className="font-semibold">{renderTokens(t.value, katex, `${key}-`)}</strong>;
    if (!katex) {
      // Readable fallback while KaTeX loads (and what search engines see without JS maths).
      return <code key={key} className={t.display ? 'block my-2 text-center' : ''}>{t.value}</code>;
    }
    let html: string;
    try {
      html = katex.renderToString(t.value, { displayMode: t.display, throwOnError: false });
    } catch {
      return <code key={key}>{t.value}</code>;
    }
    return t.display ? (
      <span key={key} className="block my-3 overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />
    ) : (
      <span key={key} dangerouslySetInnerHTML={{ __html: html }} />
    );
  });

interface MathTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'div' | 'p';
}

/** Renders content text with inline and display maths. */
const MathText: React.FC<MathTextProps> = ({ text, className, as = 'span' }) => {
  const katex = useKatex();
  const Tag = as;
  return <Tag className={className}>{renderTokens(tokenize(text), katex)}</Tag>;
};

/** Renders a single piece of LaTeX (no dollar signs) in display style. */
export const MathBlock: React.FC<{ tex: string; className?: string }> = ({ tex, className }) => (
  <MathText text={`$$${tex}$$`} className={className} as="div" />
);

export default MathText;
