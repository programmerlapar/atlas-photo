import { memo, useEffect, useMemo, useRef, useState } from 'react';
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
  initialVisibleCount?: number;
  onVisibleCountChange?: (count: number) => void;
}

/**
 * Photo grid component with a responsive, aspect-aware wrapped thumbnail flow.
 *
 * Virtualization strategy: the wrapped masonry flow makes fixed-row windowing
 * impossible, so instead of mounting the entire album we keep the DOM bounded
 * by rendering only `visibleCount` items and growing that count as the user
 * approaches a real sentinel at the end of the rendered grid. Thumbnails are
 * loaded lazily by PhotoCard itself, so off-screen work stays minimal.
 */
const PhotoGrid = ({
  photos,
  onPhotoClick,
  onPhotoHover,
  selectedPhotoIds = [],
  selectionMode = false,
  onToggleSelect,
  groupBy = 'date',
  initialVisibleCount,
  onVisibleCountChange,
}: PhotoGridProps) => {
  const initialRenderCount = 50;
  const renderBatchSize = 60;
  const photoCollectionKey = `${photos.length}:${photos[0]?.id ?? ''}:${photos[photos.length - 1]?.id ?? ''}`;
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const onVisibleCountChangeRef = useRef(onVisibleCountChange);
  onVisibleCountChangeRef.current = onVisibleCountChange;
  const [visibleCount, setVisibleCount] = useState(() =>
    initialVisibleCount && initialVisibleCount > 0
      ? initialVisibleCount
      : initialRenderCount
  );
  const isMountedRef = useRef(false);

  // Keep the DOM bounded. More cards mount only when the user approaches the
  // end of the rendered grid, rather than mounting a whole large album idle.
  //
  // The dependency on photoCollectionKey means this fires whenever the photo
  // list is replaced (different album, library reload, etc.). We intentionally
  // skip the initial mount (isMountedRef) so that the useState initializer
  // (which uses initialVisibleCount from the cache) is honoured.
  //
  // When photos arrive after a setPhotos([]) clear, photos.length transitions
  // from 0 → N and photoCollectionKey changes again. If initialVisibleCount
  // was provided we treat this as a "return to cached view" and restore it
  // instead of falling back to the default 60.
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    // Still in the empty transition (setPhotos([]) happened, load pending)
    if (photos.length === 0) return;

    if (initialVisibleCount && initialVisibleCount > 0) {
      setVisibleCount(Math.min(initialVisibleCount, photos.length));
      return;
    }

    setVisibleCount(Math.min(initialRenderCount, photos.length));
  }, [photoCollectionKey, photos.length]);

  useEffect(() => {
    onVisibleCountChangeRef.current?.(visibleCount);
  }, [visibleCount]);

  // Drive progressive reveal from a real sentinel at the end of the rendered
  // grid. Mounting more cards only when the sentinel nears the viewport keeps
  // the live DOM small even for very large albums.
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
      { rootMargin: '1200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [photos.length, visibleCount]);

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

  // When grouping, the grouped arrays are computed above (groupedByDate /
  // groupedByLocation) and surfaced through groupedPhotos.
  const groupedPhotos = useMemo<Array<[string, Photo[]]> | Photo[]>(() => {
    if (groupBy === 'date') return groupedByDate ?? [];
    if (groupBy === 'location') return groupedByLocation ?? [];
    return photos;
  }, [groupBy, groupedByDate, groupedByLocation, photos]);

  // When grouping, build the visible window of groups (header + a slice of
  // their photos) preserving group order, instead of flattening the whole list.
  const getVisibleGroups = (): Array<[string | null, Photo[]] | Photo> => {
    if (groupBy === 'none') return photos.slice(0, visibleCount);

    const groups = groupedPhotos as Array<[string, Photo[]]>;
    const result: Array<[string | null, Photo[]] | Photo> = [];
    let counted = 0;
    for (const entry of groups) {
      const [label, groupPhotos] = entry;
      const slice = groupPhotos.slice(0, Math.max(0, visibleCount - counted));
      counted += groupPhotos.length;
      // Skip groups that fall entirely beyond the visible window so we don't
      // render empty headings while scrolling through a large album.
      if (slice.length > 0) result.push([label, slice]);
      if (counted >= visibleCount) break;
    }
    return result;
  };

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

  const visibleItems = getVisibleGroups();

  return (
    <div className="photo-grid-scroll">
      {groupBy !== 'none'
        ? (visibleItems as Array<[string | null, Photo[]]>).map(
            ([label, groupPhotos]) => (
              <section key={label ?? 'unknown'} className="photo-date-group">
                <h2 className="photo-date-heading">
                  {formatGroupDate(label ?? '')}
                </h2>
                <div className="photo-aspect-row">
                  {groupPhotos.map((photo) => (
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
            )
          )
        : (
            <div className="photo-aspect-row">
              {(visibleItems as Photo[]).map((photo) => (
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
          )}

      {visibleCount < photos.length && (
        <div ref={loadMoreRef} className="photo-grid-sentinel" aria-hidden="true" />
      )}
    </div>
  );
};

export default memo(PhotoGrid);
