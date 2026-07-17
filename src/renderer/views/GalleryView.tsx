import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePhotos } from '../hooks/usePhotos';
import { useFilterStore } from '../stores/filterStore';
import { useKeyboard } from '../hooks/useKeyboard';
import { useMotionNavigate } from '../hooks/useMotionNavigate';
import { encodePhotoId } from '../utils/photoId';
import { Loader2, FolderOpen } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { FloatingLiquidContainer } from '../components/ui';
import { PhotoGrid } from '../components/gallery';
import BatchOperationsBar from '../components/gallery/BatchOperationsBar';
import { Toolbar, StatusBar } from '../components/layout';
import FilterPanel from '../components/filters/FilterPanel';
import MetadataPreview from '../components/gallery/MetadataPreview';
import Skeleton from '../components/ui/Skeleton';
import {
  selectDirectory,
  batchSharePhotos,
  batchExportPhotos,
  batchDeletePhotos,
} from '../services/api';
import type { Photo } from '../../../shared/types/photo';

/**
 * Main gallery view component
 * Displays photos in a grid layout with iOS Photos-style interface
 */
const GalleryView = () => {
  const navigate = useMotionNavigate();
  const location = useLocation();
  const {
    photos,
    currentDirectory,
    isLoading,
    loadingProgress,
    error,
    handleScanDirectory,
    loadPhotos,
    getLastDirectory,
  } = usePhotos();

  const [hoveredPhoto, setHoveredPhoto] = useState<Photo | null>(null);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  // Check if we're in "All" view mode
  const isAllView = new URLSearchParams(location.search).get('view') === 'all';

  const {
    groupBy,
    applyFilters,
  } = useFilterStore();

  // Apply filters and sorting (must be declared before handlers that use it)
  const filteredPhotos = useMemo(() => applyFilters(photos), [applyFilters, photos]);

  useEffect(() => {
    // Load photos based on view mode
    const loadPhotosForView = async () => {
      if (isAllView) {
        // For "All" view, we would merge photos from all albums
        // For now, this is a placeholder - we'll need to implement
        // multi-album photo loading in the backend
        // For MVP, we'll just load the current directory
        const lastDirectory = await getLastDirectory();
        if (lastDirectory && photos.length === 0 && !isLoading) {
          loadPhotos();
        }
      } else {
        // For single album view, load current directory
        const lastDirectory = await getLastDirectory();
        if (lastDirectory && photos.length === 0 && !isLoading) {
          loadPhotos();
        }
      }
    };

    loadPhotosForView();
  }, [isAllView, getLastDirectory, isLoading, loadPhotos, photos.length]);

  // Get selected photos (must be declared before handlers that use it)
  const selectedPhotos = filteredPhotos.filter((photo) =>
    selectedPhotoIds.includes(photo.id)
  );

  // Toggle selection mode
  const handleToggleSelectionMode = () => {
    setSelectionMode((prev) => {
      if (!prev) {
        // Entering selection mode
        return true;
      } else {
        // Exiting selection mode - clear selection
        setSelectedPhotoIds([]);
        return false;
      }
    });
  };

  // Toggle photo selection
  const handleTogglePhotoSelect = useCallback((photo: Photo) => {
    setSelectedPhotoIds((prev) => {
      if (prev.includes(photo.id)) {
        return prev.filter((id) => id !== photo.id);
      } else {
        return [...prev, photo.id];
      }
    });
  }, []);

  // Select all photos
  const handleSelectAll = () => {
    setSelectedPhotoIds(filteredPhotos.map((photo) => photo.id));
  };

  // Batch share photos
  const handleBatchShare = async () => {
    if (selectedPhotos.length === 0) return;

    setIsProcessingBatch(true);
    try {
      const photoPaths = selectedPhotos.map((photo) => photo.path);
      const result = await batchSharePhotos(photoPaths);
      console.log('Batch share result:', result);
    } catch (error) {
      console.error('Error batch sharing photos:', error);
    } finally {
      setIsProcessingBatch(false);
    }
  };

  // Batch export photos
  const handleBatchExport = async () => {
    if (selectedPhotos.length === 0) return;

    setIsProcessingBatch(true);
    try {
      const photoPaths = selectedPhotos.map((photo) => photo.path);
      const result = await batchExportPhotos(photoPaths);

      if (result.success) {
        console.log(`Successfully exported ${result.successCount} photo(s)`);
        // Clear selection after successful export
        setSelectedPhotoIds([]);
      } else {
        console.error('Error batch exporting photos:', result.error);
        if (result.errorCount > 0) {
          console.warn(`${result.errorCount} photo(s) failed to export`);
        }
      }
    } catch (error) {
      console.error('Error batch exporting photos:', error);
    } finally {
      setIsProcessingBatch(false);
    }
  };

  // Batch delete photos
  const handleBatchDelete = async () => {
    if (selectedPhotos.length === 0) return;

    setIsProcessingBatch(true);
    try {
      const photoPaths = selectedPhotos.map((photo) => photo.path);
      const result = await batchDeletePhotos(photoPaths);

      if (result.success) {
        console.log(`Successfully deleted ${result.successCount} photo(s)`);
        // Clear selection and exit selection mode after successful delete
        setSelectedPhotoIds([]);
        setSelectionMode(false);
      } else if (result.error !== 'User cancelled') {
        console.error('Error batch deleting photos:', result.error);
        if (result.errorCount > 0) {
          console.warn(`${result.errorCount} photo(s) failed to delete`);
        }
      }
    } catch (error) {
      console.error('Error batch deleting photos:', error);
    } finally {
      setIsProcessingBatch(false);
    }
  };

  // Keyboard navigation
  useKeyboard(
    {
      onEscape: () => {
        if (selectionMode) {
          setSelectionMode(false);
          setSelectedPhotoIds([]);
        }
      },
      onCtrlA: (e) => {
        if (selectionMode) {
          e.preventDefault();
          handleSelectAll();
        }
      },
    },
    true
  );

  const handlePhotoClick = useCallback((photo: Photo) => {
    if (!selectionMode) {
      navigate(`/detail/${encodePhotoId(photo.id)}`);
    }
  }, [navigate, selectionMode]);

  const handleMapViewToggle = () => {
    navigate('/map');
  };

  const handleDirectoryChange = async () => {
    try {
      const directory = await selectDirectory();
      if (directory) {
        await handleScanDirectory(directory);
      }
    } catch (error) {
      console.error('Error changing directory:', error);
    }
  };

  const handleBackToAlbums = () => {
    navigate('/albums');
  };

  if (isLoading && photos.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
        <Toolbar
          onMapViewToggle={handleMapViewToggle}
          onDirectoryChange={handleDirectoryChange}
          onFilterClick={() => setShowFilterPanel(!showFilterPanel)}
          title={currentDirectory?.split(/[/\\]/).pop() || 'Photos'}
          subtitle="Preparing your photos"
          onBack={handleBackToAlbums}
        />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4 mb-6">
            <Skeleton height={24} width="200px" />
            <Skeleton height={20} width="150px" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 20 }).map((_, index) => (
              <Skeleton
                key={index}
                height="100%"
                className="aspect-square"
                variant="rectangular"
              />
            ))}
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 glass-surface-2 border-t border-[var(--border-default)] p-4">
          <div className="flex items-center justify-center gap-4">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-sm text-[var(--text-primary)] font-medium">
                {loadingProgress?.stage === 'scanning' &&
                  'Scanning directory...'}
                {loadingProgress?.stage === 'metadata' &&
                  'Extracting metadata...'}
                {loadingProgress?.stage === 'thumbnails' &&
                  'Generating thumbnails...'}
              </p>
              {loadingProgress && (
                <p className="text-xs text-[var(--text-tertiary)]">
                  {loadingProgress.current} / {loadingProgress.total} photos
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && photos.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="glass-surface-2 rounded-md shadow-l2 p-8 max-w-md text-center space-y-4">
          <p className="text-lg text-[var(--color-error)] font-semibold">Error</p>
          <p className="text-[var(--text-secondary)]">{error}</p>
          <Button onClick={handleBackToAlbums} variant="secondary">
            Go Back to Albums
          </Button>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <Card
          variant="custom-glass"
          padding="p-12"
          shadow="l2"
          rounded="md"
          className="max-w-md text-center space-y-6"
        >
          <FolderOpen className="w-16 h-16 mx-auto text-[var(--text-tertiary)]" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">No Photos Found</h2>
            <p className="text-[var(--text-tertiary)]">
              Select a directory to start browsing your photos
            </p>
          </div>
          <Button onClick={handleBackToAlbums} variant="primary">
            Back to Albums
          </Button>
        </Card>
      </div>
    );
  }

  // Get display name for current view
  const getViewTitle = () => {
    if (isAllView) {
      return 'All Photos';
    }
    if (currentDirectory) {
      const dirName = currentDirectory.split(/[/\\]/).pop() || currentDirectory;
      return dirName;
    }
    return 'Photos';
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <Toolbar
        onMapViewToggle={handleMapViewToggle}
        onDirectoryChange={handleDirectoryChange}
        onFilterClick={() => setShowFilterPanel(!showFilterPanel)}
        onSelectionModeToggle={handleToggleSelectionMode}
        selectionMode={selectionMode}
        selectedCount={selectedPhotoIds.length}
        currentDirectory={currentDirectory || undefined}
        title={getViewTitle()}
        subtitle={isAllView ? 'All collections' : `${filteredPhotos.length} ${filteredPhotos.length === 1 ? 'photo' : 'photos'}`}
        onBack={handleBackToAlbums}
        onViewAll={isAllView ? undefined : () => navigate('/gallery?view=all')}
      />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 pb-24">
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-[var(--text-tertiary)]">
                No photos match the current filters
              </p>
            </div>
          ) : (
            <PhotoGrid
              photos={filteredPhotos}
              onPhotoClick={handlePhotoClick}
              onPhotoHover={setHoveredPhoto}
              selectedPhotoIds={selectedPhotoIds}
              selectionMode={selectionMode}
              onToggleSelect={handleTogglePhotoSelect}
              groupBy={groupBy}
            />
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="fixed right-0 top-16 bottom-12 z-30">
          <FilterPanel onClose={() => setShowFilterPanel(false)} />
        </div>
      )}

      {/* Metadata Preview (on hover) */}
      {hoveredPhoto && (
        <div className="fixed bottom-24 left-6 z-20 pointer-events-none">
          <FloatingLiquidContainer className="w-fit">
            <MetadataPreview photo={hoveredPhoto} />
          </FloatingLiquidContainer>
        </div>
      )}

      {/* Batch Operations Bar */}
      {selectionMode && selectedPhotoIds.length > 0 && (
        <BatchOperationsBar
          selectedPhotos={selectedPhotos}
          onShare={handleBatchShare}
          onExport={handleBatchExport}
          onDelete={handleBatchDelete}
          onCancel={() => {
            setSelectedPhotoIds([]);
            setSelectionMode(false);
          }}
          isProcessing={isProcessingBatch}
        />
      )}

      {/* Status Bar */}
      {!selectionMode && <StatusBar photos={photos} />}
    </div>
  );
};

export default GalleryView;
