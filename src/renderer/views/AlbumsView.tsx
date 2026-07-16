import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FolderOpen, Plus, Grid3x3, Image as ImageIcon, SlidersHorizontal, ImagePlus } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { selectDirectory, getAlbumInfo, getAlbumCover, setAlbumCover } from '../services/api';
import { usePhotos } from '../hooks/usePhotos';
import { usePreferencesStore } from '../stores/preferencesStore';
import { encodeFilePath } from '../utils/photoId';
import Skeleton from '../components/ui/Skeleton';

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
  const navigate = useNavigate();
  const location = useLocation();
  const { handleScanDirectory, currentDirectory } = usePhotos();
  const { albumGridSize, setAlbumGridSize } = usePreferencesStore();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showSlider, setShowSlider] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; album: Album } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

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
          const name = path.split(/[/\\]/).pop() || path;
          
          // Check for custom cover first
          const customCover = await getAlbumCover(path);
          
          if (customCover.thumbnailPath) {
            // Use custom cover
            return {
              path,
              name,
              photoCount: 0, // Will be updated below
              thumbnailPath: customCover.thumbnailPath,
            };
          }
          
          // Get album info (first photo, count)
          const albumInfo = await getAlbumInfo(path);
          
          return {
            path,
            name,
            photoCount: albumInfo.photoCount,
            thumbnailPath: albumInfo.thumbnailPath || undefined,
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

  /**
   * Handles viewing all albums merged together
   */
  const handleViewAll = () => {
    navigate('/gallery?view=all');
  };

  /**
   * Handles right-click on album to show context menu
   */
  const handleAlbumContextMenu = (e: React.MouseEvent, album: Album) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, album });
  };

  /**
   * Handles setting custom album cover
   * This should be called from gallery view when user selects a photo
   */
  const handleSetAlbumCover = async (album: Album, photoPath: string) => {
    try {
      const result = await setAlbumCover(album.path, photoPath);
      if (result.success && result.thumbnailPath) {
        // Update album with new cover
        setAlbums((prev) =>
          prev.map((a) =>
            a.path === album.path
              ? { ...a, thumbnailPath: result.thumbnailPath || undefined }
              : a
          )
        );
      }
      setContextMenu(null);
    } catch (error) {
      console.error('Error setting album cover:', error);
    }
  };

  /**
   * Handles clicking "Set as Cover" from gallery
   * This will be triggered from gallery view when viewing album photos
   */
  const handleSetCoverFromGallery = async (photoPath: string) => {
    // Find current album being viewed
    const currentAlbum = albums.find((a) => a.path === currentDirectory);
    if (currentAlbum) {
      await handleSetAlbumCover(currentAlbum, photoPath);
    }
  };

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
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
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col p-6">
        <div className="max-w-7xl mx-auto w-full space-y-8">
          <div className="space-y-2">
            <Skeleton height={32} width="200px" />
            <Skeleton height={20} width="300px" />
          </div>
          <div
            className="grid gap-4"
            style={getGridColumnsCSS()}
          >
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={index} height="200px" className="aspect-square rounded-md" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col p-6">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white">Albums</h1>
            <p className="text-neutral-400">
              {albums.length === 0
                ? 'No albums yet. Add your first directory to get started.'
                : `${albums.length} ${albums.length === 1 ? 'album' : 'albums'}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {albums.length > 0 && (
              <>
                <Button
                  onClick={() => setShowSlider(!showSlider)}
                  variant="secondary"
                  size="md"
                  className="flex items-center gap-2"
                  title="Adjust album card size"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Size</span>
                </Button>
                <Button
                  onClick={handleViewAll}
                  variant="secondary"
                  size="md"
                  className="flex items-center gap-2"
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span>View All</span>
                </Button>
              </>
            )}
            <Button
              onClick={handleAddAlbum}
              variant="primary"
              size="md"
              disabled={isAdding}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdding ? 'Adding...' : 'Add Album'}</span>
            </Button>
          </div>
        </div>

        {/* Size Slider */}
        {showSlider && albums.length > 0 && (
          <Card
            variant="custom-glass"
            padding="p-4"
            shadow="l2"
            rounded="md"
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2 flex-1">
              <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-300">Album Size</span>
            </div>
            <div className="flex-1 max-w-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-400">Large</span>
                <span className="text-xs text-neutral-400">Medium</span>
                <span className="text-xs text-neutral-400">Compact</span>
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
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                style={{
                  background: `linear-gradient(to right, 
                    var(--color-primary) 0%, 
                    var(--color-primary) ${albumGridSize}%, 
                    rgba(255,255,255,0.1) ${albumGridSize}%, 
                    rgba(255,255,255,0.1) 100%)`
                }}
              />
              <div className="flex items-center justify-center mt-1">
                <span className="text-xs text-neutral-500">
                  {albumGridSize < 34 && 'Large'}
                  {albumGridSize >= 34 && albumGridSize <= 66 && 'Medium'}
                  {albumGridSize > 66 && 'Compact'} ({albumGridSize})
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Albums Grid */}
        {albums.length === 0 ? (
          <Card
            variant="custom-glass"
            padding="p-12"
            shadow="l2"
            rounded="md"
            className="max-w-md mx-auto text-center space-y-6"
          >
            <FolderOpen className="w-16 h-16 mx-auto text-neutral-400" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">No Albums Yet</h2>
              <p className="text-neutral-400">
                Add your first directory to start organizing your photos
              </p>
            </div>
            <Button onClick={handleAddAlbum} variant="primary" disabled={isAdding}>
              <Plus className="w-4 h-4 mr-2" />
              {isAdding ? 'Adding...' : 'Add Your First Album'}
            </Button>
          </Card>
        ) : (
          <div
            className="grid gap-4 grid-resize-transition"
            style={getGridColumnsCSS()}
          >
            {albums.map((album) => (
              <Card
                key={album.path}
                variant="custom-glass"
                padding="p-0"
                shadow="l1"
                rounded="md"
                className="overflow-hidden cursor-pointer hover:shadow-l2 hover:-translate-y-1 album-card-transition group relative"
                onClick={() => handleAlbumClick(album)}
                onContextMenu={(e) => handleAlbumContextMenu(e, album)}
              >
                {/* Album Thumbnail */}
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                  {album.thumbnailPath ? (
                    <img
                      src={`photomap://${encodeFilePath(album.thumbnailPath)}`}
                      alt={album.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('[AlbumsView] Error loading album thumbnail:', album.thumbnailPath);
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
                </div>

                {/* Album Info */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-white truncate" title={album.name}>
                    {album.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
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
              onClick={() => setContextMenu(null)}
              className="w-full px-3 py-2 text-left text-sm text-neutral-400 hover:bg-white/10 rounded-sm"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumsView;
