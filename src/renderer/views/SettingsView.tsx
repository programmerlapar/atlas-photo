import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FolderOpen, Grid, Moon, Sun, Grid3x3 } from 'lucide-react';
import { usePhotos } from '../hooks/usePhotos';
import { useFilterStore } from '../stores/filterStore';
import { useThemeStore } from '../stores/themeStore';
import { usePreferencesStore } from '../stores/preferencesStore';
import Button from '../components/ui/Button';
import RecentDirectories from '../components/layout/RecentDirectories';

/**
 * Settings view component
 * Displays app settings and preferences
 */
const SettingsView = () => {
  const navigate = useNavigate();
  const { currentDirectory, handleScanDirectory } = usePhotos();
  const { groupBy, sortBy, sortOrder, setGroupBy, setSortBy, setSortOrder } =
    useFilterStore();
  const { theme, toggleTheme } = useThemeStore();
  const { albumGridSize, setAlbumGridSize } = usePreferencesStore();
  const isDarkMode = theme === 'dark';

  const handleDirectoryChange = async () => {
    // Directory change is handled in WelcomeScreen
    navigate('/');
  };

  const handleSelectRecentDirectory = async (path: string) => {
    try {
      await handleScanDirectory(path);
      navigate('/gallery');
    } catch (error) {
      console.error('Error selecting recent directory:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* Settings panel */}
      <div className="glass-surface-2 border-r border-[var(--border-default)] shadow-l2 w-80 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/gallery')}
              className="p-2 rounded hover:bg-[var(--glass-bg-1)] transition-smooth"
              aria-label="Back to gallery"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
            </button>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Settings</h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Directory Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wide flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Directory
              </h3>
              {currentDirectory && (
                <div className="space-y-2">
                  <p className="text-sm text-[var(--text-primary)] truncate" title={currentDirectory}>
                    {currentDirectory.split(/[/\\]/).pop()}
                  </p>
                  <Button
                    onClick={handleDirectoryChange}
                    variant="secondary"
                    size="sm"
                  >
                    Change Directory
                  </Button>
                </div>
              )}
            </div>

            {/* Recent Directories */}
            <RecentDirectories
              onSelectDirectory={handleSelectRecentDirectory}
              currentDirectory={currentDirectory}
            />
          </div>

          {/* View Preferences */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wide flex items-center gap-2">
              <Grid className="w-4 h-4" />
              View Preferences
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  Group By
                </label>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy((e.target as HTMLSelectElement).value as any)}
                  className="w-full px-3 py-2 bg-[var(--glass-bg-1)] border border-[var(--border-default)] rounded-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="date">Date</option>
                  <option value="location">Location</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy((e.target as HTMLSelectElement).value as any)}
                  className="w-full px-3 py-2 bg-[var(--glass-bg-1)] border border-[var(--border-default)] rounded-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="date">Date</option>
                  <option value="name">Name</option>
                  <option value="location">Location</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  Sort Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder((e.target as HTMLSelectElement).value as 'asc' | 'desc')
                  }
                  className="w-full px-3 py-2 bg-[var(--glass-bg-1)] border border-[var(--border-default)] rounded-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
                  Album Grid Size
                </label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)]">Large</span>
                    <span className="text-xs text-[var(--text-secondary)]">Medium</span>
                    <span className="text-xs text-[var(--text-secondary)]">Compact</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={albumGridSize}
                    onChange={(e) => {
                      const value = parseInt((e.target as HTMLInputElement).value);
                      setAlbumGridSize(value);
                    }}
                    className="w-full h-2 bg-[var(--glass-bg-1)] rounded-full appearance-none cursor-pointer accent-primary"
                    style={{
                      background: `linear-gradient(to right, 
                        var(--color-primary) 0%, 
                        var(--color-primary) ${albumGridSize}%, 
                        var(--glass-bg-1) ${albumGridSize}%, 
                        var(--glass-bg-1) 100%)`
                    }}
                  />
                  <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                    <Grid3x3 className="w-3 h-3" />
                    <span>
                      {albumGridSize < 34 && 'Large cards (fewer per row, better for desktop)'}
                      {albumGridSize >= 34 && albumGridSize <= 66 && 'Balanced view (default)'}
                      {albumGridSize > 66 && 'Compact view (more albums per row)'}
                      {' '}({albumGridSize}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wide flex items-center gap-2">
              {isDarkMode ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
              Appearance
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={toggleTheme}
                  className="w-4 h-4 rounded border-[var(--border-default)] bg-[var(--glass-bg-1)] text-primary focus:ring-primary"
                  aria-label="Toggle dark mode"
                />
                <span className="text-sm text-[var(--text-primary)]">Dark Mode</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 p-8">
        <div className="max-w-2xl space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Settings</h2>
            <p className="text-[var(--text-tertiary)]">
              Configure your PhotoMap preferences and view options
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
