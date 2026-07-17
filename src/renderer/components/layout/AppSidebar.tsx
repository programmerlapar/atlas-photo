import {
  FolderOpen,
  Images,
  Moon,
  Settings2,
  SlidersHorizontal,
  Sun,
} from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useMotionNavigate } from '../../hooks/useMotionNavigate';
import { useFilterStore, type GroupOption } from '../../stores/filterStore';
import { useThemeStore } from '../../stores/themeStore';

/** Attached top-level navigation, intentionally limited to Library and Albums. */
const AppSidebar = () => {
  const navigate = useMotionNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();
  const { groupBy, setGroupBy } = useFilterStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isLibrary = location.pathname === '/gallery';
  const isAlbums = location.pathname === '/albums' || location.pathname === '/';

  return (
    <aside className="desktop-sidebar" aria-label="Primary navigation">
      <div className="desktop-sidebar-brand">
        <p className="text-sm font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
          PhotoMap
        </p>
        <p className="mt-0.5 text-[11px] text-[var(--text-tertiary)]">
          Your local library
        </p>
      </div>

      <nav className="space-y-1 px-2">
        <button
          onClick={() => navigate('/gallery?view=all')}
          className={`desktop-sidebar-item ${isLibrary ? 'desktop-sidebar-item-active' : ''}`}
        >
          <Images className="h-4 w-4" />
          <span>Library</span>
        </button>
        <button
          onClick={() => navigate('/albums')}
          className={`desktop-sidebar-item ${isAlbums ? 'desktop-sidebar-item-active' : ''}`}
        >
          <FolderOpen className="h-4 w-4" />
          <span>Albums</span>
        </button>
      </nav>

      <div className="relative mt-auto border-t border-[var(--border-subtle)] p-2">
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
