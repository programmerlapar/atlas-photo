import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FolderOpen,
  Plus,
  Minus,
  Grid3x3,
  Image as ImageIcon,
  ImagePlus,
  MoreHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {
  selectDirectory,
  getAlbumInfo,
  getAlbumCover,
  removeRecentDirectory,
} from '../services/api';
import { usePhotos } from '../hooks/usePhotos';
import { useMotionNavigate } from '../hooks/useMotionNavigate';
import { usePreferencesStore } from '../stores/preferencesStore';
import { encodeFilePath } from '../utils/photoId';
import Skeleton from '../components/ui/Skeleton';
import Tooltip from '../components/ui/Tooltip';
import { Toolbar } from '../components/layout';

/**
 * Album interface representing a directory/album
 */
interface Album {
  path: string;
  name: string;
  photoCount: number;
  thumbnailPath?: string;
  lastModified?: number;
}

/**
 * Albums view component - home screen showing all albums (directories)
 * Displays albums in a grid layout with ability to add new albums
 */
const AlbumsView = () => {
  const navigate = useMotionNavigate();
  const location = useLocation();
  const { handleScanDirectory } = usePhotos();
  const { albumGridSize, setAlbumGridSize } = usePreferencesStore();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    album: Album;
  } | null>(null);
  const [albumPendingRemoval, setAlbumPendingRemoval] = useState<Album | null>(
    null
  );
  const [isRemovingAlbum, setIsRemovingAlbum] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

  /**
   * Gets responsive grid columns using CSS custom properties for continuous control
   * This provides smoother transitions between sizes
   *
   * Size 0 = large (largest cards ~400px, fewest columns)
   * Size 100 = compact (smallest cards ~150px, most columns)
   *
   * Note: Inverted from original - slider at 0 = large cards, slider at 100 = compact cards
   * This matches user feedback that "large ones is the compact ones"
   */
  const getGridColumnsCSS = () => {
    // Calculate card size: 0 = 400px (large), 100 = 150px (compact)
    // Size decreases as slider value increases (large to compact)
    const cardSize = 400 - (albumGridSize / 100) * 250; // 400 to 150

    // Use CSS custom property for smooth transitions
    // CSS Grid transitions work better with CSS variables
    return {
      '--album-card-size': `${cardSize}px`,
      gridTemplateColumns: `repeat(auto-fill, minmax(var(--album-card-size), 1fr))`,
    } as React.CSSProperties;
  };

  useEffect(() => {
    loadAlbums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Refresh when navigating back to albums view

  useEffect(() => {
    document.documentElement.dataset.albumsHeaderScrolled = String(
      isHeaderScrolled
    );

    return () => {
      delete document.documentElement.dataset.albumsHeaderScrolled;
    };
  }, [isHeaderScrolled]);

  const albumsSubtitle =
    albums.length === 0
      ? 'No albums yet. Add your first directory to get started.'
      : `${albums.length} ${albums.length === 1 ? 'album' : 'albums'}`;

  /**
   * Loads all albums from recent directories
   * Gets album info (photo count, first photo thumbnail) and custom covers
   */
  const loadAlbums = async () => {
    try {
      setIsLoading(true);
      const recentDirs = await window.electronAPI.getRecentDirectories();

      // Convert directories to albums with info
      const albumsData: Album[] = await Promise.all(
        recentDirs.map(async (path: string) => {
          const folderName = path.split(/[/\\]/).filter(Boolean).pop();
          const name = folderName?.trim() || 'Untitled Collection';

          const [customCover, albumInfo] = await Promise.all([
            getAlbumCover(path),
            getAlbumInfo(path),
          ]);

          return {
            path,
            name,
            photoCount: albumInfo.photoCount,
            thumbnailPath:
              customCover.thumbnailPath ??
              customCover.photoPath ??
              albumInfo.thumbnailPath ??
              undefined,
          };
        })
      );

      setAlbums(albumsData);
    } catch (error) {
      console.error('Error loading albums:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles adding a new album (directory)
   */
  const handleAddAlbum = async () => {
    try {
      setIsAdding(true);

      if (!window.electronAPI) {
        throw new Error('Electron API not available');
      }

      const selectedDirectory = await selectDirectory();

      if (selectedDirectory) {
        navigate('/gallery');
        // Let the gallery show its loading state immediately while a new
        // directory receives its first background index.
        void handleScanDirectory(selectedDirectory);
      }
    } catch (error) {
      console.error('Error adding album:', error);
    } finally {
      setIsAdding(false);
    }
  };

  /**
   * Handles clicking on an album to view its photos
   */
  const handleAlbumClick = (album: Album) => {
    // Navigation must not wait for a cold index build. The gallery owns the
    // loading view and becomes responsive immediately.
    navigate('/gallery');
    void handleScanDirectory(album.path);
  };

  const adjustAlbumGridSize = (direction: 'larger' | 'smaller') => {
    // The stored scale is inverse to visual size: lower means larger cards.
    setAlbumGridSize(albumGridSize + (direction === 'larger' ? -10 : 10));
  };

  /**
   * Handles right-click on album to show context menu
   */
  const handleAlbumContextMenu = (e: React.MouseEvent, album: Album) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, album });
  };

  const handleRemoveAlbum = async () => {
    if (!albumPendingRemoval) return;
    setIsRemovingAlbum(true);
    try {
      const result = await removeRecentDirectory(albumPendingRemoval.path);
      if (result.success) {
        setAlbums((current) =>
          current.filter((album) => album.path !== albumPendingRemoval.path)
        );
        setAlbumPendingRemoval(null);
      } else {
        console.error('Unable to remove collection:', result.error);
      }
    } catch (error) {
      console.error('Unable to remove collection:', error);
    } finally {
      setIsRemovingAlbum(false);
    }
  };

  /**
   * Handles setting custom album cover
   * This should be called from gallery view when user selects a photo
   */
  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [contextMenu]);

  if (isLoading) {
    return (
      <div
        className="albums-view"
        onScroll={(event) =>
          setIsHeaderScrolled(event.currentTarget.scrollTop > 12)
        }
      >
        <Toolbar
          title="Albums"
          subtitle="Preparing your collections"
          overlay
          isScrolled={isHeaderScrolled}
        />
        <div className="albums-content space-y-6">
          <div className="grid gap-4" style={getGridColumnsCSS()}>
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton
                key={index}
                height="200px"
                className="aspect-square rounded-md"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="albums-view"
      onScroll={(event) =>
        setIsHeaderScrolled(event.currentTarget.scrollTop > 12)
      }
    >
      <Toolbar
        title="Albums"
        subtitle={albumsSubtitle}
        overlay
        isScrolled={isHeaderScrolled}
        actions={
          albums.length > 0 ? (
            <div
              className="albums-size-group"
              aria-label="Album thumbnail size"
            >
              <Tooltip content="Smaller album thumbnails" position="bottom">
                <button
                  onClick={() => adjustAlbumGridSize('smaller')}
                  className="albums-size-button"
                  title="Smaller album thumbnails"
                  aria-label="Smaller album thumbnails"
                  disabled={albumGridSize >= 100}
                >
                  <Minus className="w-5 h-5" />
                </button>
              </Tooltip>
              <span className="photos-group-divider" aria-hidden="true" />
              <Tooltip content="Larger album thumbnails" position="bottom">
                <button
                  onClick={() => adjustAlbumGridSize('larger')}
                  className="albums-size-button"
                  title="Larger album thumbnails"
                  aria-label="Larger album thumbnails"
                  disabled={albumGridSize <= 0}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>
          ) : undefined
        }
      />
      <div className="albums-content space-y-6">
        {/* Albums Grid */}
        {albums.length === 0 ? (
          <Card
            variant="custom-glass"
            padding="p-12"
            shadow="l2"
            rounded="md"
            className="albums-empty-state max-w-md mx-auto text-center space-y-6"
          >
            <FolderOpen className="w-16 h-16 mx-auto text-neutral-400" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                No Albums Yet
              </h2>
              <p className="text-[var(--text-tertiary)]">
                Add your first directory to start organizing your photos
              </p>
            </div>
          </Card>
        ) : (
          <div
            className="albums-grid grid gap-4 grid-resize-transition"
            style={getGridColumnsCSS()}
          >
            {albums.map((album) => (
              <Card
                key={album.path}
                variant="custom-glass"
                padding="p-0"
                shadow="l1"
                rounded="md"
                className="album-card overflow-hidden cursor-pointer album-card-transition group relative"
                onClick={() => handleAlbumClick(album)}
                onContextMenu={(e) => handleAlbumContextMenu(e, album)}
              >
                {/* Album Thumbnail */}
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                  {album.thumbnailPath ? (
                    <img
                       src={`atlas-photo://${encodeFilePath(album.thumbnailPath)}`}
                      alt={album.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(
                          '[AlbumsView] Error loading album thumbnail:',
                          album.thumbnailPath
                        );
                        // Fallback to icon if image fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-primary/40" />
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="text-white text-center space-y-1">
                      <FolderOpen className="w-8 h-8 mx-auto" />
                      <p className="text-sm font-medium">View Album</p>
                    </div>
                  </div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      const bounds =
                        event.currentTarget.getBoundingClientRect();
                      setContextMenu({
                        x: bounds.right - 184,
                        y: bounds.bottom + 6,
                        album,
                      });
                    }}
                    className="album-card-more"
                    aria-label={`More options for ${album.name}`}
                    title="Collection options"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>

                {/* Album Info */}
                <div className="album-card-info">
                  <h3
                    className="text-[15px] font-semibold text-[var(--photos-primary-text)] truncate"
                    title={album.name}
                  >
                    {album.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[var(--photos-secondary-text)]">
                    <Grid3x3 className="w-3 h-3" />
                    <span>
                      {album.photoCount > 0
                        ? `${album.photoCount} ${album.photoCount === 1 ? 'photo' : 'photos'}`
                        : 'No photos'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Context Menu */}
        {contextMenu && (
          <div
            ref={contextMenuRef}
            className="fixed z-50 glass-surface-2 border border-white/15 rounded-md shadow-l3 p-2 min-w-[180px]"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
          >
            <button
              onClick={() => {
                // Navigate to gallery and allow user to select photo for cover
                handleAlbumClick(contextMenu.album);
                setContextMenu(null);
              }}
              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 rounded-sm flex items-center gap-2"
            >
              <ImagePlus className="w-4 h-4" />
              <span>Set Cover Photo</span>
            </button>
            <div className="h-px bg-white/10 my-1" />
            <button
              onClick={() => {
                setAlbumPendingRemoval(contextMenu.album);
                setContextMenu(null);
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10 rounded-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove from Collections</span>
            </button>
            <div className="h-px bg-white/10 my-1" />
            <button
              onClick={() => setContextMenu(null)}
              className="w-full px-3 py-2 text-left text-sm text-neutral-400 hover:bg-white/10 rounded-sm"
            >
              Cancel
            </button>
          </div>
        )}
        {albumPendingRemoval && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-collection-title"
          >
            <button
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => !isRemovingAlbum && setAlbumPendingRemoval(null)}
              aria-label="Cancel removing collection"
            />
            <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-[var(--bg-elevated)] p-6 shadow-l3">
              <button
                onClick={() => setAlbumPendingRemoval(null)}
                disabled={isRemovingAlbum}
                className="absolute right-4 top-4 rounded-full p-2 text-[var(--text-tertiary)] hover:bg-white/10 hover:text-[var(--text-primary)]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/15 text-red-300">
                <Trash2 className="h-5 w-5" />
              </div>
              <h2
                id="remove-collection-title"
                className="text-lg font-semibold text-[var(--text-primary)]"
              >
                Remove “{albumPendingRemoval.name}”?
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                This only removes the collection from PhotoMap. Your{' '}
                {albumPendingRemoval.photoCount === 1
                  ? 'photo and its folder stay'
                  : 'photos and their folder stay'}{' '}
                exactly where they are.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setAlbumPendingRemoval(null)}
                  disabled={isRemovingAlbum}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleRemoveAlbum}
                  disabled={isRemovingAlbum}
                  className="bg-red-600 hover:bg-red-500"
                >
                  {isRemovingAlbum ? 'Removing...' : 'Remove Collection'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <button
        onClick={handleAddAlbum}
        disabled={isAdding}
        className="albums-create-fab"
      >
        <Plus className="h-4 w-4" />
        <span>{isAdding ? 'Adding...' : 'Add Album'}</span>
      </button>
    </div>
  );
};

export default AlbumsView;
