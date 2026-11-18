import { useEffect } from 'react';

export const SITE_NAME = 'MathIB';

interface SeoOptions {
  title: string;
  description?: string;
  /** Canonical path, e.g. /igcse-0580/non-calculator-paper-2/surds-and-rationalising */
  path?: string;
  /** schema.org structured data for this page. */
  jsonLd?: Record<string, unknown> | null;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Sets the title, description, canonical link, Open Graph tags (used by WhatsApp and
 * Discord link previews) and structured data for the current page.
 */
export function useSeo({ title, description, path, jsonLd }: SeoOptions) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : '';
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    document.title = fullTitle;
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:type', 'website');
    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
    }
    const url = window.location.origin + (path ?? window.location.pathname);
    setMeta('property', 'og:url', url);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    let script = document.getElementById('page-jsonld');
    if (ld) {
      if (!script) {
        script = document.createElement('script');
        script.id = 'page-jsonld';
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = ld;
    } else if (script) {
      script.remove();
    }
  }, [title, description, path, ld]);
}

/** Turns "$\sqrt{48}$" style text into plain words for meta descriptions. */
export function plainText(text: string): string {
  return text
    .replace(/\$\$?/g, '')
    .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^{}]*)\}/g, 'sqrt($1)')
    .replace(/\\(times|cdot)/g, 'x')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/\\[$%,;! ]/g, ' ')
    .replace(/[{}]/g, '')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
