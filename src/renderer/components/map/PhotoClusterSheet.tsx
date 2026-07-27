import { useEffect, useState } from 'react';
import { ImageOff, X } from 'lucide-react';
import { encodeFilePath } from '../../utils/photoId';
import { generateThumbnail } from '../../services/api';
import type { Photo } from '../../../shared/types/photo';

export interface PhotoClusterSheetProps {
  photos: Photo[];
  onClose: () => void;
  onPhotoSelect: (photo: Photo) => void;
}

/** Browses the actual photos represented by a grouped map marker. */
const PhotoClusterSheet = ({ photos, onClose, onPhotoSelect }: PhotoClusterSheetProps) => {
  const [generatedPaths, setGeneratedPaths] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    setGeneratedPaths({});
    // Make the immediately visible sheet cells jump ahead of idle work. The
    // rest continue through the shared background queue as the user browses.
    void Promise.all(
      photos.slice(0, 12).filter((photo) => !photo.thumbnailPath).map(async (photo) => {
        const thumbnailPath = await generateThumbnail(photo.path, 'visible');
        if (!cancelled && thumbnailPath) {
          setGeneratedPaths((current) => ({ ...current, [photo.path]: thumbnailPath }));
        }
      })
    );
    return () => {
      cancelled = true;
    };
  }, [photos]);

  return (
  <div className="absolute inset-0 z-[2000]" role="dialog" aria-modal="true" aria-label="Photos in this map area">
    <button
      className="absolute inset-0 cursor-default bg-[var(--bg-primary)]/20 backdrop-blur-[1px]"
      onClick={onClose}
      aria-label="Close nearby photos"
    />
    <section className="absolute inset-x-3 bottom-3 max-h-[68%] overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-[0_-12px_40px_rgba(48,48,144,0.2)] backdrop-blur-2xl">
      <div className="flex items-center justify-between border-b border-[var(--color-neutral-200)] px-5 py-3">
        <div>
          <div className="mx-auto mb-2 h-1 w-9 rounded-full bg-[var(--color-neutral-400)]" />
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            {photos.length} photos nearby
          </h2>
          <p className="text-xs text-[var(--text-tertiary)]">Newest first</p>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-neutral-100)] text-[var(--text-primary)] transition-smooth hover:bg-[var(--color-neutral-200)]"
          aria-label="Close nearby photos"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid max-h-[calc(68vh-106px)] grid-cols-3 gap-3 overflow-y-auto p-4 sm:grid-cols-4 md:grid-cols-5">
        {photos.map((photo, index) => {
          const thumbnailPath = photo.thumbnailPath || generatedPaths[photo.path];
          return (
            <button
            key={photo.id}
            onClick={() => onPhotoSelect(photo)}
            className="group relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-[var(--color-primary-mid)] to-[var(--bg-primary)] text-left shadow-[0_3px_10px_rgba(48,48,144,0.16)] transition-smooth hover:-translate-y-0.5 hover:shadow-[0_7px_16px_rgba(48,48,144,0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary-mid)]"
            aria-label={`View ${photo.filename}`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageOff className="h-6 w-6 text-white/80" />
            </div>
            {thumbnailPath && (
              <img
                 src={`atlas-photo://${encodeFilePath(thumbnailPath)}`}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            )}
            {index === 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-[var(--color-primary-mid)]/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                Latest
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--bg-primary)]/80 to-transparent px-2 pb-2 pt-6 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              {photo.filename}
            </span>
            </button>
          );
        })}
      </div>
    </section>
  </div>
  );
};

export default PhotoClusterSheet;
