import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Calculator,
  BookOpen,
  Printer,
  Sparkles,
  Layers,
  CheckCircle2,
  ChevronDown,
  X,
  FileText,
  Plus,
  HelpCircle,
  Eye,
  SlidersHorizontal,
  GraduationCap
} from 'lucide-react';
import { useCatalog } from '../learn/catalog';
import type { Difficulty, Question, Syllabus, Topic } from '../learn/types';
import { DIFFICULTY_LABEL, DIFFICULTY_ORDER } from '../learn/types';
import { useWorksheet } from '../contexts/WorksheetContext';
import QuestionCard from '../components/learn/QuestionCard';
import MathText from '../components/learn/MathText';
import { EmptyState } from '../components/learn/ui';

export const TopicalPastPapers: React.FC = () => {
  const { index, loading } = useCatalog();
  const worksheet = useWorksheet();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [selectedSyllabus, setSelectedSyllabus] = useState<string>(searchParams.get('syllabus') || 'all');
  const [selectedTopic, setSelectedTopic] = useState<string>(searchParams.get('topic') || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>(
    (searchParams.get('difficulty') as Difficulty) || 'all'
  );
  const [calcFilter, setCalcFilter] = useState<'all' | 'calc' | 'non-calc'>(
    (searchParams.get('calc') as any) || 'all'
  );
  const [highYieldOnly, setHighYieldOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState<'cards' | 'booklet'>('cards');
  const [addedAllBanner, setAddedAllBanner] = useState<boolean>(false);

  // All Syllabuses with questions
  const liveSyllabuses = useMemo(() => {
    if (!index) return [];
    return index.catalog.syllabuses.filter((s) => s.status === 'live');
  }, [index]);

  // All topics for the active syllabus
  const availableTopics = useMemo(() => {
    if (!index) return [];
    if (selectedSyllabus === 'all') {
      return index.catalog.topics;
    }
    return index.catalog.topics.filter((t) => t.syllabus === selectedSyllabus);
  }, [index, selectedSyllabus]);

  // Filtered Questions Engine
  const filteredQuestions = useMemo(() => {
    if (!index) return [];
    const questions = index.catalog.questions;

    return questions.filter((q) => {
      const topic = index.topic(q.topic);
      if (!topic) return false;

      // 1. Syllabus filter
      if (selectedSyllabus !== 'all' && topic.syllabus !== selectedSyllabus) {
        return false;
      }

      // 2. Topic filter
      if (selectedTopic !== 'all' && q.topic !== selectedTopic) {
        return false;
      }

      // 3. Difficulty filter
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) {
        return false;
      }

      // 4. Calculator filter
      if (calcFilter === 'calc' && !q.calc) return false;
      if (calcFilter === 'non-calc' && q.calc) return false;

      // 4b. High Yield Filter (Revision Village style)
      if (highYieldOnly && !topic.high_yield) return false;

      // 5. Keyword search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const syl = index.syllabus(topic.syllabus);
        const searchableText = `${q.stem} ${q.answer} ${topic.name} ${topic.summary} ${syl?.name || ''} ${syl?.code || ''}`.toLowerCase();
        if (!searchableText.includes(query)) return false;
      }

      return true;
    });
  }, [index, selectedSyllabus, selectedTopic, selectedDifficulty, calcFilter, highYieldOnly, searchQuery]);

  const highYieldQuestionsCount = useMemo(() => {
    if (!index) return 0;
    return index.catalog.questions.filter((q) => {
      const topic = index.topic(q.topic);
      return Boolean(topic?.high_yield);
    }).length;
  }, [index]);

  // Summary Metrics
  const totalMarks = useMemo(() => {
    return filteredQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
  }, [filteredQuestions]);

  const estimatedTimeMin = Math.round(totalMarks * 1.2);

  // Question counts by topic helper
  const questionCountByTopic = useMemo(() => {
    const map = new Map<string, number>();
    if (!index) return map;
    for (const q of index.catalog.questions) {
      map.set(q.topic, (map.get(q.topic) || 0) + 1);
    }
    return map;
  }, [index]);

  // Question counts by difficulty helper
  const questionCountByDifficulty = useMemo(() => {
    const map = new Map<string, number>();
    if (!index) return map;
    const baseList = selectedSyllabus === 'all'
      ? index.catalog.questions
      : index.catalog.questions.filter(q => index.topic(q.topic)?.syllabus === selectedSyllabus);
    
    for (const q of baseList) {
      map.set(q.difficulty, (map.get(q.difficulty) || 0) + 1);
    }
    return map;
  }, [index, selectedSyllabus]);

  // Add all filtered to custom worksheet
  const handleAddAllToWorksheet = () => {
    if (filteredQuestions.length === 0) return;
    worksheet.addMany(filteredQuestions.map((q) => q.id));
    setAddedAllBanner(true);
    setTimeout(() => setAddedAllBanner(false), 3000);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedSyllabus('all');
    setSelectedTopic('all');
    setSelectedDifficulty('all');
    setCalcFilter('all');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600 font-medium">Loading Topical Past Paper Question Bank...</p>
        </div>
      </div>
    );
  }

  if (!index) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <EmptyState title="Could not load the question bank.">
          Please check your connection and refresh the page.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Printable Cover Sheet Header (Only on Print) */}
      <div className="hidden print:block p-8 border-b border-gray-300">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">MathIB Topical Past Paper Booklet</h1>
          <p className="text-sm text-gray-600 mt-1">
            {selectedSyllabus === 'all' ? 'All Syllabuses' : index.syllabus(selectedSyllabus)?.name} ·{' '}
            {selectedTopic === 'all' ? 'Comprehensive Topical Review' : index.topic(selectedTopic)?.name}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs border border-gray-300 p-4 rounded-lg">
          <div><span className="font-semibold">Candidate Name:</span> ___________________________</div>
          <div><span className="font-semibold">Date:</span> ___________________________</div>
          <div><span className="font-semibold">Total Marks:</span> {totalMarks} marks</div>
          <div><span className="font-semibold">Time Allowed:</span> {estimatedTimeMin} minutes ({Math.round(totalMarks * 1.2)} min)</div>
        </div>
      </div>

      {/* Main Header / Banner */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6 print:hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  <Sparkles className="w-3.5 h-3.5" />
                  Topical Question Bank
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  Official Exam Questions · Classified by Topic & Difficulty
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Topical Past Papers
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
                Practise past paper questions topic-by-topic with official step-by-step examiner mark schemes, 
                instant self-marking, and printable custom booklets.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-2xs transition"
                title="Print or Save as PDF Booklet"
              >
                <Printer className="w-4 h-4 text-gray-500" />
                <span>Export Topical PDF</span>
              </button>

              <button
                onClick={handleAddAllToWorksheet}
                disabled={filteredQuestions.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Add All to Worksheet ({filteredQuestions.length})</span>
              </button>
            </div>
          </div>

          {/* Toast Banner for Worksheet Addition */}
          {addedAllBanner && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 flex items-center justify-between animate-fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Added {filteredQuestions.length} questions to your custom worksheet tray!
              </span>
              <Link to="/worksheet-builder" className="underline font-bold text-emerald-900 ml-4">
                View Worksheet &rarr;
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Filter Navigation Bar (Print Hidden) */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-20 shadow-2xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
          
          {/* 1. Curriculum Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              Board:
            </span>
            <button
              onClick={() => {
                setSelectedSyllabus('all');
                setSelectedTopic('all');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
                selectedSyllabus === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Syllabuses ({index.catalog.questions.length})
            </button>
            {liveSyllabuses.map((s) => {
              const count = index.catalog.questions.filter(
                (q) => index.topic(q.topic)?.syllabus === s.slug
              ).length;
              if (count === 0) return null;
              return (
                <button
                  key={s.slug}
                  onClick={() => {
                    setSelectedSyllabus(s.slug);
                    setSelectedTopic('all');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
                    selectedSyllabus === s.slug
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {s.short} ({count})
                </button>
              );
            })}
          </div>

          {/* 2. Topic, Difficulty, Search & Calculator Filter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 pt-1">
            {/* Search Input */}
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stem, formula, quadratic, surd..."
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 focus:bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Topic Select Dropdown */}
            <div className="lg:col-span-3">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-50 focus:bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">
                  All Topics ({availableTopics.length} available)
                </option>
                {availableTopics.map((t) => {
                  const count = questionCountByTopic.get(t.id) || 0;
                  const hyText = t.high_yield ? ` 🔥 High-Yield (~${t.high_yield.avg_marks}m)` : '';
                  return (
                    <option key={t.id} value={t.id}>
                      {t.name} {count > 0 ? `(${count} questions)` : ''}{hyText}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Difficulty Selector */}
            <div className="lg:col-span-3 flex items-center gap-1 overflow-x-auto">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0 mr-1">
                Level:
              </span>
              <button
                onClick={() => setSelectedDifficulty('all')}
                className={`px-2 py-1 rounded text-xs font-medium transition ${
                  selectedDifficulty === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {DIFFICULTY_ORDER.map((d) => {
                const count = questionCountByDifficulty.get(d) || 0;
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={`px-2 py-1 rounded text-xs font-medium transition flex items-center gap-1 ${
                      selectedDifficulty === d
                        ? 'bg-slate-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{DIFFICULTY_LABEL[d]}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Calculator Mode Filter */}
            <div className="lg:col-span-2 flex items-center justify-end gap-1.5">
              <button
                onClick={() => setCalcFilter('all')}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  calcFilter === 'all'
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCalcFilter('non-calc')}
                className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                  calcFilter === 'non-calc'
                    ? 'bg-amber-50 text-amber-800 font-bold border border-amber-300'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="Paper 2 / Non-Calculator questions only"
              >
                <Calculator className="w-3 h-3 text-amber-600" />
                <span>Non-Calc</span>
              </button>
              <button
                onClick={() => setCalcFilter('calc')}
                className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                  calcFilter === 'calc'
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-300'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="Calculator-allowed questions only"
              >
                <span>Calc</span>
              </button>
              <button
                onClick={() => setHighYieldOnly(!highYieldOnly)}
                className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition ${
                  highYieldOnly
                    ? 'bg-amber-500 text-white shadow-2xs font-bold'
                    : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                }`}
                title="Filter for high-yield questions frequently appearing in exam sessions"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>High-Yield ({highYieldQuestionsCount})</span>
              </button>
            </div>
          </div>

          {/* Active Chips Row & Results Metric */}
          <div className="flex flex-wrap items-center justify-between pt-1 gap-2 text-xs border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-gray-500 font-medium">
                Showing <strong className="text-gray-900 font-bold">{filteredQuestions.length}</strong> questions
                ({totalMarks} marks · ~{estimatedTimeMin} min)
              </span>

              {/* Active Chip: Syllabus */}
              {selectedSyllabus !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-semibold text-[11px] border border-blue-200">
                  {index.syllabus(selectedSyllabus)?.short}
                  <button onClick={() => setSelectedSyllabus('all')} className="hover:text-blue-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Active Chip: Topic */}
              {selectedTopic !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-semibold text-[11px] border border-blue-200">
                  {index.topic(selectedTopic)?.name}
                  <button onClick={() => setSelectedTopic('all')} className="hover:text-blue-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Active Chip: Difficulty */}
              {selectedDifficulty !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-semibold text-[11px] border border-slate-300">
                  {DIFFICULTY_LABEL[selectedDifficulty]}
                  <button onClick={() => setSelectedDifficulty('all')} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {/* Active Chip: Calc */}
              {calcFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold text-[11px] border border-amber-200">
                  {calcFilter === 'non-calc' ? 'Non-Calculator' : 'Calculator'}
                  <button onClick={() => setCalcFilter('all')} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {(selectedSyllabus !== 'all' || selectedTopic !== 'all' || selectedDifficulty !== 'all' || calcFilter !== 'all' || searchQuery) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline ml-2"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  viewMode === 'cards' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Cards View
              </button>
              <button
                onClick={() => setViewMode('booklet')}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  viewMode === 'booklet' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Booklet Mode
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No exam questions match your filters</h3>
            <p className="text-xs text-gray-500 mb-6">
              Try selecting a different syllabus or topic, or reset your search query to explore other questions.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          /* Cards View: Interactive Cards with Mark Schemes & Solutions */
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                question={q}
                number={idx + 1}
                showTopic={true}
              />
            ))}
          </div>
        ) : (
          /* Booklet Mode: Clean Sequential Exam Paper Layout */
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 shadow-sm divide-y divide-gray-200 space-y-8">
            {filteredQuestions.map((q, idx) => {
              const topic = index.topic(q.topic);
              return (
                <div key={q.id} className="pt-8 first:pt-0 break-inside-avoid">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-bold text-gray-900 font-mono text-sm">
                      Question {idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium">
                        {topic?.name} · {q.calc ? 'Calculator' : 'Non-Calculator'}
                      </span>
                      <span className="font-bold text-gray-800">[{q.marks} marks]</span>
                    </div>
                  </div>

                  {/* Stem */}
                  <div className="text-sm text-gray-900 leading-relaxed mb-4">
                    <MathText text={q.stem} />
                  </div>

                  {/* Multi-part */}
                  {q.parts && q.parts.length > 0 && (
                    <div className="space-y-3 pl-4 mb-4">
                      {q.parts.map((p) => (
                        <div key={p.label} className="flex items-start justify-between gap-4 text-xs">
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-gray-700 font-mono">({p.label})</span>
                            <MathText text={p.text} className="text-gray-800" />
                          </div>
                          <span className="text-gray-500 font-mono font-medium flex-shrink-0">[{p.marks}]</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Writing Space / Lines for Practice */}
                  <div className="my-6 border border-dashed border-gray-200 rounded-lg p-6 bg-slate-50/50 print:bg-transparent">
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>Working space</span>
                      <span className="font-mono">Answer: _______________________</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Booklet Mark Schemes Section at the End */}
            <div className="pt-12 border-t-2 border-gray-900 break-before-page">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Examiner Mark Schemes & Model Answers
              </h2>

              <div className="space-y-6">
                {filteredQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 break-inside-avoid">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-xs text-gray-900 font-mono">
                        Question {idx + 1} Mark Scheme ({q.marks} marks)
                      </h4>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Final: {q.answer || 'See scheme'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-700">
                      {q.scheme.map((s, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2 font-mono">
                          <span className="font-bold text-blue-700 w-8 flex-shrink-0">{s.mark}</span>
                          <MathText text={s.text} className="flex-1 text-gray-800" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TopicalPastPapers;
