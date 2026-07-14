import { forwardRef } from 'react';
import {
  Search,
  Map,
  Settings,
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
  onSearch?: (query: string) => void;
  onMapViewToggle?: () => void;
  onSettingsClick?: () => void;
  onDirectoryChange?: () => void;
  onFilterClick?: () => void;
  onSelectionModeToggle?: () => void;
  selectionMode?: boolean;
  selectedCount?: number;
  currentDirectory?: string;
  searchQuery?: string;
}

/**
 * Toolbar component for the gallery view
 * Includes search, map view toggle, settings, and directory change buttons
 */
const Toolbar = forwardRef<HTMLInputElement, ToolbarProps>(
  (
    {
      onSearch,
      onMapViewToggle,
      onSettingsClick,
      onDirectoryChange,
      onFilterClick,
      onSelectionModeToggle,
      selectionMode = false,
      selectedCount = 0,
      currentDirectory,
      searchQuery = '',
    },
    ref
  ) => {
    const { theme, toggleTheme } = useThemeStore();
    const isDarkMode = theme === 'dark';

    return (
      <LiquidGlass
        borderRadius={0}
        blur={100}          // Strong frosted effect
        contrast={1.2}
        brightness={1.05}
        saturation={1.1}
        shadowIntensity={0.3}
        // displacementScale={1}  // Enable swirl effect
        // elasticity={0.6}
        // swirlIntensity={50}
        // swirlScale={1}  // Larger swirl (zoomed out) - try values 0.3-2.0
        // swirlRadius={20}
        // edgeThicknessPx={10}
        className="border-b border-[var(--border-default)] sticky top-0 z-10"
      >
        <div className="flex items-center justify-between h-16 px-6 gap-4">
          {/* Left section - Directory breadcrumb */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {currentDirectory && (
              <button
                onClick={onDirectoryChange}
                className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] truncate max-w-xs"
                title={currentDirectory}
              >
                {currentDirectory.split(/[/\\]/).pop()}
              </button>
            )}
          </div>

          {/* Center section - Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Search photos..."
                value={searchQuery}
                onChange={(e) => onSearch?.(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--glass-bg-1)] border border-[var(--border-default)] rounded-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-smooth"
                ref={ref}
              />
            </div>
          </div>

          {/* Right section - Actions */}
          <div className="flex items-center gap-2">
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
            <Tooltip content="Settings" position="bottom">
              <Button
                onClick={onSettingsClick}
                variant="secondary"
                size="sm"
                className="transition-smooth hover-lift"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </LiquidGlass>
    );
  }
);

Toolbar.displayName = 'Toolbar';

export default Toolbar;
