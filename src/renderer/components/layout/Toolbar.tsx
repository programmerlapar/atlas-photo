import {
  ArrowLeft,
  Map,
  FolderOpen,
  Filter,
  Moon,
  Sun,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import { LiquidGlass } from '../ui';

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
 * A single compact header for Gallery navigation and actions.
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
  const { theme, toggleTheme } = useThemeStore();
  const isDarkMode = theme === 'dark';

  return (
      <LiquidGlass
        borderRadius={24}
        blur={20}
        contrast={1.04}
        brightness={1.02}
        saturation={1.05}
        shadowIntensity={0.2}
        displacementScale={0.2}
        clipContent={false}
        // displacementScale={1}  // Enable swirl effect
        // elasticity={0.6}
        // swirlIntensity={50}
        // swirlScale={1}  // Larger swirl (zoomed out) - try values 0.3-2.0
        // swirlRadius={20}
        // edgeThicknessPx={10}
        className="sticky top-3 z-30 mx-4 border border-[var(--glass-border)]"
      >
        <div className="flex items-center justify-between h-16 px-6 gap-4">
          {/* Left section - Gallery context */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--text-primary)] transition-smooth hover:bg-[var(--glass-bg-1)]"
                aria-label="Back to collections"
                title="Back to collections"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-[var(--text-primary)]">
                {title || currentDirectory?.split(/[/\\]/).pop() || 'Photos'}
              </h1>
              {subtitle && <p className="truncate text-xs text-[var(--text-tertiary)]">{subtitle}</p>}
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

          {/* Right section - Actions */}
          <div className="flex items-center gap-2">
            {onViewAll && (
              <Tooltip content="View all collections" position="bottom">
                <Button onClick={onViewAll} variant="secondary" size="sm" className="transition-smooth hover-lift">
                  All Photos
                </Button>
              </Tooltip>
            )}
            {onSelectionModeToggle && (
              <Tooltip
                content={selectionMode ? 'Exit Selection Mode (ESC)' : 'Enter Selection Mode'}
                position="bottom"
              >
                <Button
                  onClick={onSelectionModeToggle}
                  variant={selectionMode ? 'primary' : 'secondary'}
                  size="sm"
                  className="transition-smooth hover-lift"
                >
                  {selectionMode ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  {selectionMode && selectedCount > 0 && (
                    <span className="ml-1 text-xs">({selectedCount})</span>
                  )}
                </Button>
              </Tooltip>
            )}
            <Tooltip content="Filter Photos" position="bottom">
              <Button
                onClick={onFilterClick}
                variant="secondary"
                size="sm"
                disabled={selectionMode}
                className="transition-smooth hover-lift"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="View on Map" position="bottom">
              <Button
                onClick={onMapViewToggle}
                variant="secondary"
                size="sm"
                disabled={selectionMode}
                className="transition-smooth hover-lift"
              >
                <Map className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip
              content={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              position="bottom"
            >
              <Button
                onClick={toggleTheme}
                variant="secondary"
                size="sm"
                className="transition-smooth hover-lift"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-[var(--text-primary)]" />
                ) : (
                  <Moon className="w-4 h-4 text-[var(--text-primary)]" />
                )}
              </Button>
            </Tooltip>
            <Tooltip content="Change Directory" position="bottom">
              <Button
                onClick={onDirectoryChange}
                variant="secondary"
                size="sm"
                className="transition-smooth hover-lift"
              >
                <FolderOpen className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </LiquidGlass>
  );
};

export default Toolbar;
