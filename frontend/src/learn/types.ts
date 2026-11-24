// Shapes of the learning catalog (see content/build.mjs and backend/apps/learn).

export type Difficulty = 'easy' | 'medium' | 'hard' | 'exam';

export interface Board { id: string; name: string }
export interface ExamSession { id: string; name: string; starts: string; approximate?: boolean }
export interface Paper { name: string; calc: boolean; duration: string; marks: number }
export interface Section { slug: string; name: string; blurb: string; hub?: boolean }
export interface SyllabusVersion { id: string; label: string; detail: string }

export interface Syllabus {
  slug: string;
  board: string;
  code: string;
  name: string;
  short: string;
  level: string;
  status: 'live' | 'soon';
  blurb: string;
  papers: Paper[];
  sections: Section[];
  versions?: SyllabusVersion[];
  versionNote?: string;
}

export interface Formula { label: string; tex: string }
export interface Notes { points: string[]; formulas: Formula[]; gdc: string[]; traps: string[] }
export interface Band { band: string; text: string }

export interface Investigation {
  title: string;
  intro: string;
  inputLabel: string;
  outputLabel: string;
  given: [number, number][];
  blanks: [number, number][];
  predict: { n: number; answer: number };
  steps: { prompt: string; reveal: string }[];
  bands: Band[];
}

export interface HighYieldMeta {
  frequency: number;
  avg_marks: number;
  difficulty_tier: number;
  priority: string;
  predicted_probability?: number;
}

export interface Topic {
  id: string;
  syllabus: string;
  section: string;
  slug: string;
  name: string;
  summary: string;
  tag?: string;
  removedIn?: string;
  generators: string[];
  notes: Notes;
  investigation?: Investigation;
  bands?: Band[];
  video?: string | null;
  high_yield?: HighYieldMeta;
}

export interface QuestionPart { label: string; text: string; marks: number }
export interface SchemeLine { mark: string; text: string }

export interface Question {
  id: string;
  topic: string;
  slug: string;
  difficulty: Difficulty;
  marks: number;
  calc: boolean;
  stem: string;
  parts: QuestionPart[];
  scheme: SchemeLine[];
  answer: string;
  video: string | null;
  criterion?: 'A' | 'B' | 'C' | 'D';
}

export interface ChecklistItem { text: string; topic?: string; minutes?: number }
export interface Checklist { slug: string; syllabus: string; paper: string; title: string; items: ChecklistItem[] }

export interface Catalog {
  version: number;
  boards: Board[];
  sessions: ExamSession[];
  syllabuses: Syllabus[];
  topics: Topic[];
  questions: Question[];
  checklists: Checklist[];
}

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard', 'exam'];
export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  exam: 'Exam-style',
};

/** Minutes a student should allow per mark when timing a worksheet. */
export const MINUTES_PER_MARK = 1.2;
