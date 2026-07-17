import {
  ArrowLeft,
  Map,
  FolderOpen,
  Filter,
  CheckSquare,
  Square,
  ChevronDown,
} from 'lucide-react';
import Tooltip from '../ui/Tooltip';

export interface ToolbarProps {
  onMapViewToggle?: () => void;
  onDirectoryChange?: () => void;
  onFilterClick?: () => void;
  onSelectionModeToggle?: () => void;
  selectionMode?: boolean;
  selectedCount?: number;
  currentDirectory?: string;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  onViewAll?: () => void;
}

/**
 * Toolbar component for the gallery view
 * A single compact header for gallery navigation and actions. It deliberately
 * sits below the Windows caption area so native controls remain untouched.
 */
const Toolbar = ({
  onMapViewToggle,
  onDirectoryChange,
  onFilterClick,
  onSelectionModeToggle,
  selectionMode = false,
  selectedCount = 0,
  currentDirectory,
  title,
  subtitle,
  onBack,
  onViewAll,
}: ToolbarProps) => {
  return (
    <header className="photos-toolbar">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Left section - Gallery context */}
        {onBack && (
          <div className="photos-toolbar-group shrink-0">
            <button
              onClick={onBack}
              className="photos-icon-button"
              aria-label="Back to collections"
              title="Back to collections"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-[16px] font-semibold leading-5 text-[var(--photos-primary-text)]">
            {title || currentDirectory?.split(/[/\\]/).pop() || 'Photos'}
          </h1>
          {subtitle && (
            <p className="truncate text-xs leading-4 text-[var(--photos-secondary-text)]">
              {subtitle}
            </p>
          )}
        </div>
        {!title && currentDirectory && (
          <button
            onClick={onDirectoryChange}
            className="sr-only"
            title={currentDirectory}
          >
            {currentDirectory.split(/[/\\]/).pop()}
          </button>
        )}
      </div>

      {/* Right section - compact, related action groups */}
      <div className="photos-toolbar-actions">
        {onViewAll && (
          <Tooltip content="View all collections" position="bottom">
            <div className="photos-toolbar-group">
              <button onClick={onViewAll} className="photos-filter-control">
                All Photos
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </Tooltip>
        )}
        <div className="photos-toolbar-group">
          {onSelectionModeToggle && (
            <Tooltip
              content={
                selectionMode
                  ? 'Exit Selection Mode (ESC)'
                  : 'Enter Selection Mode'
              }
              position="bottom"
            >
              <button
                onClick={onSelectionModeToggle}
                className={`photos-icon-button ${selectionMode ? 'photos-icon-button-active' : ''}`}
                aria-label={
                  selectionMode ? 'Exit selection mode' : 'Enter selection mode'
                }
              >
                {selectionMode ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {selectionMode && selectedCount > 0 && (
                  <span className="text-[11px]">{selectedCount}</span>
                )}
              </button>
            </Tooltip>
          )}
          <Tooltip content="Filter Photos" position="bottom">
            <button
              onClick={onFilterClick}
              disabled={selectionMode}
              className="photos-icon-button"
              aria-label="Filter photos"
            >
              <Filter className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
        <div className="photos-toolbar-group">
          <Tooltip content="View on Map" position="bottom">
            <button
              onClick={onMapViewToggle}
              disabled={selectionMode}
              className="photos-icon-button"
              aria-label="View on map"
            >
              <Map className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip content="Change Directory" position="bottom">
            <button
              onClick={onDirectoryChange}
              className="photos-icon-button"
              aria-label="Change directory"
            >
              <FolderOpen className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};

export default Toolbar;
