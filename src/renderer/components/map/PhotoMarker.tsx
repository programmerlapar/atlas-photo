import { DivIcon } from 'leaflet';
import { encodeFilePath } from '../../utils/photoId';
import type { Photo } from '../../../shared/types/photo';

const fallbackGlyph = `
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path fill="white" d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Zm2 0v10l3.5-3.5 2.5 2.5 2.5-3L18 15V5H6Zm3 2.5A1.5 1.5 0 1 0 9 10.5 1.5 1.5 0 0 0 9 7.5Z"/>
  </svg>`;

const escapeHtml = (value: string): string =>
  value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };
    return entities[character];
  });

/** Creates a marker that always has a visible fallback if its image fails. */
export const createPhotoIcon = (photo: Photo, count = 1, size = 60): DivIcon => {
  const thumbnailUrl = photo.thumbnailPath
    ? `photomap://${encodeFilePath(photo.thumbnailPath)}`
    : null;
  const image = thumbnailUrl
    ? `<img src="${thumbnailUrl}" alt="${escapeHtml(photo.filename)}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />`
    : '';
  const countBadge = count > 1
    ? `<span style="position:absolute;right:-7px;bottom:-7px;z-index:1;min-width:22px;height:22px;padding:0 4px;border-radius:11px;background:#0A6E8C;border:2px solid white;color:white;font:700 10px/18px system-ui;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.25)">${count}</span>`
    : '';

  return new DivIcon({
    className: 'photo-marker',
    html: `
      <div class="photo-marker-content" style="width:${size}px;height:${size}px;position:relative">
        <div style="width:100%;height:100%;border-radius:14px;overflow:hidden;border:2px solid #1EC8E6;box-shadow:0 3px 10px rgba(0,0,0,.3);background:#0A2A4A;position:relative">
          ${image}
          <div style="${thumbnailUrl ? 'display:none' : 'display:flex'};position:absolute;inset:0;align-items:center;justify-content:center;background:linear-gradient(135deg,#1EC8E6,#0A2A4A)">${fallbackGlyph}</div>
        </div>
        ${countBadge}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

class PhotoMarker {
  static createIcon(photo: Photo, count = 1, size = 60): DivIcon {
    return createPhotoIcon(photo, count, size);
  }
}

export default PhotoMarker;
