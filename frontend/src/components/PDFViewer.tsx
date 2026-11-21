import React, { useState } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';
import { ExamStudio } from './ExamStudio';

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
  curriculum = "Cambridge IGCSE / IB DP / Edexcel",
  paperNumber = "Paper 1",
  season = "May/June",
  year = 2024,
  currentPage = 1,
  totalPages = 20,
  onPageChange,
  onDownload,
  onPrint,
  onShare,
  onFullscreen
}) => {
  const [viewType, setViewType] = useState<'studio' | 'pdf'>('pdf');
  const [activeTab, setActiveTab] = useState<'question' | 'markscheme'>('question');
  const [zoom, setZoom] = useState(78);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Determine active document URL
  const currentUrl = activeTab === 'markscheme' && markschemeUrl ? markschemeUrl : pdfUrl;

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));

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
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextPage();
    }
    if (isRightSwipe) {
      handlePreviousPage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Top Main Mode Switcher: Interactive Studio vs PDF Booklet */}
      <div className="bg-gray-950 px-3 py-2 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-1.5 bg-gray-900 p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setViewType('studio')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              viewType === 'studio'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span>⚡ Interactive Studio (Split-View)</span>
            <span className="hidden sm:inline-block text-[10px] bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded font-mono">Exam-Mate / Revision Village</span>
          </button>
          <button
            onClick={() => setViewType('pdf')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              viewType === 'pdf'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span>📄 Official PDF Booklet</span>
            <span className="hidden sm:inline-block text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded font-mono">iLovePDF Vector</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {onDownload && (
            <button
              onClick={() => onDownload(activeTab)}
              className="text-xs text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded-md border border-gray-700 flex items-center gap-1"
            >
              <ArrowDownTrayIcon className="w-3.5 h-3.5" />
              Download
            </button>
          )}
        </div>
      </div>

      {viewType === 'studio' ? (
        <div className="flex-1 overflow-auto bg-slate-900">
          <ExamStudio
            paperTitle={paperTitle}
            curriculum={curriculum}
            paperNumber={paperNumber}
            season={season}
            year={year}
            pdfUrl={pdfUrl}
            markschemeUrl={markschemeUrl}
            onDownloadQP={() => onDownload && onDownload('question')}
            onDownloadMS={() => onDownload && onDownload('markscheme')}
          />
        </div>
      ) : (
        <>
      {/* Top Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 lg:px-4 py-2 bg-gray-800 border-b border-gray-700 space-y-2 lg:space-y-0">
        <div className="flex items-center space-x-2 lg:space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs lg:text-sm font-medium truncate max-w-[200px] lg:max-w-xs">{paperTitle}</span>
          </div>

          {/* Question vs Mark Scheme Switcher */}
          <div className="flex items-center bg-gray-900 rounded-lg p-0.5 border border-gray-700 shadow-inner">
            <button
              onClick={() => setActiveTab('question')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'question'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              📄 Question Paper
            </button>
            <button
              onClick={() => markschemeUrl && setActiveTab('markscheme')}
              disabled={!markschemeUrl}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'markscheme'
                  ? 'bg-emerald-600 text-white shadow'
                  : markschemeUrl
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                  : 'text-gray-500 cursor-not-allowed opacity-60'
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

        <div className="flex items-center justify-between lg:justify-end space-x-2 lg:space-x-4">
          {/* Page Navigation */}
          <div className="flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
              className="p-1 lg:p-1 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous"
            >
              <ChevronLeftIcon className="h-4 w-4 lg:h-5 lg:w-5" />
            </button>
            
            <div className="flex items-center space-x-1 text-xs lg:text-sm">
              <input
                type="number"
                value={currentPage}
                onChange={(e) => onPageChange?.(parseInt(e.target.value) || 1)}
                className="w-8 lg:w-12 px-1 py-1 text-center bg-gray-700 border border-gray-600 rounded text-white text-xs"
                min="1"
                max={totalPages}
              />
              <span>/ {totalPages}</span>
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-1 lg:p-1 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next"
            >
              <ChevronRightIcon className="h-4 w-4 lg:h-5 lg:w-5" />
            </button>
          </div>

          {/* Zoom Controls - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-1">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-gray-700"
              title="Zoom Out"
            >
              <MagnifyingGlassMinusIcon className="h-5 w-5" />
            </button>
            <span className="text-sm w-12 text-center">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-gray-700"
              title="Zoom In"
            >
              <MagnifyingGlassPlusIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Action Buttons - Simplified */}
          <div className="flex items-center space-x-1 lg:hidden">
            <button
              onClick={handleDownloadClick}
              className="p-2 rounded hover:bg-gray-700 bg-blue-600"
              title="Download"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </button>
            <button
              onClick={onShare}
              className="p-2 rounded hover:bg-gray-700"
              title="Share"
            >
              <ShareIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center space-x-1 border-l border-gray-700 pl-2">
            <button
              onClick={onShare}
              className="p-1 rounded hover:bg-gray-700"
              title="Share"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleDownloadClick}
              className="p-1 rounded hover:bg-gray-700 text-blue-400 hover:text-blue-300"
              title={`Download ${activeTab === 'markscheme' ? 'Mark Scheme' : 'Question Paper'}`}
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onPrint}
              className="p-1 rounded hover:bg-gray-700"
              title="Print"
            >
              <PrinterIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onFullscreen}
              className="p-1 rounded hover:bg-gray-700"
              title="Fullscreen"
            >
              <ArrowsPointingOutIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* PDF Content Area */}
      <div 
        className="flex-1 bg-gray-600 overflow-auto"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {currentUrl ? (
          <div className="flex justify-center p-2 lg:p-4 h-full">
            <div 
              className="bg-white shadow-2xl rounded-lg overflow-hidden w-full max-w-full lg:max-w-4xl h-full flex flex-col"
              style={{ 
                width: `min(100%, ${zoom}%)`,
              }}
            >
              <div className="bg-gray-800 text-gray-200 text-xs px-3 py-1 flex items-center justify-between border-b border-gray-700">
                <span className="font-semibold flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${activeTab === 'markscheme' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                  {activeTab === 'markscheme' ? 'Official Mark Scheme & Grading Criteria' : 'Official Question Paper'}
                </span>
                <span className="text-gray-400">{activeTab === 'markscheme' ? 'Answers & Method Marks' : 'Exam Questions'}</span>
              </div>
              {/* PDF Embed */}
              <iframe
                src={currentUrl}
                className="w-full flex-1"
                title={`${paperTitle} - ${activeTab}`}
                style={{ minHeight: '600px' }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center p-6 bg-gray-800/80 rounded-xl border border-gray-700 max-w-md">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg font-semibold text-white">
                {activeTab === 'markscheme' ? 'Mark Scheme Not Attached' : 'Select a paper from the list to view'}
              </p>
              <p className="text-sm mt-2 text-gray-400">
                {activeTab === 'markscheme'
                  ? 'The official mark scheme has not yet been paired for this session.'
                  : 'Past papers and marking schemes are displayed here in high definition.'}
              </p>
              {activeTab === 'markscheme' && pdfUrl && (
                <button
                  onClick={() => setActiveTab('question')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition"
                >
                  Return to Question Paper
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 lg:px-4 py-2 bg-gray-800 border-t border-gray-700 space-y-2 lg:space-y-0">
        <div className="flex items-center justify-center lg:justify-start space-x-2 text-sm">
          <button
            onClick={() => setActiveTab('question')}
            className={`flex items-center space-x-1.5 py-1 px-3 rounded-lg text-xs font-semibold transition ${
              activeTab === 'question'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span>Question Paper</span>
          </button>
          <button
            onClick={() => markschemeUrl && setActiveTab('markscheme')}
            disabled={!markschemeUrl}
            className={`flex items-center space-x-1.5 py-1 px-3 rounded-lg text-xs font-semibold transition ${
              activeTab === 'markscheme'
                ? 'bg-emerald-600 text-white shadow'
                : markschemeUrl
                ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                : 'text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            <span>Mark Scheme</span>
            {markschemeUrl ? (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-mono">Available</span>
            ) : (
              <span className="text-[10px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded-full font-mono">N/A</span>
            )}
          </button>
        </div>
        
        {/* Mobile zoom controls */}
        <div className="flex lg:hidden items-center justify-center space-x-4">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded hover:bg-gray-700 bg-gray-700"
            title="Zoom Out"
          >
            <MagnifyingGlassMinusIcon className="h-4 w-4" />
          </button>
          <span className="text-sm w-12 text-center">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded hover:bg-gray-700 bg-gray-700"
            title="Zoom In"
          >
            <MagnifyingGlassPlusIcon className="h-4 w-4" />
          </button>
        </div>
        
        <div className="text-xs text-gray-400 text-center lg:text-right">
          Download PDF
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default PDFViewer;
