import { Icon, DivIcon } from 'leaflet';
import { encodeFilePath } from '../../utils/photoId';
import type { Photo } from '../../../shared/types/photo';

/**
 * Creates a custom marker icon for a photo
 */
export const createPhotoIcon = (photo: Photo): Icon | DivIcon => {
  const thumbnailUrl = photo.thumbnailPath
    ? `photomap://${encodeFilePath(photo.thumbnailPath)}`
    : null;

  if (thumbnailUrl) {
    // Create custom icon with thumbnail
    return new DivIcon({
      className: 'photo-marker',
      html: `
        <div style="
          width: 48px;
          height: 48px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid #1EC8E6;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          background: #0A2A4A;
        ">
          <img 
            src="${thumbnailUrl}" 
            alt="${photo.filename}"
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
            "
            onerror="this.parentElement.style.background='#1EC8E6';"
          />
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -24],
    });
  }

  // Default marker without thumbnail
  return new Icon({
    iconUrl:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMUVDOEU2Ii8+Cjwvc3ZnPgo=',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

/**
 * PhotoMarker utility class
 */
class PhotoMarker {
  static createIcon(photo: Photo): Icon | DivIcon {
    return createPhotoIcon(photo);
  }
}

export default PhotoMarker;
