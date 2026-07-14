import { X, Calendar, MapPin, FileType, SortAsc, SortDesc } from 'lucide-react';
import { useFilterStore } from '../../stores/filterStore';
import Button from '../ui/Button';
import Card from '../ui/Card';

export interface FilterPanelProps {
  onClose: () => void;
}

/**
 * Filter panel component for filtering and sorting photos
 * Uses Liquid Glass Card component for elevated surface
 */
const FilterPanel = ({ onClose }: FilterPanelProps) => {
  const {
    searchQuery,
    dateRange,
    fileTypes,
    locationFilter,
    sortBy,
    sortOrder,
    groupBy,
    setSearchQuery,
    setDateRange,
    setFileTypes,
    setLocationFilter,
    setSortBy,
    setSortOrder,
    setGroupBy,
    clearFilters,
  } = useFilterStore();

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    const date = value ? new Date(value) : null;
    if (type === 'start') {
      setDateRange(date, dateRange.end);
    } else {
      setDateRange(dateRange.start, date);
    }
  };

  const handleFileTypeToggle = (type: string) => {
    if (fileTypes.includes(type)) {
      setFileTypes(fileTypes.filter((t) => t !== type));
    } else {
      setFileTypes([...fileTypes, type]);
    }
  };

  return (
    <Card
      variant="custom-glass"
      padding="p-0"
      shadow="l3"
      rounded="md"
      className="border-l border-[var(--border-default)] w-80 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-default)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Filters & Sort</h2>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[var(--glass-bg-1)] transition-smooth"
          aria-label="Close filters"
        >
          <X className="w-5 h-5 text-[var(--text-primary)]" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Sort */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wide flex items-center gap-2">
            <SortAsc className="w-4 h-4" />
            Sort By
          </h3>
          <div className="space-y-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-[var(--glass-bg-1)] border border-[var(--border-default)] rounded-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="location">Location</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full px-3 py-2 bg-[var(--glass-bg-1)] border border-[var(--border-default)] rounded-sm text-[var(--text-primary)] hover:bg-[var(--glass-bg-2)] transition-smooth flex items-center gap-2"
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>
        </div>

        {/* Group By */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
            Group By
          </h3>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as any)}
            className="w-full px-3 py-2 bg-[var(--glass-bg-1)] border border-[var(--border-default)] rounded-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="date">Date</option>
            <option value="location">Location</option>
            <option value="none">None</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wide flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Range
          </h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                Start Date
              </label>
              <input
                type="date"
                value={
                  dateRange.start
                    ? dateRange.start.toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="w-full px-3 py-2 bg-[var(--glass-bg-1)] border border-[var(--border-default)] rounded-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                End Date
              </label>
              <input
                type="date"
                value={
                  dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''
                }
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="w-full px-3 py-2 bg-[var(--glass-bg-1)] border border-[var(--border-default)] rounded-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* File Types */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wide flex items-center gap-2">
            <FileType className="w-4 h-4" />
            File Types
          </h3>
          <div className="space-y-2">
            {['.jpg', '.jpeg', '.png', '.heic', '.raw'].map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={fileTypes.includes(type)}
                  onChange={() => handleFileTypeToggle(type)}
                  className="w-4 h-4 rounded border-[var(--border-default)] bg-[var(--glass-bg-1)] text-primary focus:ring-primary"
                />
                <span className="text-sm text-[var(--text-primary)]">{type.toUpperCase()}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        <div className="pt-4 border-t border-[var(--border-default)]">
          <Button
            onClick={clearFilters}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FilterPanel;
