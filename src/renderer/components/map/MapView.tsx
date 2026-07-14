import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { useNavigate } from 'react-router-dom';
import '../../styles/leaflet.css';
import type { Photo } from '../../../shared/types/photo';
import PhotoMarker from './PhotoMarker';
import MapPopup from './MapPopup';

/**
 * Tile provider configuration
 * Supports multiple tile sources with fallback options
 */
const TILE_PROVIDERS = {
  carto: {
    name: 'CartoDB Positron',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
  },
  cartoDark: {
    name: 'CartoDB Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
  },
  stamen: {
    name: 'Stamen Terrain',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
    attribution:
      'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
  },
};

// Fix for default marker icons in Leaflet with webpack/vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Set default icon
Icon.Default = DefaultIcon;

/**
 * Map bounds fitter component
 * Fits map bounds to show all photo locations
 */
const MapBoundsFitter = ({ photos }: { photos: Photo[] }) => {
  const map = useMap();

  useEffect(() => {
    const photosWithLocation = photos.filter(
      (photo) => photo.metadata?.location !== undefined
    );

    if (photosWithLocation.length === 0) return;

    const bounds = new LatLngBounds(
      photosWithLocation.map((photo) => [
        photo.metadata!.location!.latitude,
        photo.metadata!.location!.longitude,
      ])
    );

    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, photos]);

  return null;
};

export interface MapViewProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
}

/**
 * Map view component with Leaflet integration
 * Displays photo locations on an interactive map
 */
const MapView = ({ photos, onPhotoClick }: MapViewProps) => {
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const photosWithLocation = photos.filter(
    (photo) => photo.metadata?.location !== undefined
  );

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleMarkerClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    if (onPhotoClick) {
      onPhotoClick(photo);
    }
  };

  const handlePopupClick = (photo: Photo) => {
    navigate(`/detail/${photo.id}`);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-[var(--text-primary)] font-semibold">Loading map...</p>
        </div>
      </div>
    );
  }

  if (photosWithLocation.length === 0) {
    return (
      <div className="w-full h-full bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="glass-surface-2 rounded-xl p-12 max-w-md text-center space-y-6">
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            No Photos with Location Data
          </p>
          <p className="text-neutral-400">
            Select photos with GPS coordinates to see them on the map
          </p>
        </div>
      </div>
    );
  }

  // Calculate center point from all photos
  const center: [number, number] =
    photosWithLocation.length > 0
      ? [
          photosWithLocation.reduce(
            (sum, photo) => sum + photo.metadata!.location!.latitude,
            0
          ) / photosWithLocation.length,
          photosWithLocation.reduce(
            (sum, photo) => sum + photo.metadata!.location!.longitude,
            0
          ) / photosWithLocation.length,
        ]
      : [0, 0];

  // Use CartoDB Dark Matter by default (dark theme, matches app theme better)
  // This provider is reliable and works well with dark UI
  const currentProvider = TILE_PROVIDERS.cartoDark;

  return (
    <MapContainer
      key={`map-${photosWithLocation.length}`}
      center={center}
      zoom={2}
      style={{ height: '100%', width: '100%' }}
      className="w-full h-full"
      zoomControl={true}
    >
      <TileLayer
        attribution={currentProvider.attribution}
        url={currentProvider.url}
        subdomains={currentProvider.subdomains}
        errorTileUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Crect fill='%230a2a4a' width='256' height='256'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23ffffff' font-family='Arial' font-size='14'%3ETile unavailable%3C/text%3E%3C/svg%3E"
        maxZoom={19}
        maxNativeZoom={19}
        crossOrigin={true}
      />
      <MapBoundsFitter photos={photosWithLocation} />
      {photosWithLocation.map((photo) => (
        <Marker
          key={photo.id}
          position={[
            photo.metadata!.location!.latitude,
            photo.metadata!.location!.longitude,
          ]}
          icon={PhotoMarker.createIcon(photo)}
          eventHandlers={{
            click: () => handleMarkerClick(photo),
          }}
        >
          <Popup>
            <MapPopup photo={photo} onClick={() => handlePopupClick(photo)} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
