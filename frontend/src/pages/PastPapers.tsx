import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterBar from '../components/FilterBar';
import PaperList from '../components/PaperList';
import PDFViewer from '../components/PDFViewer';
import { getAllFilterTypes, mapFiltersForFrontend } from '../utils/filtersApi';
import { getAllPapers, getPaperById, downloadPaper, type Paper as ApiPaper, type PaperDetail } from '../utils/papersApi';
import { toggleFavorite, checkMultipleFavorites } from '../utils/favoritesApi';

// TypeScript interfaces
interface Paper {
  id: number;
  title: string;
  curriculum: string;
  subject: string;
  paperNumber: string;
  year: number;
  season: string;
  zone?: string;
  duration?: number;
  type: 'question' | 'marking-scheme' | 'examiner-report';
  isFavorite: boolean;
  totalPages?: number;
  pdfUrl?: string;
  markschemeUrl?: string;
}

const FALLBACK_STARTER_PAPERS: Paper[] = [
  {
    id: 101,
    title: '0580/22 Paper 2 (Extended) Non-Calculator · May/June 2024',
    curriculum: 'Cambridge IGCSE Mathematics (0580)',
    subject: 'Mathematics',
    paperNumber: 'Paper 2',
    year: 2024,
    season: 'May/June',
    zone: 'TZ2',
    type: 'question',
    isFavorite: false,
    totalPages: 16,
    pdfUrl: '/samples/0580_s24_qp_22.pdf',
    markschemeUrl: '/samples/0580_s24_ms_22.pdf',
  },
  {
    id: 102,
    title: '0580/42 Paper 4 (Extended) Calculator · May/June 2024',
    curriculum: 'Cambridge IGCSE Mathematics (0580)',
    subject: 'Mathematics',
    paperNumber: 'Paper 4',
    year: 2024,
    season: 'May/June',
    zone: 'TZ2',
    type: 'question',
    isFavorite: false,
    totalPages: 20,
    pdfUrl: '/samples/0580_s24_qp_42.pdf',
    markschemeUrl: '/samples/0580_s24_ms_42.pdf',
  },
  {
    id: 103,
    title: 'IB DP Math AA HL Paper 1 TZ1 · May 2024',
    curriculum: 'IB DP Mathematics: Analysis and Approaches HL',
    subject: 'Mathematics',
    paperNumber: 'Paper 1',
    year: 2024,
    season: 'May',
    zone: 'TZ1',
    type: 'question',
    isFavorite: false,
    totalPages: 18,
    pdfUrl: '/samples/ib_aa_hl_m24_qp_1.pdf',
    markschemeUrl: '/samples/ib_aa_hl_m24_ms_1.pdf',
  },
  {
    id: 104,
    title: 'Edexcel IGCSE 4MA1 Paper 1H (Higher Tier) · June 2024',
    curriculum: 'Pearson Edexcel International GCSE Mathematics A (4MA1)',
    subject: 'Mathematics',
    paperNumber: 'Paper 1H',
    year: 2024,
    season: 'May/June',
    zone: 'Higher',
    type: 'question',
    isFavorite: false,
    totalPages: 24,
    pdfUrl: '/samples/edexcel_4ma1_1h_qp.pdf',
    markschemeUrl: '/samples/edexcel_4ma1_1h_ms.pdf',
  },
  {
    id: 105,
    title: 'Edexcel GCSE 1MA1 Paper 1 (Non-Calculator) Higher Tier · June 2024',
    curriculum: 'Pearson Edexcel GCSE Mathematics (1MA1)',
    subject: 'Mathematics',
    paperNumber: 'Paper 1',
    year: 2024,
    season: 'May/June',
    zone: 'Higher',
    type: 'question',
    isFavorite: false,
    totalPages: 20,
    pdfUrl: '/samples/edexcel_1ma1_1h_qp.pdf',
    markschemeUrl: '/samples/edexcel_1ma1_1h_ms.pdf',
  },
];

interface FilterState extends Record<string, string> {
  [key: string]: string;
}

interface FilterOption {
  value: string;
  label: string;
  code?: string;
}

interface FilterConfig {
  key: string;
  label: string;
  placeholder: string;
  options: FilterOption[];
  isRequired?: boolean;
  allowMultiple?: boolean;
}

const PastPapers: React.FC = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [filterConfigs, setFilterConfigs] = useState<FilterConfig[]>([]);
  const [loadingFilters, setLoadingFilters] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Convert API paper to frontend Paper format
  const mapApiPaperToFrontend = (apiPaper: ApiPaper): Paper => {
    const getCurriculum = () => apiPaper.filters.find(f => f.filter_type_slug === 'curriculum')?.name || apiPaper.category_name;
    const getSubject = () => apiPaper.filters.find(f => f.filter_type_slug === 'subject')?.name || 'N/A';
    const getSeason = () => apiPaper.filters.find(f => f.filter_type_slug === 'season')?.name || 'N/A';
    const getYear = () => {
      const yearFilter = apiPaper.filters.find(f => f.filter_type_slug === 'year');
      return yearFilter ? parseInt(yearFilter.name) : new Date().getFullYear();
    };
    const getZone = () => apiPaper.filters.find(f => f.filter_type_slug === 'zone')?.name;
    
    return {
      id: apiPaper.id,
      title: apiPaper.title,
      curriculum: getCurriculum(),
      subject: getSubject(),
      paperNumber: apiPaper.title.split(' ').pop() || 'P1',
      year: getYear(),
      season: getSeason(),
      zone: getZone(),
      duration: undefined,
      type: 'question',
      isFavorite: false,
      totalPages: apiPaper.page_count || undefined,
      pdfUrl: apiPaper.pdf_url || undefined,
      markschemeUrl: apiPaper.markscheme_url || undefined,
    };
  };

  // Load filter configurations from backend
  useEffect(() => {
    const loadFilters = async () => {
      try {
        setLoadingFilters(true);
        const filterTypes = await getAllFilterTypes();
        const configs = mapFiltersForFrontend(filterTypes);
        setFilterConfigs(configs);
        
        // Initialize filter state with empty values
        const initialFilters: FilterState = {};
        configs.forEach(config => {
          initialFilters[config.key] = '';
        });
        setFilters(initialFilters);
      } catch (error) {
        console.error('Error loading filters:', error);
      } finally {
        setLoadingFilters(false);
      }
    };

    loadFilters();
  }, []);

  // Filter configurations for the filter bar
  // Removed hardcoded filterConfigs - now loaded from backend

  useEffect(() => {
    loadPapers();
  }, [filters]);

  const loadPapers = async (): Promise<void> => {
    setLoading(true);
    try {
      // Build filter slugs from selected filter values
      const filterSlugs: string[] = [];
      Object.entries(filters).forEach(([, value]) => {
        if (value) {
          filterSlugs.push(value); // value is the slug
        }
      });
      
      // Get URL params for category
      const urlParams = new URLSearchParams(window.location.search);
      const categorySlug = urlParams.get('category') || undefined;
      
      const response = await getAllPapers({
        category: categorySlug,
        filter: filterSlugs.length > 0 ? filterSlugs : undefined,
        search: searchQuery || undefined,
        page: 1,
        page_size: 50,
      });
      
      let loadedPapers: Paper[] = [];
      if (response.success && response.data && response.data.length > 0) {
        const mappedPapers = response.data.map(mapApiPaperToFrontend);
        
        // Check favorite status for all papers
        const paperIds = mappedPapers.map(p => p.id);
        try {
          const favoriteMap = await checkMultipleFavorites(paperIds);
          loadedPapers = mappedPapers.map(paper => ({
            ...paper,
            isFavorite: favoriteMap.get(paper.id) || false
          }));
        } catch (error) {
          console.error('Error loading favorite status:', error);
          loadedPapers = mappedPapers;
        }
        setTotalCount(response.count);
        setTotalPages(response.total_pages);
      } else {
        // Fallback to starter library when backend is empty or waking up
        loadedPapers = FALLBACK_STARTER_PAPERS;
        setTotalCount(FALLBACK_STARTER_PAPERS.length);
        setTotalPages(1);
      }
      setPapers(loadedPapers);
      setSelectedPaper(prev => prev || loadedPapers[0] || null);
    } catch (error) {
      console.error('Error loading papers:', error);
      setPapers(FALLBACK_STARTER_PAPERS);
      setSelectedPaper(prev => prev || FALLBACK_STARTER_PAPERS[0] || null);
      setTotalCount(FALLBACK_STARTER_PAPERS.length);
      setTotalPages(1);
    }
    setLoading(false);
  };

  const handleFilterChange = (key: string, value: string): void => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = (): void => {
    const clearedFilters: FilterState = {};
    filterConfigs.forEach(config => {
      clearedFilters[config.key] = '';
    });
    setFilters(clearedFilters);
  };

  const handlePaperSelect = (paper: Paper): void => {
    setSelectedPaper(paper);
    setCurrentPage(1);
  };

  const handleToggleFavorite = async (paperId: number): Promise<void> => {
    try {
      const result = await toggleFavorite(paperId);
      // Update local state to reflect the change
      setPapers(prev => prev.map(p => 
        p.id === paperId ? { ...p, isFavorite: result.is_favorited } : p
      ));
      // Update selected paper if it's the one being toggled
      if (selectedPaper && selectedPaper.id === paperId) {
        setSelectedPaper({ ...selectedPaper, isFavorite: result.is_favorited });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDownload = async (paper: Paper, type: 'question' | 'markscheme' = 'question'): Promise<void> => {
    try {
      if (type === 'markscheme' && paper.markschemeUrl) {
        window.open(paper.markschemeUrl, '_blank');
        return;
      }
      await downloadPaper(paper.id);
      console.log('Paper download initiated:', paper.title);
    } catch (error) {
      console.error('Error downloading paper:', error);
      const fallback = type === 'markscheme' ? paper.markschemeUrl : paper.pdfUrl;
      if (fallback) window.open(fallback, '_blank');
    }
  };

  const handlePrint = (): void => {
    console.log('Printing PDF');
    // Implement print logic
  };

  const handleShare = (): void => {
    console.log('Sharing PDF');
    // Implement share logic
  };

  const handleSearch = (query: string): void => {
    setSearchQuery(query);
    // Implement search logic
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Filter Bar - Hidden on mobile, shown on tablet+ */}
      <div className="hidden md:block">
        {loadingFilters ? (
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading filters...</span>
            </div>
          </div>
        ) : (
          <FilterBar
            filters={filters}
            filterConfigs={filterConfigs}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            onSearch={handleSearch}
            searchQuery={searchQuery}
          />
        )}
      </div>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-between px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200"
        >
          <span className="font-medium">Filters</span>
          <svg className={`w-5 h-5 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Mobile Filter Panel */}
        {showMobileFilters && !loadingFilters && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {filterConfigs.map((config) => (
                <select
                  key={config.key}
                  value={filters[config.key] || ''}
                  onChange={(e) => handleFilterChange(config.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{config.placeholder}</option>
                  {config.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search papers..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg text-sm font-medium border border-blue-200"
              >
                Clear
              </button>
            </div>
          </div>
        )}
        
        {showMobileFilters && loadingFilters && (
          <div className="mt-4 flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading filters...</span>
          </div>
        )}
      </div>

      {/* Main Content - Papers and PDF Viewer */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Paper List */}
        <div className="flex-1 lg:max-w-md">
          <PaperList
            papers={papers}
            loading={loading}
            selectedPaper={selectedPaper}
            onPaperSelect={handlePaperSelect}
            onToggleFavorite={handleToggleFavorite}
            onDownload={handleDownload}
          />
        </div>

        {/* PDF Viewer - Hidden on mobile unless paper selected */}
        <div className={`lg:flex-1 lg:min-w-[400px] ${selectedPaper ? 'block' : 'hidden lg:block'}`}>
          {selectedPaper && (
            <div className="lg:hidden bg-white border-b border-gray-200 p-4">
              <button
                onClick={() => setSelectedPaper(null)}
                className="flex items-center text-blue-600 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Papers
              </button>
            </div>
          )}
          <PDFViewer
            pdfUrl={selectedPaper?.pdfUrl}
            markschemeUrl={selectedPaper?.markschemeUrl}
            paperTitle={selectedPaper ? `${selectedPaper.curriculum} · ${selectedPaper.paperNumber} (${selectedPaper.season} ${selectedPaper.year})` : undefined}
            curriculum={selectedPaper?.curriculum}
            paperNumber={selectedPaper?.paperNumber}
            season={selectedPaper?.season}
            year={selectedPaper?.year}
            currentPage={currentPage}
            totalPages={selectedPaper?.totalPages || 20}
            onPageChange={setCurrentPage}
            onDownload={(type) => selectedPaper && handleDownload(selectedPaper, type)}
            onPrint={handlePrint}
            onShare={handleShare}
          />
        </div>
      </div>
    </div>
  );
};

export default PastPapers;
