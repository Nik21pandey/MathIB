import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useWorksheet } from '../../contexts/WorksheetContext';
import { useCatalog } from '../../learn/catalog';
import { MINUTES_PER_MARK } from '../../learn/types';

/** Floating summary of the worksheet being built, shown on every page once it has questions. */
const WorksheetTray: React.FC = () => {
  const { ids } = useWorksheet();
  const { index } = useCatalog();
  const location = useLocation();

  if (ids.length === 0 || !index) return null;
  if (location.pathname.startsWith('/worksheet')) return null;

  const marks = ids.reduce((s, id) => s + (index.question(id)?.marks ?? 0), 0);
  return (
    <Link
      to="/worksheet-builder"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-3 bg-gray-900 text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-gray-800 print:hidden"
    >
      <FileText className="h-5 w-5" aria-hidden="true" />
      <span className="text-sm">
        <span className="font-semibold">Worksheet: {ids.length} {ids.length === 1 ? 'question' : 'questions'}</span>
        <span className="text-gray-300"> · {marks} marks · about {Math.round(marks * MINUTES_PER_MARK)} min</span>
      </span>
    </Link>
  );
};

export default WorksheetTray;
