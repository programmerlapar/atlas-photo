import { useEffect, useMemo, useRef, useState } from 'react';
import PhotoCard from './PhotoCard';
import type { Photo } from '../../../shared/types/photo';

export interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
  onPhotoHover?: (photo: Photo | null) => void;
  selectedPhotoIds?: string[];
  selectionMode?: boolean;
  onToggleSelect?: (photo: Photo) => void;
  groupBy?: 'date' | 'location' | 'none';
}

/**
 * Photo grid component with responsive layout and grouping
 * Follows iOS Photos-style design with adaptive columns
 */
const PhotoGrid = ({
  photos,
  onPhotoClick,
  onPhotoHover,
  selectedPhotoIds = [],
  selectionMode = false,
  onToggleSelect,
  groupBy = 'date',
}: PhotoGridProps) => {
  const initialRenderCount = 50;
  const renderBatchSize = 60;
  const photoCollectionKey = `${photos.length}:${photos[0]?.id ?? ''}:${photos[photos.length - 1]?.id ?? ''}`;
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(initialRenderCount, photos.length)
  );

  // Keep the DOM bounded. More cards mount only when the user approaches the
  // end of the rendered grid, rather than mounting a whole large album idle.
  useEffect(() => {
    setVisibleCount(Math.min(initialRenderCount, photos.length));
  }, [photoCollectionKey, photos.length]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || visibleCount >= photos.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((current) => Math.min(current + renderBatchSize, photos.length));
        }
      },
      { rootMargin: '600px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [photos.length, visibleCount]);

  const loadMoreMarker = visibleCount < photos.length ? (
    <div ref={loadMoreRef} className="h-px" aria-hidden="true" />
  ) : null;

  const visiblePhotoIds = useMemo(
    () => new Set(photos.slice(0, visibleCount).map((photo) => photo.id)),
    [photos, visibleCount]
  );
  /**
   * Groups photos by date
   */
  const groupedByDate = useMemo(() => {
    if (groupBy !== 'date') return null;

    const groups = new Map<string, Photo[]>();

    photos.forEach((photo) => {
      const date = photo.metadata?.date
        ? new Date(photo.metadata.date).toDateString()
        : 'Unknown Date';

      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)!.push(photo);
    });

    return Array.from(groups.entries()).sort(([a], [b]) => {
      if (a === 'Unknown Date') return 1;
      if (b === 'Unknown Date') return -1;
      return new Date(b).getTime() - new Date(a).getTime();
    });
    // Thumbnail-path changes do not affect date grouping, so rebuilding every
    // thumbnail batch would negate progressive rendering.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoCollectionKey, groupBy]);

  /**
   * Groups photos by location
   */
  const groupedByLocation = useMemo(() => {
    if (groupBy !== 'location') return null;

    const groups = new Map<string, Photo[]>();

    photos.forEach((photo) => {
      const location = photo.metadata?.location
        ? `${photo.metadata.location.latitude.toFixed(4)}, ${photo.metadata.location.longitude.toFixed(4)}`
        : 'No Location';

      if (!groups.has(location)) {
        groups.set(location, []);
      }
      groups.get(location)!.push(photo);
    });

    return Array.from(groups.entries());
    // Thumbnail-path changes do not affect location grouping.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoCollectionKey, groupBy]);

  /**
   * Formats date for group header
   */
  const formatGroupDate = (dateString: string) => {
    if (dateString === 'Unknown Date') return dateString;
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  if (groupBy === 'date' && groupedByDate) {
    return (
      <div className="space-y-8">
        {groupedByDate.map(([date, groupPhotos]) => {
          const visiblePhotos = groupPhotos.filter((photo) => visiblePhotoIds.has(photo.id));
          if (visiblePhotos.length === 0) return null;
          return (
            <div key={date} className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] px-2">
                {formatGroupDate(date)}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {visiblePhotos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onClick={onPhotoClick}
                    onHover={onPhotoHover}
                    isSelected={selectedPhotoIds.includes(photo.id)}
                    selectionMode={selectionMode}
                    onToggleSelect={onToggleSelect}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {loadMoreMarker}
      </div>
    );
  }

  if (groupBy === 'location' && groupedByLocation) {
    return (
      <div className="space-y-8">
        {groupedByLocation.map(([location, groupPhotos]) => {
          const visiblePhotos = groupPhotos.filter((photo) => visiblePhotoIds.has(photo.id));
          if (visiblePhotos.length === 0) return null;
          return (
            <div key={location} className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] px-2">
                {location === 'No Location'
                  ? 'No Location'
                  : `Location: ${location}`}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {visiblePhotos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onClick={onPhotoClick}
                    onHover={onPhotoHover}
                    isSelected={selectedPhotoIds.includes(photo.id)}
                    selectionMode={selectionMode}
                    onToggleSelect={onToggleSelect}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {loadMoreMarker}
      </div>
    );
  }

  // No grouping - display all photos in a single grid
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {photos.slice(0, visibleCount).map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          onClick={onPhotoClick}
          onHover={onPhotoHover}
          isSelected={selectedPhotoIds.includes(photo.id)}
        />
      ))}
      {loadMoreMarker}
    </div>
  );
};

export default PhotoGrid;
