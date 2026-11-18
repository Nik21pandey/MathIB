import { useSyncExternalStore } from 'react';
import type { CatalogIndex } from './catalog';
import { todayKey } from './quiz';

// Progress is kept in this browser (localStorage) so practice works with no login.

export type SelfMark = 'y' | 'n';
export type MasteryStatus = 'none' | 'red' | 'amber' | 'green';

interface ProgressData {
  /** Self-marking of exam questions after checking the mark scheme. */
  marks: Record<string, SelfMark>;
  /** Topic quiz totals: correct answers and questions attempted. */
  quiz: Record<string, { c: number; t: number }>;
  /** Daily 5 scores keyed by "<yyyymmdd>.<level>". */
  daily: Record<string, { score: number; seconds: number }>;
  /** Ticked items per crash checklist. */
  checks: Record<string, number[]>;
  /** Chosen syllabus version per syllabus (e.g. current / new). */
  versions: Record<string, string>;
}

const KEY = 'MathIB.progress.v1';
const empty = (): ProgressData => ({ marks: {}, quiz: {}, daily: {}, checks: {}, versions: {} });

let state: ProgressData = empty();
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...empty(), ...JSON.parse(raw) };
  } catch {
    state = empty();
  }
}

function update(fn: (draft: ProgressData) => ProgressData) {
  load();
  state = fn(state);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (private mode): progress lasts for this visit only
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const getSnapshot = () => {
  load();
  return state;
};

export function useProgress(): ProgressData {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const progressActions = {
  markQuestion(id: string, mark: SelfMark | null) {
    update((s) => {
      const marks = { ...s.marks };
      if (mark) marks[id] = mark;
      else delete marks[id];
      return { ...s, marks };
    });
  },
  recordTopicQuiz(topicId: string, correct: number, total: number) {
    update((s) => {
      const prev = s.quiz[topicId] ?? { c: 0, t: 0 };
      return { ...s, quiz: { ...s.quiz, [topicId]: { c: prev.c + correct, t: prev.t + total } } };
    });
  },
  recordDaily(dateKey: string, level: string, score: number, seconds: number) {
    update((s) => {
      const key = `${dateKey}.${level}`;
      if (s.daily[key]) return s; // first attempt of the day counts
      return { ...s, daily: { ...s.daily, [key]: { score, seconds } } };
    });
  },
  toggleCheck(slug: string, itemIndex: number) {
    update((s) => {
      const current = s.checks[slug] ?? [];
      const next = current.includes(itemIndex) ? current.filter((i) => i !== itemIndex) : [...current, itemIndex];
      return { ...s, checks: { ...s.checks, [slug]: next } };
    });
  },
  setVersion(syllabus: string, version: string) {
    update((s) => ({ ...s, versions: { ...s.versions, [syllabus]: version } }));
  },
};

export interface Mastery { status: MasteryStatus; correct: number; total: number; percent: number }

/** Red / amber / green for a topic, from self-marked exam questions and topic quizzes. */
export function topicMastery(progress: ProgressData, index: CatalogIndex, topicId: string): Mastery {
  let correct = 0;
  let total = 0;
  for (const q of index.questionsOf(topicId)) {
    const mark = progress.marks[q.id];
    if (mark) {
      total += 1;
      if (mark === 'y') correct += 1;
    }
  }
  const quiz = progress.quiz[topicId];
  if (quiz) {
    correct += quiz.c;
    total += quiz.t;
  }
  if (total === 0) return { status: 'none', correct, total, percent: 0 };
  const ratio = correct / total;
  let status: MasteryStatus = ratio < 0.5 ? 'red' : ratio < 0.8 ? 'amber' : 'green';
  if (status === 'green' && total < 3) status = 'amber'; // not enough evidence yet
  return { status, correct, total, percent: Math.round(ratio * 100) };
}

/** Days in a row (ending today or yesterday) with at least one Daily 5 completed. */
export function dailyStreak(progress: ProgressData): number {
  const days = new Set(Object.keys(progress.daily).map((k) => k.split('.')[0]));
  const d = new Date();
  if (!days.has(todayKey(d))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (days.has(todayKey(d))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

