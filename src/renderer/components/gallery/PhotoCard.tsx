import { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Check } from 'lucide-react';
import { encodeFilePath } from '../../utils/photoId';
import { isHeicFile } from '../../../shared/constants/fileTypes';
import { generateThumbnail } from '../../services/api';
import Card from '../ui/Card';
import type { Photo } from '../../../shared/types/photo';

export interface PhotoCardProps {
  photo: Photo;
  onClick?: (photo: Photo) => void;
  onHover?: (photo: Photo | null) => void;
  isSelected?: boolean;
  selectionMode?: boolean;
  onToggleSelect?: (photo: Photo) => void;
}

/**
 * Photo card component displaying a photo thumbnail with metadata preview
 * Follows iOS Photos-style design with glass surface effects
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
  
  // State for lazy thumbnail generation
  const [thumbnailPath, setThumbnailPath] = useState<string | undefined>(photo.thumbnailPath);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const generatingRef = useRef(false);
  
  // For HEIC files without thumbnails, start with error state
  // For HEIC files with thumbnails, try to load normally (they're JPEGs)
  const [imageError, setImageError] = useState(isHeicWithoutThumbnail && !thumbnailPath);
  const [imageLoading, setImageLoading] = useState(!isHeicWithoutThumbnail && !!thumbnailPath);

  // Lazy thumbnail generation - generate when component mounts if no thumbnail
  useEffect(() => {
    if (!thumbnailPath && !generatingRef.current) {
      generatingRef.current = true;
      setIsGeneratingThumbnail(true);
      
      // Generate thumbnail lazily
      generateThumbnail(photo.path)
        .then((path) => {
          if (path) {
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
          console.error(`[PhotoCard] Error generating thumbnail for ${photo.filename}:`, error);
          setImageError(true);
          setIsGeneratingThumbnail(false);
          generatingRef.current = false;
        });
    }
  }, [photo.path, thumbnailPath]);

  // Listen for thumbnail-generated events from main process
  useEffect(() => {
    if (!window.electronAPI) return;

    const handleThumbnailGenerated = (data: { path: string; thumbnailPath: string }) => {
      if (data.path === photo.path) {
        setThumbnailPath(data.thumbnailPath);
        setIsGeneratingThumbnail(false);
        setImageLoading(true);
        setImageError(false);
      }
    };

    window.electronAPI.onThumbnailGenerated(handleThumbnailGenerated);

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('thumbnail-generated');
      }
    };
  }, [photo.path]);

  // Update thumbnail path when photo prop changes
  useEffect(() => {
    if (photo.thumbnailPath && photo.thumbnailPath !== thumbnailPath) {
      setThumbnailPath(photo.thumbnailPath);
    }
  }, [photo.thumbnailPath]);

  // Log HEIC file detection
  useEffect(() => {
    if (isHeic) {
      console.log(`[PhotoCard] HEIC file detected: ${photo.filename}`, {
        hasThumbnail: !!thumbnailPath,
        photoPath: photo.path,
        willShowPlaceholder: isHeicWithoutThumbnail && !thumbnailPath,
      });
    }
  }, [photo, isHeic, isHeicWithoutThumbnail, thumbnailPath]);

  const handleClick = (e: React.MouseEvent) => {
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

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card
      variant="custom-glass"
      padding="p-0"
      shadow="l1"
      rounded="md"
      className={`
        overflow-hidden cursor-pointer
        hover-lift
        ${isSelected ? 'ring-2 ring-[#1EC8E6] ring-offset-2 ring-offset-[var(--bg-primary)]' : ''}
        ${imageLoading ? 'animate-pulse' : 'animate-fade-in'}
      `}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
      style={{
        animationDelay: `${Math.random() * 0.1}s`, // Stagger animation
      }}
    >
      {/* Thumbnail Image */}
      <div className="aspect-square relative bg-neutral-800">
        {!imageError && (thumbnailPath || (!isHeic && photo.path)) ? (
          <>
            <img
              src={
                thumbnailPath
                  ? `photomap://${encodeFilePath(thumbnailPath)}`
                  : `photomap://${encodeFilePath(photo.path)}`
              }
              alt={photo.filename}
              className="w-full h-full object-cover"
              onLoad={() => {
                console.log(`[PhotoCard] Image loaded successfully: ${photo.filename}`, {
                  usingThumbnail: !!thumbnailPath,
                  src: thumbnailPath
                    ? `photomap://${encodeFilePath(thumbnailPath)}`
                    : `photomap://${encodeFilePath(photo.path)}`,
                });
                setImageLoading(false);
                setIsGeneratingThumbnail(false);
              }}
              onError={(e) => {
                const src = thumbnailPath
                  ? `photomap://${encodeFilePath(thumbnailPath)}`
                  : `photomap://${encodeFilePath(photo.path)}`;
                
                // For HEIC files without thumbnails, show error
                // For HEIC files with thumbnails, this shouldn't happen (thumbnails are JPEGs)
                if (isHeic && !thumbnailPath) {
                  console.warn(`[PhotoCard] HEIC file without thumbnail: ${photo.filename}`, {
                    src,
                    photoPath: photo.path,
                    note: 'HEIC file needs thumbnail generation',
                  });
                } else {
                  console.error(`[PhotoCard] Image load error for: ${photo.filename}`, {
                    error: e,
                    src,
                    hasThumbnail: !!thumbnailPath,
                    isHeic,
                    photoPath: photo.path,
                  });
                }
                setImageError(true);
                setImageLoading(false);
              }}
            />
            {(imageLoading || isGeneratingThumbnail) && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-800">
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  {isGeneratingThumbnail && (
                    <p className="text-xs text-neutral-400">Generating thumbnail...</p>
                  )}
                </div>
                <div className="absolute inset-0 bg-white/5 animate-pulse" />
              </div>
            )}
          </>
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
            className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-smooth animate-scale-in ${
              isSelected
                ? 'bg-primary border-primary shadow-lg'
                : 'bg-black/50 border-white/70 hover:bg-black/70'
            }`}
          >
            {isSelected && (
              <Check className="w-4 h-4 text-[var(--text-primary)] animate-scale-in" />
            )}
          </div>
        )}

        {/* Location indicator */}
        {photo.metadata?.location && !selectionMode && (
          <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm rounded-full p-1.5">
            <MapPin className="w-3 h-3 text-[var(--text-primary)]" />
          </div>
        )}

        {/* Date badge */}
        {photo.metadata?.date && (
          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded-xs px-2 py-1">
            <p className="text-xs text-[var(--text-primary)] font-medium">
              {formatDate(photo.metadata.date)}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PhotoCard;
