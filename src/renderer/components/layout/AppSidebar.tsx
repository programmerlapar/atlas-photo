import logoImg from '../../assets/logo.png';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useMotionNavigate } from '../../hooks/useMotionNavigate';
import { useFilterStore, type GroupOption } from '../../stores/filterStore';
import { useThemeStore } from '../../stores/themeStore';
import { usePhotoStore } from '../../stores/photoStore';
import { scanDirectory } from '../../services/api';
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  House,
  Images,
  Moon,
  Settings2,
  SlidersHorizontal,
  Sun,
} from 'lucide-react';

/** Attached top-level navigation, intentionally limited to Library and Albums. */
const AppSidebar = () => {
  const navigate = useMotionNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();
  const { groupBy, setGroupBy } = useFilterStore();
  const {
    currentDirectory,
    setPhotos,
    setCurrentDirectory,
    setLoading,
    setLoadingProgress,
    setError,
  } = usePhotoStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAlbumsExpanded, setIsAlbumsExpanded] = useState(true);
  const [albumPaths, setAlbumPaths] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('photomap-sidebar-albums');
      return cached ? (JSON.parse(cached) as string[]) : [];
    } catch {
      return [];
    }
  });
  const isAllPhotos =
    new URLSearchParams(location.search).get('view') === 'all';
  const isLibrary = location.pathname === '/gallery' && isAllPhotos;
  const isAlbums =
    location.pathname === '/albums' ||
    location.pathname === '/' ||
    (location.pathname === '/gallery' && !isAllPhotos);

  useEffect(() => {
    const loadAlbumPaths = async () => {
      if (!window.electronAPI) return;
      try {
        const paths = await window.electronAPI.getRecentDirectories();
        setAlbumPaths(paths);
        localStorage.setItem('photomap-sidebar-albums', JSON.stringify(paths));
      } catch (error) {
        console.error('Unable to load sidebar albums:', error);
      }
    };
    void loadAlbumPaths();
  }, []);

  const handleAlbumSelect = async (path: string) => {
    navigate('/gallery');
    setLoading(true);
    setError(null);
    if (currentDirectory !== path) setPhotos([]);
    setCurrentDirectory(path);
    setLoadingProgress({ stage: 'scanning', current: 0, total: 0 });
    try {
      const result = await scanDirectory(path);
      if (result.error) setError(result.error);
      else {
        setPhotos(result.photos);
        setAlbumPaths((prev) =>
          prev.includes(path) ? prev : [path, ...prev]
        );
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load album');
    } finally {
      setLoading(false);
      setLoadingProgress(null);
    }
  };

  const handleAlbumsHome = () => {
    setIsAlbumsExpanded(true);
    navigate('/albums');
  };

  return (
    <aside className="desktop-sidebar" aria-label="Primary navigation">
      <div className="desktop-sidebar-brand">
        <img src={logoImg} className="desktop-sidebar-logo" alt="" />
        <div>
          <p className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--photos-primary-text)]">
            Atlas Photo
          </p>
          <p className="mt-0.5 text-[12px] text-[var(--photos-secondary-text)]">
            Your local library
          </p>
        </div>
      </div>

      <nav className="space-y-1 px-2">
        <button
          onClick={() => navigate('/gallery?view=all')}
          className={`desktop-sidebar-item ${isLibrary ? 'desktop-sidebar-item-active' : ''}`}
        >
          <Images className="h-4 w-4" />
          <span>Library</span>
        </button>
        <div className="desktop-sidebar-albums">
          <div
            className={`desktop-sidebar-albums-row ${
              isAlbums ? 'desktop-sidebar-albums-row-active' : ''
            }`}
          >
            <button
              onClick={handleAlbumsHome}
              className="desktop-sidebar-item flex-1"
            >
              <FolderOpen className="h-4 w-4" />
              Albums
            </button>
            <button
              onClick={() => setIsAlbumsExpanded((expanded) => !expanded)}
              className="desktop-sidebar-expand-button"
              aria-label={
                isAlbumsExpanded ? 'Collapse albums' : 'Expand albums'
              }
              aria-expanded={isAlbumsExpanded}
            >
              {isAlbumsExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          {isAlbumsExpanded && (
            <div className="desktop-sidebar-tree" aria-label="Saved albums">
              <button
                onClick={handleAlbumsHome}
                className={`desktop-sidebar-tree-item ${
                  location.pathname === '/albums' || location.pathname === '/'
                    ? 'desktop-sidebar-tree-item-active'
                    : ''
                }`}
                aria-current={isAlbums ? 'page' : undefined}
              >
                <House className="h-3.5 w-3.5" />
                <span>All Albums</span>
              </button>
              {[...albumPaths]
                .sort((a, b) => {
                  const nameA = a.split(/[/\\]/).filter(Boolean).pop() || a;
                  const nameB = b.split(/[/\\]/).filter(Boolean).pop() || b;
                  return nameA.localeCompare(nameB);
                })
                .map((path) => {
                const name = path.split(/[/\\]/).filter(Boolean).pop() || path;
                const isCurrentAlbum =
                  location.pathname === '/gallery' &&
                  !isAllPhotos &&
                  currentDirectory === path;
                return (
                  <button
                    key={path}
                    onClick={() => void handleAlbumSelect(path)}
                    className={`desktop-sidebar-tree-item ${isCurrentAlbum ? 'desktop-sidebar-tree-item-active' : ''}`}
                    aria-current={isCurrentAlbum ? 'page' : undefined}
                    title={path}
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    <span>{name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="desktop-sidebar-footer relative">
        {isSettingsOpen && (
          <div className="desktop-sidebar-settings-panel">
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                Settings
              </span>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                Done
              </button>
            </div>
            <label className="flex cursor-pointer items-center justify-between rounded-xl px-2 py-2 hover:bg-[var(--glass-bg-1)]">
              <span className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                {theme === 'dark' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                Dark appearance
              </span>
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={toggleTheme}
                className="accent-primary"
              />
            </label>
            <label className="mt-1 flex items-center gap-2 px-2 py-2 text-sm text-[var(--text-primary)]">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="flex-1">Group by</span>
              <select
                value={groupBy}
                onChange={(event) =>
                  setGroupBy(event.target.value as GroupOption)
                }
                className="rounded-lg border border-[var(--border-default)] bg-[var(--glass-bg-1)] px-2 py-1 text-xs text-[var(--text-primary)]"
              >
                <option value="date">Date</option>
                <option value="location">Location</option>
                <option value="none">None</option>
              </select>
            </label>
          </div>
        )}
        <button
          onClick={() => setIsSettingsOpen((open) => !open)}
          className="desktop-sidebar-item w-full"
        >
          <Settings2 className="h-4 w-4" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
