import {
  ArrowLeft,
  Map,
  FolderOpen,
  Filter,
  CheckSquare,
  Minus,
  Plus,
  Square,
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
  contextInContent?: boolean;
  onPhotoSizeDecrease?: () => void;
  onPhotoSizeIncrease?: () => void;
  canDecreasePhotoSize?: boolean;
  canIncreasePhotoSize?: boolean;
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
  contextInContent = false,
  onPhotoSizeDecrease,
  onPhotoSizeIncrease,
  canDecreasePhotoSize = true,
  canIncreasePhotoSize = true,
}: ToolbarProps) => {
  const hasSelectionActions = Boolean(onSelectionModeToggle || onFilterClick);
  const hasLocationActions = Boolean(onMapViewToggle || onDirectoryChange);
  const hasToolbarActions = Boolean(
    (onPhotoSizeDecrease && onPhotoSizeIncrease) ||
    hasSelectionActions ||
    hasLocationActions
  );

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
        {!contextInContent && (
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
        )}
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
      {hasToolbarActions && (
        <div className="photos-toolbar-actions">
          {onPhotoSizeDecrease && onPhotoSizeIncrease && (
            <div
              className="photos-toolbar-group"
              aria-label="Photo thumbnail size"
            >
              <Tooltip content="Smaller thumbnails" position="bottom">
                <button
                  onClick={onPhotoSizeDecrease}
                  disabled={!canDecreasePhotoSize}
                  className="photos-icon-button"
                  aria-label="Smaller thumbnails"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </Tooltip>
              <Tooltip content="Larger thumbnails" position="bottom">
                <button
                  onClick={onPhotoSizeIncrease}
                  disabled={!canIncreasePhotoSize}
                  className="photos-icon-button"
                  aria-label="Larger thumbnails"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>
          )}
          {hasSelectionActions && (
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
                      selectionMode
                        ? 'Exit selection mode'
                        : 'Enter selection mode'
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
              {onFilterClick && (
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
              )}
            </div>
          )}
          {hasLocationActions && (
            <div className="photos-toolbar-group">
              {onMapViewToggle && (
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
              )}
              {onDirectoryChange && (
                <Tooltip content="Change Directory" position="bottom">
                  <button
                    onClick={onDirectoryChange}
                    className="photos-icon-button"
                    aria-label="Change directory"
                  >
                    <FolderOpen className="w-4 h-4" />
                  </button>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Toolbar;
