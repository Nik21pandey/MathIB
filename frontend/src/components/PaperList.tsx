import React from 'react';
import { HeartIcon, ArrowDownTrayIcon, DocumentTextIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { FileText, CheckCircle2, Download } from 'lucide-react';

interface Paper {
  id: number;
  title: string;
  subject: string;
  curriculum: string;
  year: number;
  season: string;
  paperNumber: string;
  zone?: string;
  duration?: number;
  isFavorite: boolean;
  type: 'question' | 'marking-scheme' | 'examiner-report';
  markschemeUrl?: string;
  pdfUrl?: string;
}

interface PaperListProps {
  papers: Paper[];
  loading: boolean;
  selectedPaper: Paper | null;
  onPaperSelect: (paper: Paper) => void;
  onToggleFavorite: (paperId: number) => void;
  onDownload?: (paper: Paper, type?: 'question' | 'markscheme') => void;
  onSelectMarkScheme?: (paper: Paper) => void;
  onClearFilters?: () => void;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
}

const PaperList: React.FC<PaperListProps> = ({
  papers,
  loading,
  selectedPaper,
  onPaperSelect,
  onToggleFavorite,
  onDownload,
  onSelectMarkScheme,
  onClearFilters,
  sortBy = 'year_desc',
  onSortChange,
}) => {
  const getRowClassName = (paper: Paper) => {
    const baseClasses =
      'flex flex-col sm:flex-row sm:items-start px-3.5 lg:px-4 py-3 border-b border-gray-100 hover:bg-slate-50 cursor-pointer transition-colors duration-150 group';
    return selectedPaper?.id === paper.id
      ? `${baseClasses} bg-blue-50/90 border-l-4 border-blue-600 shadow-2xs`
      : baseClasses;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-white">
        <div className="p-3.5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-0">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center px-4 py-3.5 border-b border-gray-100">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white min-h-0">
      {/* Header with Sort and Count */}
      <div className="p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange?.(e.target.value)}
              className="text-xs font-medium border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs"
            >
              <option value="year_desc">Year (Latest First)</option>
              <option value="year_asc">Year (Oldest First)</option>
              <option value="title_asc">Title (A to Z)</option>
              <option value="title_desc">Title (Z to A)</option>
            </select>
          </div>
          <div className="text-xs text-gray-600 font-medium font-mono">
            <span className="font-bold text-slate-900">{papers.length}</span> official exam papers
          </div>
        </div>
      </div>

      {/* Papers List */}
      <div className="overflow-y-auto flex-1 divide-y divide-gray-100 min-h-0">
        {papers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-900 mb-1">No papers match selected filters</p>
            <p className="text-xs text-gray-500 max-w-xs mb-4">
              Try adjusting your paper number, curriculum, or year filters.
            </p>
            {onClearFilters && (
              <button
                onClick={onClearFilters}
                className="px-4 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          papers.map((paper) => {
            const isSelected = selectedPaper?.id === paper.id;
            return (
              <div
                key={paper.id}
                className={getRowClassName(paper)}
                onClick={() => onPaperSelect(paper)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`text-xs font-bold leading-snug truncate ${
                        isSelected ? 'text-blue-950 font-extrabold' : 'text-gray-900 group-hover:text-blue-600'
                      }`}
                      title={paper.title}
                    >
                      {paper.title}
                    </h3>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(paper.id);
                        }}
                        className={`p-1 rounded hover:bg-gray-200/60 transition ${
                          paper.isFavorite
                            ? 'text-red-600'
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                        title={paper.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                      >
                        {paper.isFavorite ? (
                          <HeartSolidIcon className="h-3.5 w-3.5" />
                        ) : (
                          <HeartIcon className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {onDownload && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownload(paper, 'question');
                          }}
                          className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-gray-200/60 transition"
                          title="Download Question Paper"
                        >
                          <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                    <span className="font-semibold text-blue-700">{paper.curriculum}</span>
                    <span>•</span>
                    <span className="font-semibold text-gray-800">{paper.year}</span>
                    <span>•</span>
                    <span>{paper.season}</span>
                    {paper.zone && (
                      <>
                        <span>•</span>
                        <span>{paper.zone}</span>
                      </>
                    )}
                  </div>

                  {/* Twin Document Badges & Quick Switchers */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      QP
                    </span>

                    {paper.markschemeUrl ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        MS Included
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                        QP Only
                      </span>
                    )}

                    {/* Quick MS Switcher Button */}
                    {paper.markschemeUrl && onSelectMarkScheme && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectMarkScheme(paper);
                        }}
                        className="ml-auto text-[10px] font-semibold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 transition"
                        title="Open Mark Scheme directly"
                      >
                        📝 Mark Scheme
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PaperList;
