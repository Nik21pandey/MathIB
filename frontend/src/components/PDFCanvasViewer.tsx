import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';

// Use same-origin local worker bundled by Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PDFCanvasViewerProps {
  url: string;
  currentPage: number;
  zoom: number; // percentage (e.g. 100, 125, 150)
  onTotalPagesLoaded?: (total: number) => void;
  onPageChange?: (page: number) => void;
}

export const PDFCanvasViewer: React.FC<PDFCanvasViewerProps> = ({
  url,
  currentPage,
  zoom,
  onTotalPagesLoaded,
  onPageChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const renderTaskRef = useRef<any>(null);

  // Load PDF Document when url changes
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setRenderError(null);

    const loadDoc = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/',
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        onTotalPagesLoaded?.(doc.numPages);
        setLoading(false);
      } catch (err: any) {
        if (isCancelled) return;
        console.error('Failed to load PDF via PDF.js:', err);
        setRenderError(err.message || 'Unable to load PDF booklet.');
        setLoading(false);
      }
    };

    loadDoc();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [url]);

  // Render current page onto canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCancelled = false;

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch (_) {}
        }

        const validPageNum = Math.max(1, Math.min(currentPage, pdfDoc.numPages));
        const page = await pdfDoc.getPage(validPageNum);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Calculate responsive scale based on zoom and container width
        const containerWidth = containerRef.current?.clientWidth || 800;
        const unscaledViewport = page.getViewport({ scale: 1 });
        
        // Base scale fits container width with margin, multiplied by user zoom
        const fitScale = (containerWidth - 32) / unscaledViewport.width;
        const baseScale = Math.max(fitScale, 0.7);
        const finalScale = baseScale * (zoom / 100);

        // HiDPI support for retina crispness
        const pixelRatio = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: finalScale * pixelRatio });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / pixelRatio}px`;
        canvas.style.height = `${viewport.height / pixelRatio}px`;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
      } catch (err: any) {
        if (err?.name === 'RenderingCancelledException') {
          return;
        }
        console.error('Error rendering page:', err);
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (_) {}
      }
    };
  }, [pdfDoc, currentPage, zoom]);

  if (renderError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-300">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="text-base font-semibold text-white mb-2">Booklet Preview Unavailable</h3>
        <p className="text-xs text-gray-400 max-w-md mb-4">{renderError}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition"
        >
          Open Official PDF in New Tab ↗
        </a>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-auto flex flex-col items-center p-2 lg:p-4 bg-gray-950 min-h-0 select-none"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20 text-gray-400">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs font-semibold text-gray-200">Loading Official Examination Booklet...</p>
          <p className="text-[11px] text-gray-500 mt-1">Streaming high-definition vector pages from Google Cloud Storage</p>
        </div>
      ) : (
        <div className="flex flex-col items-center shadow-2xl rounded-sm overflow-hidden bg-white">
          <canvas ref={canvasRef} className="block max-w-full" />
        </div>
      )}
    </div>
  );
};
