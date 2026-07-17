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
 * Uses an aspect-aware, wrapped thumbnail flow. PhotoCard updates its own
 * ratio from the loaded thumbnail, so portrait and landscape assets retain
 * their natural visual proportions without a new layout dependency.
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
          setVisibleCount((current) =>
            Math.min(current + renderBatchSize, photos.length)
          );
        }
      },
      { rootMargin: '600px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [photos.length, visibleCount]);

  const loadMoreMarker =
    visibleCount < photos.length ? (
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
        : 'Undated';

      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)!.push(photo);
    });

    return Array.from(groups.entries()).sort(([a], [b]) => {
      if (a === 'Undated') return 1;
      if (b === 'Undated') return -1;
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
    if (dateString === 'Undated') return 'Undated photos';
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
      <div className="photos-gallery-groups">
        {groupedByDate.map(([date, groupPhotos]) => {
          const visiblePhotos = groupPhotos.filter((photo) =>
            visiblePhotoIds.has(photo.id)
          );
          if (visiblePhotos.length === 0) return null;
          return (
            <section key={date} className="photo-date-group">
              <h3 className="photo-date-heading">{formatGroupDate(date)}</h3>
              <div className="photo-aspect-row">
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
            </section>
          );
        })}
        {loadMoreMarker}
      </div>
    );
  }

  if (groupBy === 'location' && groupedByLocation) {
    return (
      <div className="photos-gallery-groups">
        {groupedByLocation.map(([location, groupPhotos]) => {
          const visiblePhotos = groupPhotos.filter((photo) =>
            visiblePhotoIds.has(photo.id)
          );
          if (visiblePhotos.length === 0) return null;
          return (
            <section key={location} className="photo-date-group">
              <h3 className="photo-date-heading">
                {location === 'No Location'
                  ? 'No Location'
                  : `Location: ${location}`}
              </h3>
              <div className="photo-aspect-row">
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
            </section>
          );
        })}
        {loadMoreMarker}
      </div>
    );
  }

  // No grouping - display all photos in a single grid
  return (
    <div className="photo-aspect-row">
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
