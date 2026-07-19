import { memo, useState, useEffect, useRef, type CSSProperties } from 'react';
import { MapPin, Calendar, Check } from 'lucide-react';
import { encodeFilePath } from '../../utils/photoId';
import { isHeicFile } from '../../../shared/constants/fileTypes';
import { generateThumbnail } from '../../services/api';
import type { Photo } from '../../../shared/types/photo';
import { cacheThumbnail, getCachedThumbnail } from '../../cache/thumbCache';

// The grid only ever shows the small cached thumbnail. The full-resolution
// original is loaded lazily and exclusively in DetailView, so the grid keeps a
// bounded DOM and never decodes multi-megabyte sources while scrolling.

export interface PhotoCardProps {
  photo: Photo;
  onClick?: (photo: Photo) => void;
  onHover?: (photo: Photo | null) => void;
  isSelected?: boolean;
  selectionMode?: boolean;
  onToggleSelect?: (photo: Photo) => void;
}

/**
 * Aspect-aware thumbnail item. The initial ratio is a safe placeholder and
 * is replaced by the loaded thumbnail's intrinsic dimensions.
 */
const PhotoCard = ({
  photo,
  onClick,
  onHover,
  isSelected = false,
  selectionMode = false,
  onToggleSelect,
}: PhotoCardProps) => {
  // Check if this is a HEIC file
  // HEIC files are converted to JPEG thumbnails, so they should load normally
  const isHeic = isHeicFile(photo.filename);
  const isHeicWithoutThumbnail = isHeic && !photo.thumbnailPath;

  const [thumbnailPath, setThumbnailPath] = useState<string | undefined>(
    getCachedThumbnail(photo.path) ?? photo.thumbnailPath
  );
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const [isThumbnailVisible, setIsThumbnailVisible] = useState(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const generatingRef = useRef(false);

  // For HEIC files without thumbnails, start with error state
  // For HEIC files with thumbnails, try to load normally (they're JPEGs)
  const [imageError, setImageError] = useState(
    isHeicWithoutThumbnail && !thumbnailPath
  );
  const [imageLoading, setImageLoading] = useState(
    !isHeicWithoutThumbnail && !!thumbnailPath
  );
  const [aspectRatio, setAspectRatio] = useState(4 / 3);

  // Stabilize IntersectionObserver dependencies
  useEffect(() => {
    const element = thumbnailContainerRef.current;
    if (!element || thumbnailPath || isThumbnailVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsThumbnailVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [thumbnailPath]);

  // Lazy thumbnail generation - only after the card becomes visible.
  useEffect(() => {
    if (isThumbnailVisible && !thumbnailPath && !generatingRef.current) {
      generatingRef.current = true;
      setIsGeneratingThumbnail(true);

      // Check if thumbnail is already cached
      const cachedThumbnail = getCachedThumbnail(photo.path);
      if (cachedThumbnail) {
        cacheThumbnail(photo.path, cachedThumbnail);
        setThumbnailPath(cachedThumbnail);
        setImageLoading(true);
        setImageError(false);
        generatingRef.current = false;
        return;
      }

      // Generate thumbnail lazily
      generateThumbnail(photo.path)
        .then((path) => {
          if (typeof path === 'string') {
            cacheThumbnail(photo.path, path);
            setThumbnailPath(path);
            setImageLoading(true);
            setImageError(false);
          } else {
            setImageError(true);
            setIsGeneratingThumbnail(false);
          }
          generatingRef.current = false;
        })
        .catch((error) => {
          console.error(
            `[PhotoCard] Error generating thumbnail for ${photo.filename}:`,
            error
          );
          setImageError(true);
          setIsGeneratingThumbnail(false);
          generatingRef.current = false;
        });
    }
  }, [isThumbnailVisible, photo.path, thumbnailPath]);

  // Update thumbnail path when photo prop changes
  useEffect(() => {
    if (photo.thumbnailPath && photo.thumbnailPath !== thumbnailPath) {
      cacheThumbnail(photo.path, photo.thumbnailPath);
      setThumbnailPath(photo.thumbnailPath);
      setIsGeneratingThumbnail(false);
      setImageLoading(true);
      setImageError(false);
    }
  }, [photo.path, photo.thumbnailPath, thumbnailPath]);

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (selectionMode) {
      e.stopPropagation();
      onToggleSelect?.(photo);
    } else {
      onClick?.(photo);
    }
  };

  const handleMouseEnter = () => {
    onHover?.(photo);
  };

  const handleMouseLeave = () => {
    onHover?.(null);
  };

  return (
    <div
      ref={thumbnailContainerRef}
      className={`
        photo-tile
        ${isSelected ? 'photo-tile-selected' : ''}
      `}
      style={{ '--photo-aspect-ratio': aspectRatio } as CSSProperties}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e);
        }
      }}
    >
      <div className="photo-tile-media">
        {!imageError && thumbnailPath ? (
          <img
            src={`photomap://${encodeFilePath(thumbnailPath)}`}
            alt={photo.filename}
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            loading="lazy"
            decoding="async"
            onLoad={(event) => {
              const ratio =
                (event.currentTarget.naturalWidth || 4) /
                (event.currentTarget.naturalHeight || 3);
              setAspectRatio(Math.min(2.4, Math.max(0.55, ratio)));
              setImageLoading(false);
              setIsGeneratingThumbnail(false);
            }}
            onError={(e) => {
              const src = `photomap://${encodeFilePath(thumbnailPath)}`;
              if (isHeic && !thumbnailPath) {
                console.warn(
                  `[PhotoCard] HEIC file without thumbnail: ${photo.filename}`,
                  {
                    src,
                    photoPath: photo.path,
                    note: 'HEIC file needs thumbnail generation',
                  }
                );
              } else {
                console.error(
                  `[PhotoCard] Image load error for: ${photo.filename}`,
                  {
                    error: e,
                    src,
                    hasThumbnail: !!thumbnailPath,
                    isHeic,
                    photoPath: photo.path,
                  }
                );
              }
              setImageError(true);
              setImageLoading(false);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-800">
            <div className="text-center space-y-2 p-4">
              <Calendar className="w-8 h-8 mx-auto text-neutral-500" />
              <p className="text-xs text-neutral-400 truncate">
                {photo.filename}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {isGeneratingThumbnail
                  ? 'Generating thumbnail...'
                  : isHeic
                    ? 'HEIC file (click to open)'
                    : !thumbnailPath
                      ? 'Thumbnail unavailable'
                      : 'Image unavailable'}
              </p>
            </div>
          </div>
        )}

        {/* Selection indicator */}
        {selectionMode && (
          <div
            className={`absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border transition-smooth ${
              isSelected
                ? 'bg-primary border-primary'
                : 'border-white/70 bg-black/45 hover:bg-black/70'
            }`}
          >
            {isSelected && <Check className="h-3 w-3 text-white" />}
          </div>
        )}

        {/* Location indicator */}
        {photo.metadata?.location && !selectionMode && (
          <div className="absolute right-2 top-2 rounded-full bg-black/45 p-1 backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(PhotoCard);
