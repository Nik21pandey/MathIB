import React, { useState, useEffect } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { PDFCanvasViewer } from './PDFCanvasViewer';

interface PDFViewerProps {
  pdfUrl?: string;
  markschemeUrl?: string;
  paperTitle?: string;
  curriculum?: string;
  paperNumber?: string;
  season?: string;
  year?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onDownload?: (type?: 'question' | 'markscheme') => void;
  onPrint?: () => void;
  onShare?: () => void;
  onFullscreen?: () => void;
  onClose?: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  markschemeUrl,
  paperTitle = "Select a paper to view",
  curriculum = "Cambridge IGCSE",
  paperNumber = "Paper 1",
  season = "May/June",
  year = 2024,
  currentPage = 1,
  totalPages = 16,
  onPageChange,
  onDownload,
  onPrint,
  onShare,
  onFullscreen
}) => {
  const [activeTab, setActiveTab] = useState<'question' | 'markscheme'>('question');
  const [zoom, setZoom] = useState(100);
  const [docTotalPages, setDocTotalPages] = useState<number>(totalPages || 16);

  // Reset tab to question paper and page to 1 when switching papers
  useEffect(() => {
    setActiveTab('question');
    onPageChange?.(1);
  }, [pdfUrl]);

  // Determine active document URL
  const currentUrl = activeTab === 'markscheme' && markschemeUrl ? markschemeUrl : pdfUrl;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 20, 60));
  const handleZoomReset = () => setZoom(100);

  const handleTabSwitch = (tab: 'question' | 'markscheme') => {
    setActiveTab(tab);
    onPageChange?.(1);
  };

  const handleDownloadClick = () => {
    if (onDownload) {
      onDownload(activeTab);
    } else if (currentUrl) {
      window.open(currentUrl, '_blank');
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < docTotalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  const effectiveTotalPages = Math.max(docTotalPages, 1);

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white select-none">
      {/* Top Toolbar */}
      <div className="px-3 lg:px-4 py-2.5 bg-gray-950 border-b border-gray-800 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center space-x-2 lg:space-x-4 min-w-0">
          {/* Document Title */}
          <div className="min-w-0">
            <h2 className="text-xs lg:text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-xs lg:max-w-md" title={paperTitle}>
              {paperTitle}
            </h2>
            <div className="text-[11px] text-gray-400 truncate hidden sm:block">
              {curriculum} • {paperNumber} • {season} {year}
            </div>
          </div>

          {/* Question vs Mark Scheme Switcher */}
          <div className="flex items-center bg-gray-900 rounded-lg p-0.5 border border-gray-800 shadow-inner flex-shrink-0">
            <button
              onClick={() => handleTabSwitch('question')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'question'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>📄 Question Paper</span>
            </button>
            <button
              onClick={() => markschemeUrl && handleTabSwitch('markscheme')}
              disabled={!markschemeUrl}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'markscheme'
                  ? 'bg-emerald-600 text-white shadow'
                  : markschemeUrl
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                  : 'text-gray-600 cursor-not-allowed opacity-50'
              }`}
              title={markschemeUrl ? "Switch to Official Mark Scheme" : "Mark scheme not available for this paper"}
            >
              <span>📝 Mark Scheme</span>
              {markschemeUrl && (
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'markscheme' ? 'bg-white' : 'bg-emerald-400'}`}></span>
              )}
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 lg:space-x-3 flex-shrink-0">
          {/* Page Jump */}
          <div className="flex items-center space-x-1 text-xs bg-gray-900 border border-gray-800 rounded-lg px-2 py-1">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-gray-300">
              Page {currentPage} of {effectiveTotalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= effectiveTotalPages}
              className="p-1 rounded hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center space-x-1 bg-gray-900 border border-gray-800 rounded-lg px-1.5 py-0.5 text-xs">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-gray-800 text-gray-300"
              title="Zoom Out"
            >
              <MagnifyingGlassMinusIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleZoomReset}
              className="px-1.5 text-gray-300 font-mono hover:text-white"
              title="Reset Zoom"
            >
              {zoom}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-gray-800 text-gray-300"
              title="Zoom In"
            >
              <MagnifyingGlassPlusIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Direct Cloud Links & Downloads */}
          {currentUrl && (
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1 text-xs text-blue-300 hover:text-white bg-blue-950/80 hover:bg-blue-900 px-2.5 py-1.5 rounded-lg border border-blue-500/30 transition"
              title="Open full vector PDF in a new tab"
            >
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
              <span>Full PDF</span>
            </a>
          )}

          <button
            onClick={handleDownloadClick}
            className="flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg shadow transition"
            title={`Download ${activeTab === 'markscheme' ? 'Mark Scheme' : 'Question Paper'}`}
          >
            <ArrowDownTrayIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* PDF Canvas Viewport Area */}
      <div className="flex-1 bg-gray-950 flex flex-col min-h-0 overflow-hidden">
        {currentUrl ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Top Sub-Bar with live doc badge */}
            <div className="bg-gray-900/90 text-gray-300 text-xs px-3 py-1.5 flex items-center justify-between border-b border-gray-800 flex-shrink-0 select-none">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${activeTab === 'markscheme' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                <span className="font-semibold text-white">
                  {activeTab === 'markscheme' ? 'Official Mark Scheme' : 'Official Examination Paper'}
                </span>
                <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">
                  (Google Cloud Storage CDN • Vector Engine)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-400 hover:text-blue-300 underline font-mono flex items-center gap-1"
                >
                  Direct GCS Link ↗
                </a>
              </div>
            </div>

            {/* Mozilla PDF.js Canvas Engine */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <PDFCanvasViewer
                key={`${currentUrl}-${activeTab}`}
                url={currentUrl}
                currentPage={currentPage}
                zoom={zoom}
                onTotalPagesLoaded={(total) => setDocTotalPages(total)}
                onPageChange={onPageChange}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center p-8 bg-gray-900 rounded-xl border border-gray-800 max-w-md">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-white">
                {activeTab === 'markscheme' ? 'Mark Scheme Not Attached' : 'Select an Exam Paper'}
              </h3>
              <p className="text-sm mt-2 text-gray-400">
                {activeTab === 'markscheme'
                  ? 'The official mark scheme has not yet been paired for this session.'
                  : 'Past papers and marking schemes are displayed here in high definition.'}
              </p>
              {activeTab === 'markscheme' && pdfUrl && (
                <button
                  onClick={() => handleTabSwitch('question')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition"
                >
                  Return to Question Paper
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status / Tab Bar */}
      <div className="px-3 lg:px-4 py-2 bg-gray-950 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleTabSwitch('question')}
            className={`px-2.5 py-1 rounded font-medium transition ${
              activeTab === 'question'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Question Paper
          </button>
          <button
            onClick={() => markschemeUrl && handleTabSwitch('markscheme')}
            disabled={!markschemeUrl}
            className={`px-2.5 py-1 rounded font-medium transition ${
              activeTab === 'markscheme'
                ? 'bg-emerald-600 text-white'
                : markschemeUrl
                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                : 'text-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            Mark Scheme {markschemeUrl ? '✓' : '(Not Available)'}
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {onShare && (
            <button
              onClick={onShare}
              className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white"
              title="Share Paper"
            >
              <ShareIcon className="h-4 w-4" />
            </button>
          )}
          {onPrint && (
            <button
              onClick={onPrint}
              className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white"
              title="Print Document"
            >
              <PrinterIcon className="h-4 w-4" />
            </button>
          )}
          {onFullscreen && (
            <button
              onClick={onFullscreen}
              className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white"
              title="Fullscreen Mode"
            >
              <ArrowsPointingOutIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
