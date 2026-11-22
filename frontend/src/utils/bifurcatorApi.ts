/**
 * PDF Content Bifurcation & Clean Report Generator API Client
 */

import { BASE_URL_GLOBAL } from './api';

const BIFURCATE_URL = `${BASE_URL_GLOBAL}/papers/bifurcate/`;
const EXPORT_PDF_URL = `${BASE_URL_GLOBAL}/papers/bifurcate/export-pdf/`;

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface BifurcatedItem {
  id: string;
  unit_ref?: string;
  subject: string;
  topic: string;
  subtopic: string;
  difficulty: DifficultyLevel;
  justification: string;
  page_ref: string;
  key_notes: string;
}

export interface BifurcatedSummary {
  total_items: number;
  beginner_count: number;
  intermediate_count: number;
  advanced_count: number;
  difficulty_distribution: {
    Beginner: number;
    Intermediate: number;
    Advanced: number;
  };
}

export interface BifurcatedReportData {
  success: boolean;
  filename: string;
  subject: string;
  total_pages: number;
  pages_processed: number;
  total_words: number;
  is_scanned: boolean;
  engine?: string;
  summary: BifurcatedSummary;
  items: BifurcatedItem[];
  error?: string;
}

/**
 * Uploads a PDF to be extracted and bifurcated into Subject, Topic, Subtopic, and Difficulty.
 */
export async function bifurcatePdf(
  file: File,
  options?: { subjectHint?: string; maxPages?: number }
): Promise<BifurcatedReportData> {
  const formData = new FormData();
  formData.append('file', file);
  if (options?.subjectHint) {
    formData.append('subject_hint', options.subjectHint);
  }
  if (options?.maxPages) {
    formData.append('max_pages', options.maxPages.toString());
  }

  const response = await fetch(BIFURCATE_URL, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || `Server responded with status ${response.status}`);
  }

  return data as BifurcatedReportData;
}

/**
 * Sends structured bifurcation data to the backend ReportLab engine to generate
 * a clean, publication-ready A4 PDF report with custom typography and page numbers.
 */
export async function exportPdfReport(reportData: BifurcatedReportData): Promise<Blob> {
  const response = await fetch(EXPORT_PDF_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reportData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate PDF: ${errorText || response.statusText}`);
  }

  return await response.blob();
}

/**
 * Triggers a browser download of the ReportLab-generated PDF report.
 */
export async function downloadPdfReport(reportData: BifurcatedReportData): Promise<void> {
  const blob = await exportPdfReport(reportData);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = (reportData.filename || 'report').replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  link.download = `MathIB_Bifurcation_Report_${safeName}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Triggers a browser download of the structured JSON breakdown.
 */
export function downloadJsonReport(reportData: BifurcatedReportData): void {
  const jsonStr = JSON.stringify(reportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = (reportData.filename || 'report').replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  link.download = `MathIB_Bifurcation_Data_${safeName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
