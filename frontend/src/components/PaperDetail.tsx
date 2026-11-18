import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, HeartIcon, DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { BASE_URL_GLOBAL } from '../utils/api';
import { getUserFavorites, toggleFavorite } from '../utils/favoritesApi';
import PDFViewer from './PDFViewer';

interface PaperData {
  id: number;
  title: string;
  description?: string;
  category_name?: string;
  pdf_url?: string;
  is_free?: boolean;
  is_premium?: boolean;
  filters?: { id: number; name: string; filter_type_slug?: string }[];
}

const PaperDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [paper, setPaper] = useState<PaperData | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    setLoading(true);
    Promise.all([
      fetch(`${BASE_URL_GLOBAL}/papers/papers/${numId}/`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      getUserFavorites().catch(() => null),
    ]).then(([res, favRes]) => {
      const data = res?.data ?? res;
      if (data && data.id) setPaper(data);
      if (favRes && Array.isArray(favRes.data)) {
        setIsFavorite(favRes.data.some((f: any) => f.paper?.id === numId || f.paper_id === numId));
      }
      setLoading(false);
    });
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!paper) return;
    try {
      const res: any = await toggleFavorite(paper.id);
      if (res && typeof res.is_favorited === 'boolean') {
        setIsFavorite(res.is_favorited);
      } else {
        setIsFavorite((v) => !v);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDownload = async () => {
    if (!paper) return;
    try {
      const res = await fetch(`${BASE_URL_GLOBAL}/papers/papers/${paper.id}/download/`, { method: 'POST' });
      const body = await res.json().catch(() => null);
      const url = body?.data?.pdf_url || paper.pdf_url;
      if (url) window.open(url, '_blank');
    } catch {
      if (paper.pdf_url) window.open(paper.pdf_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-96 bg-gray-200 rounded-xl w-full" />
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Paper Not Found</h1>
        <Link to="/papers" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back to Past Papers
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/papers" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-2 text-sm font-medium">
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Past Papers
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{paper.title}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {paper.category_name && (
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">{paper.category_name}</span>
            )}
            {paper.filters?.map((f) => (
              <span key={f.id} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                {f.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            className="p-2.5 rounded-lg border border-gray-200 hover:bg-red-50 text-gray-600 hover:text-red-600"
            title="Toggle Favorite"
          >
            {isFavorite ? <HeartSolidIcon className="h-6 w-6 text-red-600" /> : <HeartIcon className="h-6 w-6" />}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            <ArrowDownTrayIcon className="h-5 w-5" /> Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[75vh]">
        {paper.pdf_url ? (
          <PDFViewer pdfUrl={paper.pdf_url} paperTitle={paper.title} onDownload={handleDownload} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <DocumentTextIcon className="h-16 w-16 mb-3 text-gray-400" />
            <p>PDF file unavailable</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperDetail;
