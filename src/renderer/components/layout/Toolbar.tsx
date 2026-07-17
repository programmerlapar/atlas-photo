import type { ReactNode } from 'react';
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
  overlay?: boolean;
  isScrolled?: boolean;
  onPhotoSizeDecrease?: () => void;
  onPhotoSizeIncrease?: () => void;
  canDecreasePhotoSize?: boolean;
  canIncreasePhotoSize?: boolean;
  actions?: ReactNode;
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
  overlay = false,
  isScrolled = false,
  onPhotoSizeDecrease,
  onPhotoSizeIncrease,
  canDecreasePhotoSize = true,
  canIncreasePhotoSize = true,
  actions,
}: ToolbarProps) => {
  const hasSelectionActions = Boolean(onSelectionModeToggle || onFilterClick);
  const hasLocationActions = Boolean(onMapViewToggle || onDirectoryChange);
  const hasToolbarActions = Boolean(
    (onPhotoSizeDecrease && onPhotoSizeIncrease) ||
    hasSelectionActions ||
    hasLocationActions ||
    actions
  );

  return (
    <header
      className={`photos-toolbar ${overlay ? 'photos-toolbar-overlay' : ''}`}
      data-scrolled={overlay ? isScrolled : undefined}
    >
      <div className="window-drag-region flex min-w-0 flex-1 items-center gap-3">
        {/* Left section - Gallery context */}
        {onBack && (
          <button
            onClick={onBack}
            className="photos-icon-button photos-back-button shrink-0"
            aria-label="Back to collections"
            title="Back to collections"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-[17px] font-semibold leading-5">
            {title || currentDirectory?.split(/[/\\]/).pop() || 'Photos'}
          </h1>
          {subtitle && (
            <p className="truncate text-xs leading-4 photos-toolbar-subtitle">
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
      {hasToolbarActions && (
        <div className="window-no-drag photos-toolbar-actions">
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
                  <Minus className="h-5 w-5" />
                </button>
              </Tooltip>
              <span className="photos-group-divider" aria-hidden="true" />
              <Tooltip content="Larger thumbnails" position="bottom">
                <button
                  onClick={onPhotoSizeIncrease}
                  disabled={!canIncreasePhotoSize}
                  className="photos-icon-button"
                  aria-label="Larger thumbnails"
                >
                  <Plus className="h-5 w-5" />
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
                      <CheckSquare className="h-5 w-5" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                    {selectionMode && selectedCount > 0 && (
                      <span className="text-[11px]">{selectedCount}</span>
                    )}
                  </button>
                </Tooltip>
              )}
              {onSelectionModeToggle && onFilterClick && (
                <span className="photos-group-divider" aria-hidden="true" />
              )}
              {onFilterClick && <Tooltip content="Filter Photos" position="bottom">
                <button
                  onClick={onFilterClick}
                  disabled={selectionMode}
                  className="photos-icon-button"
                  aria-label="Filter photos"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </Tooltip>}
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
                    <Map className="h-5 w-5" />
                  </button>
                </Tooltip>
              )}
              {onMapViewToggle && onDirectoryChange && (
                <span className="photos-group-divider" aria-hidden="true" />
              )}
              {onDirectoryChange && <Tooltip content="Change Directory" position="bottom">
                <button
                  onClick={onDirectoryChange}
                  className="photos-icon-button"
                  aria-label="Change directory"
                >
                  <FolderOpen className="w-5 h-5" />
                </button>
              </Tooltip>}
            </div>
          )}
          {actions}
        </div>
      )}
    </header>
  );
};

export default Toolbar;
