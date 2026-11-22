import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Search,
  Filter,
  FileText,
  Sparkles,
  ArrowRight,
  BookOpen,
  Download,
  Eye,
  Layers,
  X,
  CornerDownLeft,
  Command,
  Zap,
} from 'lucide-react';

interface TerminalAction {
  id: string;
  category: 'filter' | 'viewer' | 'navigation' | 'ai';
  title: string;
  description: string;
  badge?: string;
  keywords: string[];
  run: () => void;
}

interface SpiderwebTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (key: string, value: string) => void;
  onClearFilters: () => void;
  onSelectPaperByQuery?: (query: string) => void;
  onToggleMarkScheme?: (active: boolean) => void;
  onPageChange?: (delta: number) => void;
  onDownloadCurrent?: (type: 'qp' | 'ms') => void;
  activeFiltersCount: number;
  totalPapersCount: number;
}

export const SpiderwebTerminal: React.FC<SpiderwebTerminalProps> = ({
  isOpen,
  onClose,
  onApplyFilter,
  onClearFilters,
  onSelectPaperByQuery,
  onToggleMarkScheme,
  onPageChange,
  onDownloadCurrent,
  activeFiltersCount,
  totalPapersCount,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global key listener for Ctrl+K / Cmd+K and Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Predefined terminal command actions
  const allActions: TerminalAction[] = [
    // Filters - Papers
    {
      id: 'filter-p4',
      category: 'filter',
      title: 'Filter: Paper 4 (Calculator)',
      description: 'Isolate all Cambridge Paper 4 extended calculator examinations',
      badge: '40 Papers',
      keywords: ['p4', 'paper 4', 'paper-4', 'calculator'],
      run: () => {
        onApplyFilter('paper', 'paper-4');
        onClose();
      },
    },
    {
      id: 'filter-p2',
      category: 'filter',
      title: 'Filter: Paper 2 (Non-Calculator / Core)',
      description: 'Isolate all Cambridge Paper 2 examinations',
      badge: '40 Papers',
      keywords: ['p2', 'paper 2', 'paper-2', 'non-calculator'],
      run: () => {
        onApplyFilter('paper', 'paper-2');
        onClose();
      },
    },
    {
      id: 'filter-p6',
      category: 'filter',
      title: 'Filter: Paper 6 (Investigation & Modelling)',
      description: 'Isolate all 0607 Paper 6 investigation and modelling examinations',
      badge: '7 Papers',
      keywords: ['p6', 'paper 6', 'paper-6', 'investigation', 'modelling'],
      run: () => {
        onApplyFilter('paper', 'paper-6');
        onClose();
      },
    },
    // Filters - Curriculum
    {
      id: 'filter-0580',
      category: 'filter',
      title: 'Curriculum: Cambridge IGCSE Mathematics (0580)',
      description: 'Filter to Cambridge 0580 Mathematics papers & mark schemes',
      badge: '64 Papers',
      keywords: ['0580', 'igcse 0580', 'core', 'extended', 'cambridge math'],
      run: () => {
        onApplyFilter('curriculum', 'cambridge-igcse-mathematics-0580');
        onClose();
      },
    },
    {
      id: 'filter-0607',
      category: 'filter',
      title: 'Curriculum: Cambridge IGCSE International Mathematics (0607)',
      description: 'Filter to Cambridge 0607 International Mathematics papers',
      badge: '23 Papers',
      keywords: ['0607', 'international math', 'igcse 0607'],
      run: () => {
        onApplyFilter('curriculum', 'cambridge-igcse-international-mathematics-0607');
        onClose();
      },
    },
    // Filters - Years
    {
      id: 'filter-2026',
      category: 'filter',
      title: 'Year: 2026 Examination Series',
      description: 'View the latest 2026 official question papers and mark schemes',
      badge: 'Latest',
      keywords: ['2026', 'latest', 'newest'],
      run: () => {
        onApplyFilter('year', '2026');
        onClose();
      },
    },
    {
      id: 'filter-2025',
      category: 'filter',
      title: 'Year: 2025 Examination Series',
      description: 'Filter papers from the 2025 examination year',
      badge: '34 Papers',
      keywords: ['2025'],
      run: () => {
        onApplyFilter('year', '2025');
        onClose();
      },
    },
    {
      id: 'filter-2024',
      category: 'filter',
      title: 'Year: 2024 Examination Series',
      description: 'Filter papers from the 2024 examination year',
      badge: '14 Papers',
      keywords: ['2024'],
      run: () => {
        onApplyFilter('year', '2024');
        onClose();
      },
    },
    // Filters - Seasons
    {
      id: 'filter-febmarch',
      category: 'filter',
      title: 'Season: February / March (India / Series 2)',
      description: 'Filter papers from the Feb/March exam series',
      badge: 'Feb/March',
      keywords: ['feb', 'march', 'february', 'm26', 'm25'],
      run: () => {
        onApplyFilter('season', 'febmarch');
        onClose();
      },
    },
    {
      id: 'filter-mayjune',
      category: 'filter',
      title: 'Season: May / June (Summer Series)',
      description: 'Filter papers from the May/June examination series',
      badge: 'May/June',
      keywords: ['may', 'june', 'summer', 's25', 's24'],
      run: () => {
        onApplyFilter('season', 'mayjune');
        onClose();
      },
    },
    {
      id: 'filter-octnov',
      category: 'filter',
      title: 'Season: October / November (Winter Series)',
      description: 'Filter papers from the Oct/Nov examination series',
      badge: 'Oct/Nov',
      keywords: ['oct', 'nov', 'winter', 'w25', 'w24'],
      run: () => {
        onApplyFilter('season', 'octnov');
        onClose();
      },
    },
    // Clear Filters
    {
      id: 'clear-filters',
      category: 'filter',
      title: 'Reset & Clear All Active Filters',
      description: 'Reset all dropdowns and display the entire 87 paper catalog',
      badge: 'Reset',
      keywords: ['clear', 'reset', 'all', 'restore'],
      run: () => {
        onClearFilters();
        onClose();
      },
    },
    // Viewer Controls
    {
      id: 'view-ms',
      category: 'viewer',
      title: 'Viewer: Switch to Mark Scheme (MS)',
      description: 'Toggle right-hand vector canvas to the official Cambridge Mark Scheme',
      badge: 'Mark Scheme',
      keywords: ['ms', 'markscheme', 'mark scheme', 'answers', 'solution', 'criteria'],
      run: () => {
        onToggleMarkScheme?.(true);
        onClose();
      },
    },
    {
      id: 'view-qp',
      category: 'viewer',
      title: 'Viewer: Switch to Question Paper (QP)',
      description: 'Toggle right-hand vector canvas to the official Question Paper booklet',
      badge: 'Question Paper',
      keywords: ['qp', 'question paper', 'booklet', 'questions'],
      run: () => {
        onToggleMarkScheme?.(false);
        onClose();
      },
    },
    {
      id: 'download-qp',
      category: 'viewer',
      title: 'Download: Question Paper PDF',
      description: 'Instantly download the active official Question Paper PDF',
      badge: 'PDF',
      keywords: ['download qp', 'get qp', 'save qp'],
      run: () => {
        onDownloadCurrent?.('qp');
        onClose();
      },
    },
    {
      id: 'download-ms',
      category: 'viewer',
      title: 'Download: Mark Scheme PDF',
      description: 'Instantly download the active official Mark Scheme PDF',
      badge: 'PDF',
      keywords: ['download ms', 'get ms', 'save ms'],
      run: () => {
        onDownloadCurrent?.('ms');
        onClose();
      },
    },
    // AI Tools & Navigation
    {
      id: 'nav-bifurcator',
      category: 'ai',
      title: 'Tool: Launch PDF Content Bifurcator',
      description: 'Upload any exam PDF to bifurcate into Topic, Subtopic & Difficulty',
      badge: 'AI Engine',
      keywords: ['bifurcate', 'extract', 'ai', 'difficulty', 'analyze', 'upload pdf'],
      run: () => {
        window.location.href = '/bifurcator';
      },
    },
    {
      id: 'nav-worksheet',
      category: 'navigation',
      title: 'Tool: Worksheet & Exam Builder',
      description: 'Build custom print-ready problem sheets and tests',
      badge: 'Builder',
      keywords: ['worksheet', 'builder', 'exam builder', 'custom test'],
      run: () => {
        window.location.href = '/worksheet-builder';
      },
    },
    {
      id: 'nav-syllabus',
      category: 'navigation',
      title: 'Navigate: Learn by Syllabus',
      description: 'Browse curated drills and concept workspaces by exam syllabus',
      badge: 'Learn',
      keywords: ['syllabus', 'learn', 'curriculum', 'topics'],
      run: () => {
        window.location.href = '/learn';
      },
    },
  ];

  // Filter actions based on user query
  const filteredActions = allActions.filter((action) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    if (action.title.toLowerCase().includes(q)) return true;
    if (action.description.toLowerCase().includes(q)) return true;
    return action.keywords.some((k) => k.toLowerCase().includes(q));
  });

  // Handle arrow navigation and Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredActions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredActions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].run();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            <span className="ml-2 font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              Spiderweb Power Terminal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-slate-500">
              {totalPapersCount} papers loaded · {activeFiltersCount} filters active
            </span>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Command Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <span className="text-blue-400 font-mono font-bold mr-2 text-sm select-none">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a paper (p4, 0580), year (2026), command (ms, qp, clear), or search keyword..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-500 hover:text-slate-300">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Suggestions List */}
        <div ref={listRef} className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 p-1.5">
          {filteredActions.length === 0 ? (
            <div className="py-8 px-4 text-center text-xs text-slate-400">
              No terminal commands match &quot;{query}&quot;. Try typing <code className="text-blue-400">p4</code>, <code className="text-blue-400">0580</code>, <code className="text-blue-400">2026</code>, or <code className="text-blue-400">ms</code>.
            </div>
          ) : (
            filteredActions.map((action, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={action.id}
                  onClick={() => action.run()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition ${
                    isSelected ? 'bg-blue-600/90 text-white' : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {action.category === 'filter' && <Filter className="w-4 h-4" />}
                      {action.category === 'viewer' && <Eye className="w-4 h-4" />}
                      {action.category === 'navigation' && <ArrowRight className="w-4 h-4" />}
                      {action.category === 'ai' && <Sparkles className="w-4 h-4 text-amber-400" />}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-semibold leading-tight truncate flex items-center gap-2">
                        <span>{action.title}</span>
                        {action.badge && (
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-blue-800/80 text-blue-100'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {action.badge}
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[11px] truncate mt-0.5 ${
                          isSelected ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        {action.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs flex-shrink-0 ml-3">
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-mono bg-blue-700/80 px-2 py-0.5 rounded text-blue-100">
                        Press Enter <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Terminal Footer with Shortcut Hints */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300">↑</kbd>{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300">↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300">↵</kbd> Select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300">ESC</kbd> Close
            </span>
          </div>
          <div className="text-slate-500">
            Powered by MathIB Spiderweb
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpiderwebTerminal;
