import { useState, useEffect } from 'react';
import { FolderOpen, X, Clock } from 'lucide-react';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';

export interface RecentDirectoriesProps {
  onSelectDirectory: (path: string) => void;
  currentDirectory?: string | null;
  className?: string;
}

/**
 * Recent directories component
 * Displays a list of recently opened directories with options to select or remove them
 */
const RecentDirectories = ({
  onSelectDirectory,
  currentDirectory,
  className = '',
}: RecentDirectoriesProps) => {
  const [recentDirs, setRecentDirs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecentDirectories = async () => {
      try {
        const dirs = await window.electronAPI.getRecentDirectories();
        setRecentDirs(dirs);
      } catch (error) {
        console.error('Error loading recent directories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentDirectories();
  }, []);

  const handleRemoveDirectory = async (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await window.electronAPI.removeRecentDirectory(path);
      if (result.success) {
        setRecentDirs((prev) => prev.filter((dir) => dir !== path));
      }
    } catch (error) {
      console.error('Error removing recent directory:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      const result = await window.electronAPI.clearRecentDirectories();
      if (result.success) {
        setRecentDirs([]);
      }
    } catch (error) {
      console.error('Error clearing recent directories:', error);
    }
  };

  if (isLoading) {
    return null;
  }

  if (recentDirs.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent Directories
        </h3>
        {recentDirs.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-neutral-500 hover:text-neutral-300 transition-smooth"
            aria-label="Clear all recent directories"
          >
            Clear All
          </button>
        )}
      </div>
      <div className="space-y-1">
        {recentDirs.map((dir) => {
          const isCurrent = dir === currentDirectory;
          const dirName = dir.split(/[/\\]/).pop() || dir;

          return (
            <div
              key={dir}
              className={`flex items-center gap-2 p-2 rounded-md transition-smooth ${
                isCurrent
                  ? 'bg-primary/20 border border-primary/30'
                  : 'hover:bg-white/5'
              }`}
            >
              <button
                onClick={() => onSelectDirectory(dir)}
                className="flex-1 flex items-center gap-2 text-left min-w-0 group"
                title={dir}
              >
                <FolderOpen
                  className={`w-4 h-4 flex-shrink-0 ${
                    isCurrent ? 'text-primary' : 'text-neutral-400'
                  }`}
                />
                <span
                  className={`text-sm truncate ${
                    isCurrent ? 'text-primary font-medium' : 'text-neutral-300'
                  }`}
                >
                  {dirName}
                </span>
                {isCurrent && (
                  <span className="text-xs text-primary/70 ml-auto">
                    (Current)
                  </span>
                )}
              </button>
              <Tooltip content="Remove from recent" position="left">
                <button
                  onClick={(e) => handleRemoveDirectory(dir, e)}
                  className="p-1 rounded hover:bg-white/10 transition-smooth opacity-0 group-hover:opacity-100"
                  aria-label={`Remove ${dirName} from recent directories`}
                >
                  <X className="w-3 h-3 text-neutral-400 hover:text-[var(--text-primary)]" />
                </button>
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentDirectories;

