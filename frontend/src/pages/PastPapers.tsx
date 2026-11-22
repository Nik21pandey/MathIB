import React, { useState, useEffect, useMemo } from 'react';
import FilterBar from '../components/FilterBar';
import PaperList from '../components/PaperList';
import PDFViewer from '../components/PDFViewer';
import SpiderwebTerminal from '../components/SpiderwebTerminal';
import { getAllFilterTypes, mapFiltersForFrontend } from '../utils/filtersApi';
import { getAllPapers, downloadPaper, type Paper as ApiPaper } from '../utils/papersApi';
import { toggleFavorite, checkMultipleFavorites } from '../utils/favoritesApi';
import officialPapersData from '../data/official_papers.json';

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

interface OfficialPaperItem {
  id: number;
  title: string;
  curriculum: string;
  subject?: string;
  paperNumber: string;
  year: number;
  season: string;
  zone?: string;
  totalPages?: number;
  pdfUrl?: string;
  markschemeUrl?: string;
  thumbnailUrl?: string;
}

const OFFICIAL_PAPERS: Paper[] = (officialPapersData as OfficialPaperItem[]).map((p, idx) => ({
  id: p.id || 1000 + idx,
  title: p.title,
  curriculum: p.curriculum,
  subject: p.subject || 'Mathematics',
  paperNumber: p.paperNumber,
  year: p.year,
  season: p.season,
  zone: p.zone,
  type: 'question' as const,
  isFavorite: false,
  totalPages: p.totalPages || 16,
  pdfUrl: p.pdfUrl,
  markschemeUrl: p.markschemeUrl,
}));

interface FilterState extends Record<string, string> {
  [key: string]: string;
}

const filterOfficialPapers = (all: Paper[], filters: FilterState, query: string): Paper[] => {
  return all.filter(p => {
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchCurriculum = p.curriculum.toLowerCase().includes(q);
      const matchPaper = p.paperNumber.toLowerCase().includes(q);
      const matchYear = String(p.year).includes(q);
      const matchSeason = p.season.toLowerCase().includes(q);
      if (!matchTitle && !matchCurriculum && !matchPaper && !matchYear && !matchSeason) {
        return false;
      }
    }

    for (const [key, val] of Object.entries(filters)) {
      if (!val) continue;
      const v = val.toLowerCase().trim();

      if (key === 'paper') {
        const pNum = p.paperNumber.toLowerCase();
        if (v.includes('paper-2') || v === '39' || v.includes('paper 2') || v === 'p2') {
          if (!pNum.includes('paper 2')) return false;
        } else if (v.includes('paper-4') || v === '43' || v.includes('paper 4') || v === 'p4') {
          if (!pNum.includes('paper 4')) return false;
        } else if (v.includes('paper-6') || v === '64' || v.includes('paper 6') || v === 'p6') {
          if (!pNum.includes('paper 6')) return false;
        } else if (v.includes('paper-1') || v === '48' || v.includes('paper 1')) {
          if (!pNum.includes('paper 1')) return false;
        } else if (v.includes('paper-3') || v === '50' || v.includes('paper 3')) {
          if (!pNum.includes('paper 3')) return false;
        } else {
          if (!pNum.includes(v)) return false;
        }
      } else if (key === 'curriculum') {
        const cur = p.curriculum.toLowerCase();
        const tit = p.title.toLowerCase();
        if (v.includes('0607') || v.includes('international') || v === '46') {
          if (!cur.includes('0607') && !tit.includes('0607')) return false;
        } else if (v.includes('0580') || v === '38') {
          if (!cur.includes('0580') && !tit.includes('0580')) return false;
        } else {
          if (!cur.includes(v) && !tit.includes(v)) return false;
        }
      } else if (key === 'year') {
        const yearMap: Record<string, string> = {
          '41': '2026',
          '19': '2025',
          '20': '2024',
          '21': '2023',
          '22': '2022',
        };
        const targetYear = yearMap[v] || v;
        if (String(p.year) !== targetYear) return false;
      } else if (key === 'season') {
        const s = p.season.toLowerCase();
        if (v.includes('feb') || v.includes('march') || v === '42' || v === '31') {
          if (!s.includes('feb') && !s.includes('march')) return false;
        } else if (v.includes('may') || v.includes('june') || v === '29' || v === '52') {
          if (!s.includes('may') && !s.includes('june')) return false;
        } else if (v.includes('oct') || v.includes('nov') || v === '44' || v === '30') {
          if (!s.includes('oct') && !s.includes('nov')) return false;
        } else {
          if (!s.includes(v)) return false;
        }
      } else if (key === 'zone') {
        const z = (p.zone || '').toLowerCase();
        const tit = p.title.toLowerCase();
        if (v.includes('variant-1') || v.includes('variant 1') || v === '63') {
          if (!z.includes('variant 1') && !tit.includes('variant 1') && !tit.includes('21') && !tit.includes('41') && !tit.includes('61')) return false;
        } else if (v.includes('variant-2') || v.includes('variant 2') || v === '61') {
          if (!z.includes('variant 2') && !tit.includes('variant 2') && !tit.includes('22') && !tit.includes('42') && !tit.includes('62')) return false;
        } else if (v.includes('variant-3') || v.includes('variant 3') || v === '62') {
          if (!z.includes('variant 3') && !tit.includes('variant 3') && !tit.includes('23') && !tit.includes('43') && !tit.includes('63')) return false;
        }
      } else if (key === 'subject') {
        // All loaded official papers belong to Mathematics
        if (!v.includes('math') && v !== '9' && v !== '40') {
          return false;
        }
      }
    }
    return true;
  });
};

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

const DEFAULT_FILTER_CONFIGS: FilterConfig[] = [
  {
    key: 'curriculum',
    label: 'Curriculum',
    placeholder: 'Select Curriculum',
    options: [
      { value: '0607', label: 'Cambridge IGCSE International Mathematics (0607)' },
      { value: '0580', label: 'Cambridge IGCSE Mathematics (0580)' },
    ]
  },
  {
    key: 'year',
    label: 'Year',
    placeholder: 'Select Year',
    options: [
      { value: '2026', label: '2026' },
      { value: '2025', label: '2025' },
      { value: '2024', label: '2024' },
      { value: '2023', label: '2023' },
      { value: '2022', label: '2022' },
    ]
  },
  {
    key: 'paper',
    label: 'Paper',
    placeholder: 'Select Paper',
    options: [
      { value: 'Paper 2', label: 'Paper 2' },
      { value: 'Paper 4', label: 'Paper 4' },
      { value: 'Paper 6', label: 'Paper 6' },
    ]
  },
  {
    key: 'season',
    label: 'Season',
    placeholder: 'Select Season',
    options: [
      { value: 'Feb/March', label: 'Feb/March' },
      { value: 'May/June', label: 'May/June' },
      { value: 'Oct/Nov', label: 'Oct/Nov' },
    ]
  }
];

const PastPapers: React.FC = () => {
  const initialOfficialPapers = useMemo(() => {
    return [...OFFICIAL_PAPERS].sort((a, b) => b.year - a.year || b.title.localeCompare(a.title));
  }, []);

  const [papers, setPapers] = useState<Paper[]>(initialOfficialPapers);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(() => {
    return typeof window !== 'undefined' && window.innerWidth >= 1024 && initialOfficialPapers.length > 0
      ? initialOfficialPapers[0]
      : null;
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('year_desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [filterConfigs, setFilterConfigs] = useState<FilterConfig[]>(DEFAULT_FILTER_CONFIGS);
  const [loadingFilters, setLoadingFilters] = useState<boolean>(false);
  const [terminalOpen, setTerminalOpen] = useState<boolean>(false);

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

  useEffect(() => {
    loadPapers();
  }, [filters]);

  const loadPapers = async (): Promise<void> => {
    setLoading(true);
    try {
      const filterSlugs: string[] = [];
      Object.entries(filters).forEach(([, value]) => {
        if (value) {
          filterSlugs.push(value);
        }
      });
      
      const urlParams = new URLSearchParams(window.location.search);
      const categorySlug = urlParams.get('category') || undefined;
      
      const fetchPromise = getAllPapers({
        category: categorySlug,
        filter: filterSlugs.length > 0 ? filterSlugs : undefined,
        search: searchQuery || undefined,
        page: 1,
        page_size: 150,
      });

      const timeoutPromise = new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error('Backend timeout, using official library')), 3000)
      );

      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      let loadedPapers: Paper[] = [];
      if (response.success && response.data && response.data.length > 0) {
        const mappedPapers = response.data.map(mapApiPaperToFrontend);
        
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
      } else {
        loadedPapers = filterOfficialPapers(OFFICIAL_PAPERS, filters, searchQuery);
      }

      setPapers(loadedPapers);

      // On desktop, auto-select first paper if none selected
      if (window.innerWidth >= 1024 && loadedPapers.length > 0) {
        setSelectedPaper(prev => prev && loadedPapers.some(p => p.id === prev.id) ? prev : loadedPapers[0]);
      }
    } catch (error) {
      console.error('Error loading papers from API, using official GCS library:', error);
      const loadedPapers = filterOfficialPapers(OFFICIAL_PAPERS, filters, searchQuery);
      setPapers(loadedPapers);
      if (window.innerWidth >= 1024 && loadedPapers.length > 0) {
        setSelectedPaper(prev => prev && loadedPapers.some(p => p.id === prev.id) ? prev : loadedPapers[0]);
      }
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

  const handleClearAll = (): void => {
    clearFilters();
    setSearchQuery('');
  };

  const handlePaperSelect = (paper: Paper): void => {
    setSelectedPaper(paper);
    setCurrentPage(1);
  };

  const handleToggleFavorite = async (paperId: number): Promise<void> => {
    try {
      const result = await toggleFavorite(paperId);
      setPapers(prev => prev.map(p => 
        p.id === paperId ? { ...p, isFavorite: result.is_favorited } : p
      ));
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
      if (paper.pdfUrl) {
        window.open(paper.pdfUrl, '_blank');
        return;
      }
      await downloadPaper(paper.id);
    } catch (error) {
      console.error('Error downloading paper:', error);
      const fallback = type === 'markscheme' ? paper.markschemeUrl : paper.pdfUrl;
      if (fallback) window.open(fallback, '_blank');
    }
  };

  const handlePrint = (): void => {
    window.print();
  };

  const handleShare = (): void => {
    if (navigator.share && selectedPaper) {
      navigator.share({
        title: selectedPaper.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Paper link copied to clipboard!');
    }
  };

  const handleSearch = (query: string): void => {
    setSearchQuery(query);
  };

  // Sort papers based on current sortBy state
  const sortedPapers = useMemo(() => {
    const list = [...papers];
    if (sortBy === 'year_desc') {
      return list.sort((a, b) => b.year - a.year || b.title.localeCompare(a.title));
    }
    if (sortBy === 'year_asc') {
      return list.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
    }
    if (sortBy === 'title_asc') {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortBy === 'title_desc') {
      return list.sort((a, b) => b.title.localeCompare(a.title));
    }
    return list;
  }, [papers, sortBy]);

  // Keep selected paper synchronized with filtered/sorted results
  useEffect(() => {
    if (sortedPapers.length === 0) {
      setSelectedPaper(null);
    } else if (selectedPaper && !sortedPapers.some(p => p.id === selectedPaper.id)) {
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
        setSelectedPaper(sortedPapers[0]);
      } else {
        setSelectedPaper(null);
      }
    }
  }, [sortedPapers]);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50 overflow-hidden">
      {/* Filter Bar */}
      <div className="hidden md:block flex-shrink-0">
        {loadingFilters ? (
          <div className="bg-white border-b border-gray-200 p-3">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-xs text-gray-600">Loading filters...</span>
            </div>
          </div>
        ) : (
          <FilterBar
            filters={filters}
            filterConfigs={filterConfigs}
            onFilterChange={handleFilterChange}
            onRemoveFilter={(k) => handleFilterChange(k, '')}
            onClearFilters={handleClearAll}
            onSearch={handleSearch}
            searchQuery={searchQuery}
            onOpenTerminal={() => setTerminalOpen(true)}
            totalResultsCount={sortedPapers.length}
          />
        )}
      </div>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden bg-white border-b border-gray-200 p-3 flex-shrink-0">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-between px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-xs font-semibold"
        >
          <span>Search & Filter Papers</span>
          <svg className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showMobileFilters && !loadingFilters && (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {filterConfigs.map((config) => (
                <select
                  key={config.key}
                  value={filters[config.key] || ''}
                  onChange={(e) => handleFilterChange(config.key, e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
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
                placeholder="Search by code or title..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-blue-600 bg-blue-50 rounded text-xs font-semibold border border-blue-200"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Independent Split Panes */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Paper List Column */}
        <div className={`flex-1 lg:max-w-md lg:border-r lg:border-gray-200 bg-white flex flex-col min-h-0 ${selectedPaper ? 'hidden lg:flex' : 'flex'}`}>
          <PaperList
            papers={sortedPapers}
            loading={loading}
            selectedPaper={selectedPaper}
            onPaperSelect={handlePaperSelect}
            onToggleFavorite={handleToggleFavorite}
            onDownload={handleDownload}
            onClearFilters={handleClearAll}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        {/* PDF Viewer Column */}
        <div className={`flex-1 h-full min-h-0 flex flex-col ${selectedPaper ? 'flex' : 'hidden lg:flex'}`}>
          {selectedPaper ? (
            <>
              {/* Mobile Back Button Bar */}
              <div className="lg:hidden bg-gray-950 border-b border-gray-800 px-3 py-2 flex items-center justify-between flex-shrink-0">
                <button
                  onClick={() => setSelectedPaper(null)}
                  className="flex items-center text-blue-400 hover:text-white font-semibold text-xs px-2.5 py-1 rounded bg-gray-900 border border-gray-700 transition"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Papers
                </button>
                <span className="text-xs text-gray-300 font-mono truncate max-w-[200px]">
                  {selectedPaper.title || `${selectedPaper.paperNumber} (${selectedPaper.year})`}
                </span>
              </div>

              <PDFViewer
                pdfUrl={selectedPaper.pdfUrl}
                markschemeUrl={selectedPaper.markschemeUrl}
                paperTitle={selectedPaper.title || `${selectedPaper.curriculum} · ${selectedPaper.paperNumber} (${selectedPaper.season} ${selectedPaper.year})`}
                curriculum={selectedPaper.curriculum}
                paperNumber={selectedPaper.paperNumber}
                season={selectedPaper.season}
                year={selectedPaper.year}
                currentPage={currentPage}
                totalPages={selectedPaper.totalPages || 20}
                onPageChange={setCurrentPage}
                onDownload={(type) => handleDownload(selectedPaper, type)}
                onPrint={handlePrint}
                onShare={handleShare}
              />
            </>
          ) : (
            <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-950 text-gray-400">
              <div className="text-center p-8 max-w-sm">
                <div className="text-5xl mb-3">📄</div>
                <h3 className="text-base font-semibold text-white mb-1">Select an Exam Paper</h3>
                <p className="text-xs text-gray-400">Choose any official question paper from the list on the left to preview the authentic booklet and mark scheme.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spiderweb Study Terminal Command Palette */}
      <SpiderwebTerminal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        onApplyFilter={handleFilterChange}
        onClearFilters={handleClearAll}
        onToggleMarkScheme={(_active) => {
          // Find mark scheme button in DOM and trigger
          const msBtn = document.querySelector('button[title*="Mark Scheme"]') as HTMLButtonElement;
          msBtn?.click();
        }}
        onDownloadCurrent={(type) => {
          if (selectedPaper) {
            handleDownload(selectedPaper, type === 'ms' ? 'markscheme' : 'question');
          }
        }}
        activeFiltersCount={Object.values(filters).filter(v => v).length + (searchQuery ? 1 : 0)}
        totalPapersCount={papers.length}
      />
    </div>
  );
};

export default PastPapers;
