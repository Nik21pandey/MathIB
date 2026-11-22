import React from 'react';
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline';
import { Sparkles, Terminal } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  placeholder: string;
}

interface FilterBarProps {
  filters: Record<string, string>;
  filterConfigs: FilterConfig[];
  onFilterChange: (key: string, value: string) => void;
  onRemoveFilter?: (key: string) => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onClearFilters: () => void;
  onOpenTerminal?: () => void;
  totalResultsCount?: number;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  filterConfigs,
  onFilterChange,
  onRemoveFilter,
  onSearch,
  searchQuery = '',
  onClearFilters,
  onOpenTerminal,
  totalResultsCount,
}) => {
  // Count active filters
  const activeFilters = Object.entries(filters).filter(([, val]) => val && val.trim() !== '');
  const hasActiveFilters = activeFilters.length > 0 || searchQuery.trim() !== '';

  // Helper to find label for active filter
  const getFilterLabel = (key: string, value: string): string => {
    const config = filterConfigs.find((c) => c.key === key);
    if (!config) return `${key}: ${value}`;
    const option = config.options.find((o) => o.value === value);
    return `${config.label}: ${option ? option.label : value}`;
  };

  // Quick matrix presets for one-click access
  const quickPapers = [
    { label: 'All Papers', value: '' },
    { label: 'Paper 2', value: 'paper-2' },
    { label: 'Paper 4', value: 'paper-4' },
    { label: 'Paper 6', value: 'paper-6' },
  ];

  const quickCurriculums = [
    { label: 'All Curriculums', value: '' },
    { label: '0580 Maths', value: 'cambridge-igcse-mathematics-0580' },
    { label: '0607 Int\'l Maths', value: 'cambridge-igcse-international-mathematics-0607' },
  ];

  const quickYears = [
    { label: 'All Years', value: '' },
    { label: '2026', value: '2026' },
    { label: '2025', value: '2025' },
    { label: '2024', value: '2024' },
    { label: '2023', value: '2023' },
    { label: '2022', value: '2022' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-xs">
      {/* Primary Filter Bar: Dropdowns & Terminal Search */}
      <div className="px-4 py-2.5 flex flex-col space-y-2.5 lg:flex-row lg:space-y-0 lg:items-center lg:gap-3">
        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:gap-2">
          {filterConfigs.map((config) => {
            const isSelected = !!filters[config.key];
            return (
              <div key={config.key} className="relative min-w-0 lg:min-w-[145px]">
                <select
                  value={filters[config.key] || ''}
                  onChange={(e) => onFilterChange(config.key, e.target.value)}
                  className={`appearance-none w-full border rounded-lg px-2.5 py-1.5 pr-7 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 text-blue-900 font-semibold'
                      : 'bg-gray-50 hover:bg-gray-100/70 border-gray-300 text-gray-700'
                  }`}
                >
                  <option value="">{config.placeholder}</option>
                  {config.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 pointer-events-none ${
                    isSelected ? 'text-blue-600' : 'text-gray-400'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Search Bar & Action Terminal Button */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 lg:flex-1 lg:justify-end">
          {/* Live Search Input */}
          {onSearch && (
            <div className="relative flex-1 min-w-0 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search papers (e.g. 0580/42, Oct/Nov 2025)..."
                className="block w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            {/* MathIB Command Palette Launcher */}
            {onOpenTerminal && (
              <button
                onClick={onOpenTerminal}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-semibold rounded-lg transition-all shadow-xs flex items-center gap-1.5 flex-shrink-0"
                title="Launch MathIB Command Palette (Ctrl+K)"
              >
                <CommandLineIcon className="h-3.5 w-3.5 text-blue-400" />
                <span className="hidden sm:inline">Commands</span>
                <kbd className="hidden md:inline px-1 py-0.2 bg-slate-800 border border-slate-700 text-[9px] rounded text-slate-300">
                  Ctrl+K
                </kbd>
              </button>
            )}

            {/* Clear All Button */}
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="px-3 py-1.5 text-xs text-red-600 hover:text-red-700 font-semibold rounded-lg hover:bg-red-50 border border-red-200 transition-colors flex-shrink-0"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MathIB Quick Matrix: One-Click Chips Row */}
      <div className="px-4 py-2 bg-slate-50/60 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-blue-600" />
            Quick:
          </span>

          {/* Quick Papers */}
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-gray-200">
            {quickPapers.map((qp) => {
              const active = (filters['paper'] || '') === qp.value;
              return (
                <button
                  key={qp.label}
                  onClick={() => onFilterChange('paper', qp.value)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                    active
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {qp.label}
                </button>
              );
            })}
          </div>

          {/* Quick Curriculum */}
          <div className="hidden sm:flex items-center gap-1 bg-white p-0.5 rounded-md border border-gray-200">
            {quickCurriculums.map((qc) => {
              const active = (filters['curriculum'] || '') === qc.value;
              return (
                <button
                  key={qc.label}
                  onClick={() => onFilterChange('curriculum', qc.value)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                    active
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {qc.label}
                </button>
              );
            })}
          </div>

          {/* Quick Years */}
          <div className="hidden md:flex items-center gap-1 bg-white p-0.5 rounded-md border border-gray-200">
            {quickYears.map((qy) => {
              const active = (filters['year'] || '') === qy.value;
              return (
                <button
                  key={qy.label}
                  onClick={() => onFilterChange('year', qy.value)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                    active
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {qy.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Filter Count / Feedback */}
        {totalResultsCount !== undefined && (
          <div className="text-[11px] font-mono text-slate-500 font-medium">
            <span className="font-bold text-slate-900">{totalResultsCount}</span> papers matching
          </div>
        )}
      </div>

      {/* Active Filter Badges with 1-Click Removal */}
      {hasActiveFilters && (
        <div className="px-4 py-1.5 bg-blue-50/40 border-t border-blue-100 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider mr-1">
            Active:
          </span>

          {activeFilters.map(([key, val]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-blue-300 text-blue-800 shadow-2xs"
            >
              {getFilterLabel(key, val)}
              <button
                onClick={() => (onRemoveFilter ? onRemoveFilter(key) : onFilterChange(key, ''))}
                className="hover:bg-blue-100 rounded-full p-0.5 text-blue-600 hover:text-blue-900"
                title="Remove filter"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}

          {searchQuery.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-blue-300 text-blue-800 shadow-2xs">
              Search: &quot;{searchQuery}&quot;
              <button
                onClick={() => onSearch && onSearch('')}
                className="hover:bg-blue-100 rounded-full p-0.5 text-blue-600 hover:text-blue-900"
                title="Clear search query"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
