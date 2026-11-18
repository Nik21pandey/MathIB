import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { BASE_URL_GLOBAL } from '../utils/api';
import type { Catalog, Question, Syllabus, Topic } from './types';
import { DIFFICULTY_ORDER } from './types';

/**
 * The whole learning catalog is small enough to load once and filter in the browser,
 * which is what makes the /contents index instant.
 *
 * Source order:
 *   1. Django: GET /api/v1/learn/catalog/  (content edited in the admin)
 *   2. The JSON bundled with the frontend  (so the site still works with no backend)
 */
async function fetchCatalog(): Promise<Catalog> {
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${BASE_URL_GLOBAL}/learn/catalog/`, { signal: controller.signal });
    window.clearTimeout(timer);
    if (res.ok) {
      const body = await res.json();
      const data = (body && body.data ? body.data : body) as Catalog;
      if (data && Array.isArray(data.topics) && data.topics.length > 0) return data;
    }
  } catch {
    // fall through to the bundled copy
  }
  const bundled = await import('../data/catalog.json');
  return (bundled.default ?? bundled) as unknown as Catalog;
}

export interface CatalogIndex {
  catalog: Catalog;
  syllabus: (slug?: string) => Syllabus | undefined;
  topic: (id?: string) => Topic | undefined;
  topicBySlug: (syllabus?: string, section?: string, slug?: string) => Topic | undefined;
  question: (id?: string) => Question | undefined;
  questionBySlug: (slug?: string) => Question | undefined;
  topicsOf: (syllabus: string, section?: string) => Topic[];
  questionsOf: (topicId: string) => Question[];
  topicPath: (t: Topic) => string;
  questionPath: (q: Question) => string;
}

function buildIndex(catalog: Catalog): CatalogIndex {
  const syllabusMap = new Map(catalog.syllabuses.map((s) => [s.slug, s]));
  const topicMap = new Map(catalog.topics.map((t) => [t.id, t]));
  const questionMap = new Map(catalog.questions.map((q) => [q.id, q]));
  const byTopic = new Map<string, Question[]>();
  for (const q of catalog.questions) {
    const list = byTopic.get(q.topic) ?? [];
    list.push(q);
    byTopic.set(q.topic, list);
  }
  for (const list of byTopic.values()) {
    list.sort((a, b) => DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty));
  }
  return {
    catalog,
    syllabus: (slug) => (slug ? syllabusMap.get(slug) : undefined),
    topic: (id) => (id ? topicMap.get(id) : undefined),
    topicBySlug: (syllabus, section, slug) =>
      catalog.topics.find((t) => t.syllabus === syllabus && t.section === section && t.slug === slug),
    question: (id) => (id ? questionMap.get(id) : undefined),
    // Question slugs end in "-<id>", so the id alone is enough to find the question
    // even if the descriptive part of the URL changes later.
    questionBySlug: (slug) => {
      if (!slug) return undefined;
      const exact = catalog.questions.find((q) => q.slug === slug);
      return exact ?? questionMap.get(slug.slice(slug.lastIndexOf('-') + 1));
    },
    topicsOf: (syllabus, section) =>
      catalog.topics.filter((t) => t.syllabus === syllabus && (!section || t.section === section)),
    questionsOf: (topicId) => byTopic.get(topicId) ?? [],
    topicPath: (t) => `/${t.syllabus}/${t.section}/${t.slug}`,
    questionPath: (q) => `/question/${q.slug}`,
  };
}

interface CatalogState { index: CatalogIndex | null; loading: boolean; error: string | null }

const CatalogContext = createContext<CatalogState>({ index: null, loading: true, error: null });

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CatalogState>({ index: null, loading: true, error: null });

  useEffect(() => {
    let alive = true;
    fetchCatalog()
      .then((catalog) => alive && setState({ index: buildIndex(catalog), loading: false, error: null }))
      .catch((e) => alive && setState({ index: null, loading: false, error: String(e) }));
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(() => state, [state]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalog = () => useContext(CatalogContext);

/** Wraps a page that needs the catalog, showing a skeleton until it has loaded. */
export const WithCatalog: React.FC<{ children: (index: CatalogIndex) => React.ReactNode }> = ({ children }) => {
  const { index, loading, error } = useCatalog();
  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto animate-pulse space-y-4" aria-busy="true">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-40 bg-gray-100 rounded-xl" />
      </div>
    );
  }
  if (!index) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4">
          The question bank could not be loaded. {error}
        </div>
      </div>
    );
  }
  return <>{children(index)}</>;
};
