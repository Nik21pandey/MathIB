import React from 'react';
import { HeartIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

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
  onDownload?: (paper: Paper) => void;
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
  sortBy = 'year_desc',
  onSortChange
}) => {
  const getRowClassName = (paper: Paper) => {
    const baseClasses = "flex items-start px-3 lg:px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150";
    return selectedPaper?.id === paper.id 
      ? `${baseClasses} bg-blue-50/80 border-l-4 border-blue-600`
      : baseClasses;
  };

  const formatPaperCode = (paper: Paper) => {
    return `${paper.curriculum.replace(/\s+/g, '').substring(0, 4)}/${paper.paperNumber}_${paper.season.replace('/', '')}_${paper.year}`;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-0">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center px-4 py-3 border-b border-gray-100">
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
      <div className="p-3 lg:p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Sort:</span>
            <select 
              value={sortBy}
              onChange={(e) => onSortChange?.(e.target.value)}
              className="text-xs font-medium border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            >
              <option value="year_desc">Year (Latest First)</option>
              <option value="year_asc">Year (Oldest First)</option>
              <option value="title_asc">Title (A to Z)</option>
              <option value="title_desc">Title (Z to A)</option>
            </select>
          </div>
          <div className="text-xs text-gray-600 font-medium">
            <span className="font-bold text-gray-900">{papers.length}</span> official exam papers
          </div>
        </div>
      </div>

      {/* Papers List */}
      <div className="overflow-y-auto flex-1 divide-y divide-gray-100 min-h-0">
        {papers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500">
            <p className="text-base font-semibold text-gray-800 mb-1">No papers found</p>
            <p className="text-xs text-gray-500">Try adjusting your syllabus, year, or search filters above.</p>
          </div>
        ) : (
          papers.map((paper) => (
            <div
              key={paper.id}
              className={getRowClassName(paper)}
              onClick={() => onPaperSelect(paper)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 leading-snug" title={paper.title}>
                    {paper.title || formatPaperCode(paper)}
                  </h3>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(paper.id);
                      }}
                      className={`p-1 rounded hover:bg-gray-100 transition ${
                        paper.isFavorite 
                          ? 'text-red-600' 
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                      title={paper.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      {paper.isFavorite ? (
                        <HeartSolidIcon className="h-4 w-4" />
                      ) : (
                        <HeartIcon className="h-4 w-4" />
                      )}
                    </button>
                    
                    {onDownload && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(paper);
                        }}
                        className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-gray-100 transition"
                        title="Download Question Paper"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                  <span className="font-semibold text-blue-600">{paper.curriculum || paper.subject}</span>
                  <span>•</span>
                  <span className="font-medium text-gray-700">{paper.year}</span>
                  <span>•</span>
                  <span>{paper.season}</span>
                  {paper.zone && (
                    <>
                      <span>•</span>
                      <span>{paper.zone}</span>
                    </>
                  )}
                </div>

                {/* Badges: QP and MS */}
                <div className="mt-2 flex items-center space-x-1.5">
                  <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide rounded bg-blue-100 text-blue-800">
                    QP
                  </span>
                  {paper.markschemeUrl ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      MS Included
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-gray-100 text-gray-500">
                      QP Only
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PaperList;
