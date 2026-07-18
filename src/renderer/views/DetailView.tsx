import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  RotateCw,
  FastForward,
  Share2,
  ImagePlus,
} from 'lucide-react';
import { usePhotos } from '../hooks/usePhotos';
import { useKeyboard } from '../hooks/useKeyboard';
import { useMotionNavigate } from '../hooks/useMotionNavigate';
import { encodePhotoId, decodePhotoId, encodeFilePath } from '../utils/photoId';
import { sharePhoto, generateThumbnail, setAlbumCover } from '../services/api';
import { isHeicFile } from '../../shared/constants/fileTypes';
import Button from '../components/ui/Button';
import MetadataPanel from '../components/detail/MetadataPanel';
import type { Photo } from '../../shared/types/photo';

/**
 * Photo detail view component
 * Full-screen photo viewer with metadata panel and navigation
 */
const DetailView = () => {
  const navigate = useMotionNavigate();
  const location = useLocation();
  const { photoId } = useParams<{ photoId: string }>();
  const { photos, currentDirectory } = usePhotos();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMetadata, setShowMetadata] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Slide show state
  const [isSlideShow, setIsSlideShow] = useState(false);
  const [slideShowSpeed, setSlideShowSpeed] = useState(3); // seconds per photo
  const [slideShowLoop, setSlideShowLoop] = useState(false);
  const slideShowIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // State for lazy thumbnail generation
  const [thumbnailPath, setThumbnailPath] = useState<string | undefined>(
    undefined
  );
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const generatingRef = useRef(false);
  const [fullImagePath, setFullImagePath] = useState<string | null>(null);
  const [isFullImageReady, setIsFullImageReady] = useState(false);

  const routePhoto = useMemo(() => {
    if (!photoId) return null;
    const decodedPhotoId = decodePhotoId(photoId);
    return photos.find((photo) => photo.id === decodedPhotoId) ?? null;
  }, [photoId, photos]);
  const routePhotoIndex = routePhoto ? photos.indexOf(routePhoto) : -1;

  // Find photo by ID
  useEffect(() => {
    if (photoId && photos.length > 0) {
      if (routePhoto) {
        setSelectedPhoto(routePhoto);
        setCurrentIndex(routePhotoIndex);

        // Reset thumbnail state when photo changes
        setThumbnailPath(routePhoto.thumbnailPath);
        setIsGeneratingThumbnail(false);
        generatingRef.current = false;

        // For HEIC files without thumbnails, try to generate thumbnail lazily
        const isHeic = isHeicFile(routePhoto.filename);
        const isHeicWithoutThumbnail = isHeic && !routePhoto.thumbnailPath;

        if (isHeicWithoutThumbnail) {
          setImageError(true);
          setIsLoading(false);
        } else {
          setIsLoading(true);
          setImageError(false);
        }
      } else {
        navigate('/gallery');
      }
    }
  }, [photoId, photos.length, routePhoto, routePhotoIndex, navigate]);

  // Lazy thumbnail generation for HEIC files in detail view
  useEffect(() => {
    if (!selectedPhoto) return;

    const isHeic = isHeicFile(selectedPhoto.filename);
    const needsThumbnail = isHeic && !thumbnailPath && !generatingRef.current;

    if (needsThumbnail) {
      generatingRef.current = true;
      setIsGeneratingThumbnail(true);

      // Generate thumbnail lazily
      generateThumbnail(selectedPhoto.path)
        .then((path: unknown) => {
          if (path && typeof path === 'string') {
            setThumbnailPath(path);
            setImageError(false);
            setIsLoading(true);
          } else {
            setImageError(true);
            setIsLoading(false);
          }
          setIsGeneratingThumbnail(false);
          generatingRef.current = false;
        })
        .catch((error) => {
          console.error(
            `[DetailView] Error generating thumbnail for ${selectedPhoto.filename}:`,
            error
          );
          setImageError(true);
          setIsLoading(false);
          setIsGeneratingThumbnail(false);
          generatingRef.current = false;
        });
    }
  }, [selectedPhoto, thumbnailPath]);

  // Load the original only after the thumbnail preview can paint. This keeps
  // open/close interactions responsive for high-resolution photos.
  useEffect(() => {
    setFullImagePath(null);
    setIsFullImageReady(false);
    if (!selectedPhoto || isHeicFile(selectedPhoto.filename) || !thumbnailPath)
      return;

    let cancelled = false;
    const preloadTimer = setTimeout(() => {
      const original = new Image();
      original.onload = () => {
        if (!cancelled)
          setFullImagePath(`photomap://${encodeFilePath(selectedPhoto.path)}`);
      };
      original.src = `photomap://${encodeFilePath(selectedPhoto.path)}`;
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(preloadTimer);
    };
  }, [selectedPhoto, thumbnailPath]);

  // Update thumbnail path when photo prop changes
  useEffect(() => {
    if (
      selectedPhoto?.thumbnailPath &&
      selectedPhoto.thumbnailPath !== thumbnailPath
    ) {
      setThumbnailPath(selectedPhoto.thumbnailPath);
    }
  }, [selectedPhoto?.thumbnailPath, thumbnailPath]);

  // Navigate to previous photo
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setSelectedPhoto(photos[newIndex]);
      navigate(`/detail/${encodePhotoId(photos[newIndex].id)}`);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setIsLoading(true);
      setImageError(false);
    }
  };

  // Navigate to next photo
  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setSelectedPhoto(photos[newIndex]);
      navigate(`/detail/${encodePhotoId(photos[newIndex].id)}`);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setIsLoading(true);
      setImageError(false);
    } else if (slideShowLoop && photos.length > 0) {
      // Loop to first photo
      const newIndex = 0;
      setCurrentIndex(newIndex);
      setSelectedPhoto(photos[newIndex]);
      navigate(`/detail/${encodePhotoId(photos[newIndex].id)}`);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setIsLoading(true);
      setImageError(false);
    } else if (isSlideShow) {
      // End slide show if at last photo and not looping
      handleSlideShowToggle();
    }
  };

  // Close detail view
  const handleClose = () => {
    if (location.state?.returnTo === '/map') {
      const clusterPhotoIds = location.state?.clusterPhotoIds;
      navigate('/map', {
        replace: true,
        state: Array.isArray(clusterPhotoIds)
          ? { reopenClusterPhotoIds: clusterPhotoIds }
          : undefined,
      });
      return;
    }

    const returnTo = location.state?.returnTo;
    if (
      returnTo &&
      typeof returnTo === 'object' &&
      typeof returnTo.pathname === 'string'
    ) {
      navigate(returnTo.pathname, {
        replace: true,
        state: { restoreScrollTop: returnTo.scrollTop ?? 0 },
      });
      return;
    }

    navigate('/gallery');
  };

  // Zoom in
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  // Zoom out
  const handleZoomOut = () => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.25, 1);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  // Reset zoom
  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          handleZoomIn();
        } else {
          handleZoomOut();
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

  // Drag to pan when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  /**
   * Share photo handler
   */
  const handleShare = async () => {
    if (selectedPhoto) {
      try {
        const result = await sharePhoto(selectedPhoto.path);
        if (!result.success && result.error) {
          console.error('Error sharing photo:', result.error);
          // TODO: Show a user-friendly error notification
        }
      } catch (error) {
        console.error('Error sharing photo:', error);
      }
    }
  };

  /**
   * Handles setting the current photo as album cover
   */
  const handleSetAsAlbumCover = async () => {
    if (!selectedPhoto || !currentDirectory) return;

    try {
      const result = await setAlbumCover(currentDirectory, selectedPhoto.path);
      if (result.success) {
        // Navigate back to albums to see the updated cover
        navigate('/albums');
      } else {
        console.error('Error setting album cover:', result.error);
      }
    } catch (error) {
      console.error('Error setting album cover:', error);
    }
  };

  /**
   * Slide show controls
   */
  const handleSlideShowToggle = () => {
    if (isSlideShow) {
      // Stop slide show
      if (slideShowIntervalRef.current) {
        clearInterval(slideShowIntervalRef.current);
        slideShowIntervalRef.current = null;
      }
      setIsSlideShow(false);
    } else {
      // Start slide show
      setIsSlideShow(true);
      // Reset zoom when starting slide show
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  /**
   * Slide show interval effect
   */
  useEffect(() => {
    if (isSlideShow && photos.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex < photos.length - 1) {
            const newIndex = prevIndex + 1;
            setSelectedPhoto(photos[newIndex]);
            navigate(`/detail/${encodePhotoId(photos[newIndex].id)}`);
            setZoom(1);
            setPosition({ x: 0, y: 0 });
            setIsLoading(true);
            setImageError(false);
            return newIndex;
          } else if (slideShowLoop && photos.length > 0) {
            // Loop to first photo
            const newIndex = 0;
            setSelectedPhoto(photos[newIndex]);
            navigate(`/detail/${encodePhotoId(photos[newIndex].id)}`);
            setZoom(1);
            setPosition({ x: 0, y: 0 });
            setIsLoading(true);
            setImageError(false);
            return newIndex;
          } else {
            // End slide show if at last photo and not looping
            setIsSlideShow(false);
            return prevIndex;
          }
        });
      }, slideShowSpeed * 1000);

      slideShowIntervalRef.current = interval;

      return () => {
        clearInterval(interval);
        slideShowIntervalRef.current = null;
      };
    } else {
      if (slideShowIntervalRef.current) {
        clearInterval(slideShowIntervalRef.current);
        slideShowIntervalRef.current = null;
      }
    }
  }, [isSlideShow, slideShowSpeed, photos, slideShowLoop, navigate]);

  /**
   * Stop slide show when component unmounts or user navigates away
   */
  useEffect(() => {
    return () => {
      if (slideShowIntervalRef.current) {
        clearInterval(slideShowIntervalRef.current);
      }
    };
  }, []);

  // Keyboard navigation
  useKeyboard(
    {
      onArrowLeft: handlePrevious,
      onArrowRight: handleNext,
      onEscape: () => {
        if (isSlideShow) {
          handleSlideShowToggle();
        } else {
          handleClose();
        }
      },
      onSpace: () => {
        if (isSlideShow || zoom === 1) {
          // Toggle slide show when not zoomed, or toggle metadata when zoomed
          if (zoom === 1) {
            handleSlideShowToggle();
          } else {
            setShowMetadata((prev) => !prev);
          }
        } else {
          setShowMetadata((prev) => !prev);
        }
      },
    },
    true
  );

  // Pinch-to-zoom state
  const [pinchStart, setPinchStart] = useState<{
    distance: number;
    centerX: number;
    centerY: number;
    initialZoom: number;
  } | null>(null);

  // Swipe gestures for navigation
  const [swipeStart, setSwipeStart] = useState<{ x: number; y: number } | null>(
    null
  );

  /**
   * Calculate distance between two touch points
   */
  const getTouchDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  /**
   * Calculate center point between two touch points
   */
  const getTouchCenter = (touches: TouchList): { x: number; y: number } => {
    if (touches.length < 2) return { x: 0, y: 0 };
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch gesture - start zooming
      const distance = getTouchDistance(e.touches as unknown as TouchList);
      const center = getTouchCenter(e.touches as unknown as TouchList);
      setPinchStart({
        distance,
        centerX: center.x,
        centerY: center.y,
        initialZoom: zoom,
      });
      setSwipeStart(null); // Cancel swipe gesture
    } else if (e.touches.length === 1) {
      // Single touch - navigation swipe
      setSwipeStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setPinchStart(null); // Cancel pinch gesture
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStart) {
      // Pinch-to-zoom in progress
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches as unknown as TouchList);
      const center = getTouchCenter(e.touches as unknown as TouchList);
      const scale = currentDistance / pinchStart.distance;
      const newZoom = Math.max(1, Math.min(3, pinchStart.initialZoom * scale));

      // Update position to zoom towards touch center
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const relativeX = center.x - rect.left - rect.width / 2;
        const relativeY = center.y - rect.top - rect.height / 2;

        setZoom(newZoom);
        setPosition({
          x: relativeX * (1 - newZoom / pinchStart.initialZoom),
          y: relativeY * (1 - newZoom / pinchStart.initialZoom),
        });
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (pinchStart && e.touches.length < 2) {
      // Pinch gesture ended
      setPinchStart(null);
      if (zoom <= 1) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (swipeStart && e.changedTouches.length === 1) {
      // Swipe gesture ended
      const deltaX = e.changedTouches[0].clientX - swipeStart.x;
      const deltaY = e.changedTouches[0].clientY - swipeStart.y;

      // Horizontal swipe (more significant than vertical) and not zoomed
      if (
        zoom === 1 &&
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > 50
      ) {
        if (deltaX > 0) {
          handlePrevious();
        } else {
          handleNext();
        }
      }

      setSwipeStart(null);
    }
  };

  if (!selectedPhoto) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-[var(--text-tertiary)]">Photo not found</p>
          <Button onClick={handleClose} variant="secondary">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="detail-viewer fixed inset-0 z-50 flex"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <header className="detail-toolbar" data-scrolled="false">
        <div className="window-drag-region flex min-w-0 flex-1 items-center gap-4">
          <button
            onClick={handleClose}
            className="window-no-drag photos-icon-button photos-back-button shrink-0"
            aria-label="Back to gallery"
            title="Back to gallery"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-[17px] font-semibold leading-5">
              {selectedPhoto.filename}
            </h1>
            <p className="truncate text-xs leading-4 detail-toolbar-subtitle">
              {currentIndex + 1} of {photos.length} photos
            </p>
          </div>
        </div>

        <div className="detail-top-actions window-no-drag">
          {currentDirectory && (
            <button
              onClick={handleSetAsAlbumCover}
              className="detail-icon-button"
              aria-label="Set as album cover"
              title="Set as album cover"
            >
              <ImagePlus className="w-5 h-5" />
            </button>
          )}
          {currentDirectory && <span className="photos-group-divider" aria-hidden="true" />}
          <button
            onClick={handleShare}
            className="detail-icon-button"
            aria-label="Share photo"
            title="Share photo"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Photo viewer */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation buttons */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="detail-nav-button absolute left-4 z-10"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6 text-[var(--text-primary)]" />
          </button>
        )}

        {currentIndex < photos.length - 1 && (
          <button
            onClick={handleNext}
            className="detail-nav-button absolute right-4 z-10"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6 text-[var(--text-primary)]" />
          </button>
        )}

        {/* One shared glass control keeps zoom and slideshow actions from overlapping. */}
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg-2)] p-2 shadow-l3 backdrop-blur-2xl">
          {!isSlideShow && (
            <>
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                className="p-2 rounded-xl hover:bg-[var(--glass-bg-1)] transition-smooth disabled:opacity-50"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-5 h-5 text-[var(--text-primary)]" />
              </button>
              <span className="min-w-[50px] text-center text-sm text-[var(--text-primary)]">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="p-2 rounded-xl hover:bg-[var(--glass-bg-1)] transition-smooth disabled:opacity-50"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-5 h-5 text-[var(--text-primary)]" />
              </button>
              {zoom > 1 && (
                <button
                  onClick={handleResetZoom}
                  className="px-2 py-1 text-xs text-[var(--text-primary)] hover:bg-[var(--glass-bg-1)] rounded-lg transition-smooth"
                >
                  Reset
                </button>
              )}
              <span
                className="mx-1 h-5 w-px bg-[var(--border-default)]"
                aria-hidden="true"
              />
            </>
          )}
          <button
            onClick={handleSlideShowToggle}
            className="p-2 rounded-xl hover:bg-[var(--glass-bg-1)] transition-smooth"
            aria-label={isSlideShow ? 'Pause slide show' : 'Play slide show'}
          >
            {isSlideShow ? (
              <Pause className="w-5 h-5 text-[var(--text-primary)]" />
            ) : (
              <Play className="w-5 h-5 text-[var(--text-primary)]" />
            )}
          </button>

          {isSlideShow ? (
            <>
              {/* Speed control */}
              <div className="flex items-center gap-2">
                <FastForward className="w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={slideShowSpeed}
                  onChange={(e) => setSlideShowSpeed(Number(e.target.value))}
                  className="w-20 h-1 bg-[var(--glass-bg-1)] rounded-sm appearance-none cursor-pointer accent-primary"
                  aria-label="Slide show speed"
                />
                <span className="text-xs text-[var(--text-tertiary)] min-w-[30px]">
                  {slideShowSpeed}s
                </span>
              </div>

              {/* Loop toggle */}
              <button
                onClick={() => setSlideShowLoop((prev) => !prev)}
                className={`p-2 rounded transition-smooth ${
                  slideShowLoop
                    ? 'bg-primary/20 hover:bg-primary/30'
                    : 'hover:bg-[var(--glass-bg-1)]'
                }`}
                aria-label={slideShowLoop ? 'Disable loop' : 'Enable loop'}
                title={slideShowLoop ? 'Loop enabled' : 'Loop disabled'}
              >
                <RotateCw
                  className={`w-4 h-4 ${
                    slideShowLoop
                      ? 'text-primary'
                      : 'text-[var(--text-tertiary)]'
                  }`}
                />
              </button>
            </>
          ) : null}
          <span className="px-2 text-xs text-[var(--text-tertiary)]">
            {currentIndex + 1} / {photos.length}
          </span>
        </div>

        {/* Photo image */}
        <div className="relative w-full h-full flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {imageError ||
          (selectedPhoto &&
            isHeicFile(selectedPhoto.filename) &&
            !thumbnailPath &&
            !isGeneratingThumbnail) ? (
            <div className="text-center space-y-4 p-8">
              <p className="text-lg text-[var(--text-tertiary)]">
                {isGeneratingThumbnail
                  ? 'Generating thumbnail...'
                  : selectedPhoto && isHeicFile(selectedPhoto.filename)
                    ? 'HEIC files cannot be displayed directly in Chromium. Please open with system app.'
                    : 'Failed to load photo'}
              </p>
              {isGeneratingThumbnail && (
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <div className="flex items-center justify-center gap-3">
                {selectedPhoto &&
                  isHeicFile(selectedPhoto.filename) &&
                  !isGeneratingThumbnail && (
                    <Button
                      onClick={async () => {
                        if (selectedPhoto) {
                          console.log(
                            `[DetailView] Opening HEIC file with system app: ${selectedPhoto.path}`
                          );
                          await sharePhoto(selectedPhoto.path); // Opens with system default app
                        }
                      }}
                      variant="primary"
                    >
                      Open with System App
                    </Button>
                  )}
                {selectedPhoto &&
                  !isHeicFile(selectedPhoto.filename) &&
                  !isGeneratingThumbnail && (
                    <Button
                      onClick={() => {
                        setImageError(false);
                        setIsLoading(true);
                      }}
                      variant="secondary"
                    >
                      Retry
                    </Button>
                  )}
              </div>
            </div>
          ) : (
            selectedPhoto && (
              <img
                ref={imageRef}
                src={
                  // Paint the cached gallery thumbnail first. The original is
                  // overlaid only after it has been preloaded in the background.
                  thumbnailPath
                    ? `photomap://${encodeFilePath(thumbnailPath)}`
                    : `photomap://${encodeFilePath(selectedPhoto.path)}`
                }
                alt={selectedPhoto.filename}
                className={`max-w-full max-h-full object-contain transition-smooth ${
                  zoom > 1 ? 'cursor-move' : 'cursor-default'
                } ${isLoading ? 'opacity-0' : 'opacity-100 animate-fade-in'}`}
                style={{
                  transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                }}
                onLoad={() => {
                  setIsLoading(false);
                  setImageError(false);
                  setIsGeneratingThumbnail(false);
                }}
                onError={(e) => {
                  const isHeic = isHeicFile(selectedPhoto.filename);
                  const src = thumbnailPath
                    ? `photomap://${encodeFilePath(thumbnailPath)}`
                    : `photomap://${encodeFilePath(selectedPhoto.path)}`;

                  // For HEIC files without thumbnails, show error
                  // For HEIC files with thumbnails, this shouldn't happen (thumbnails are JPEGs)
                  if (isHeic && !thumbnailPath) {
                    console.warn(
                      `[DetailView] HEIC file without thumbnail: ${selectedPhoto.filename}`,
                      {
                        src,
                        photoPath: selectedPhoto.path,
                        isGenerating: isGeneratingThumbnail,
                        note: isGeneratingThumbnail
                          ? 'Thumbnail generation in progress...'
                          : 'HEIC file needs thumbnail generation',
                      }
                    );
                  } else {
                    console.error(
                      `[DetailView] Image load error for: ${selectedPhoto.filename}`,
                      {
                        error: e,
                        src,
                        photoPath: selectedPhoto.path,
                        hasThumbnail: !!thumbnailPath,
                        isHeic,
                      }
                    );
                  }
                  setIsLoading(false);
                  setImageError(true);
                }}
                draggable={false}
              />
            )
          )}
          {selectedPhoto && fullImagePath && (
            <img
              src={fullImagePath}
              alt={selectedPhoto.filename}
              className={`absolute max-w-full max-h-full object-contain transition-opacity duration-200 ${
                zoom > 1 ? 'cursor-move' : 'cursor-default'
              } ${isFullImageReady ? 'opacity-100' : 'opacity-0'}`}
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              }}
              onLoad={() => setIsFullImageReady(true)}
              onError={() => setFullImagePath(null)}
              draggable={false}
            />
          )}
        </div>
      </div>

      {/* Metadata panel */}
      {showMetadata && (
        <MetadataPanel
          photo={selectedPhoto}
          onClose={() => setShowMetadata(false)}
          onLocationClick={() => {
            navigate('/map');
          }}
        />
      )}

      {/* Toggle metadata button */}
      {!showMetadata && (
        <button
          onClick={() => setShowMetadata(true)}
          className="absolute bottom-4 right-4 z-10 glass-surface-2 rounded-full p-3 hover:bg-[var(--glass-bg-1)] transition-smooth shadow-l2"
          aria-label="Show metadata"
        >
          <Calendar className="w-6 h-6 text-[var(--text-primary)]" />
        </button>
      )}
    </div>
  );
};

export default DetailView;
