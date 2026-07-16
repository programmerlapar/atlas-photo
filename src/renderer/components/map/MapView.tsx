import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import * as Leaflet from 'leaflet';
import { DivIcon, LatLngBounds } from 'leaflet';
import '../../styles/leaflet.css';
import type { Photo } from '../../../shared/types/photo';
import PhotoMarker from './PhotoMarker';
import { generateThumbnail } from '../../services/api';
import { getCachedThumbnail } from '../../cache/thumbCache';

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
  voyager: {
    name: 'CartoDB Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
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
};

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

interface NearbyPhotoCluster {
  id: string;
  photo: Photo;
  photos: Photo[];
  count: number;
  latitude: number;
  longitude: number;
}

type MarkerPhase = 'entering' | 'visible' | 'leaving';

type PresentedPhotoCluster = NearbyPhotoCluster & {
  phase: MarkerPhase;
};

type InternalPhotoCluster = NearbyPhotoCluster & {
  x: number;
  y: number;
};

const getPhotoTimestamp = (photo: Photo): number => {
  const date = photo.metadata?.date ? new Date(photo.metadata.date).getTime() : 0;
  return Number.isFinite(date) ? date : 0;
};

/**
 * Groups photos by their screen-space distance. The threshold remains stable
 * in pixels, so a cluster automatically separates as the user zooms in.
 */
const ClusteredPhotoMarkers = ({
  photos,
  onClusterClick,
}: {
  photos: Photo[];
  onClusterClick?: (clusterPhotos: Photo[]) => void;
}) => {
  const map = useMap();
  const [viewportVersion, setViewportVersion] = useState(0);
  const [presentedClusters, setPresentedClusters] = useState<PresentedPhotoCluster[]>([]);
  const iconCache = useRef(
    new Map<string, { signature: string; icon: DivIcon }>()
  );

  useMapEvents({
    moveend: () => setViewportVersion((version) => version + 1),
    zoomend: () => setViewportVersion((version) => version + 1),
  });

  const clusters = useMemo(() => {
    // This counter changes only after Leaflet has settled a pan or zoom.
    // Reading it makes the screen-space grouping intentionally recompute then.
    void viewportVersion;
    const zoom = map.getZoom();
    const threshold = zoom <= 5 ? 112 : zoom >= 14 ? 96 : 104;
    const cells = new Map<string, InternalPhotoCluster[]>();
    const clustersById = new Map<string, InternalPhotoCluster>();
    const sortedPhotos = [...photos].sort((left, right) => getPhotoTimestamp(right) - getPhotoTimestamp(left));

    for (const photo of sortedPhotos) {
      const location = photo.metadata!.location!;
      const point = map.project([location.latitude, location.longitude], zoom);
      const cellX = Math.floor(point.x / threshold);
      const cellY = Math.floor(point.y / threshold);
      let nearbyCluster: InternalPhotoCluster | undefined;

      for (let x = cellX - 1; x <= cellX + 1 && !nearbyCluster; x++) {
        for (let y = cellY - 1; y <= cellY + 1 && !nearbyCluster; y++) {
          for (const candidate of cells.get(`${x}:${y}`) || []) {
            if (Math.hypot(point.x - candidate.x, point.y - candidate.y) <= threshold) {
              nearbyCluster = candidate;
              break;
            }
          }
        }
      }

      if (nearbyCluster) {
        nearbyCluster.count++;
        nearbyCluster.photos.push(photo);
        continue;
      }

      const cluster = {
        id: photo.id,
        photo,
        photos: [photo],
        count: 1,
        latitude: location.latitude,
        longitude: location.longitude,
        x: point.x,
        y: point.y,
      };
      clustersById.set(cluster.id, cluster);
      const cellKey = `${cellX}:${cellY}`;
      cells.set(cellKey, [...(cells.get(cellKey) || []), cluster]);
    }

    return Array.from(clustersById.values());
  }, [map, photos, viewportVersion]);

  const markerIcons = useMemo(() => {
    const icons = new Map<string, DivIcon>();
    const markerSize = 80;
    for (const cluster of clusters) {
      const signature = `${cluster.photo.thumbnailPath || ''}:${cluster.count}:${markerSize}`;
      const cached = iconCache.current.get(cluster.id);
      if (cached?.signature === signature) {
        icons.set(cluster.id, cached.icon);
        continue;
      }

      const icon = PhotoMarker.createIcon(cluster.photo, cluster.count, markerSize);
      iconCache.current.set(cluster.id, { signature, icon });
      icons.set(cluster.id, icon);
    }
    return icons;
  }, [clusters]);

  // Keep removed markers mounted briefly so merging markers fade away instead
  // of abruptly disappearing while their nearby photos resolve into view.
  useEffect(() => {
    const activeClusterIds = new Set(clusters.map((cluster) => cluster.id));

    setPresentedClusters((current) => {
      const currentById = new Map(current.map((cluster) => [cluster.id, cluster]));
      const nextClusters = clusters.map((cluster) => ({
        ...cluster,
        phase: currentById.has(cluster.id) ? 'visible' as const : 'entering' as const,
      }));
      const leavingClusters = current
        .filter((cluster) => !activeClusterIds.has(cluster.id))
        .map((cluster) => ({ ...cluster, phase: 'leaving' as const }));

      return [...nextClusters, ...leavingClusters];
    });

    const startFadeIn = window.setTimeout(() => {
      setPresentedClusters((current) => current
        .map((cluster) => cluster.phase === 'entering'
          ? { ...cluster, phase: 'visible' as const }
          : cluster));
    }, 16);

    const removeFadedMarkers = window.setTimeout(() => {
      setPresentedClusters((current) => current.filter((cluster) => cluster.phase !== 'leaving'));
    }, 200);

    return () => {
      window.clearTimeout(startFadeIn);
      window.clearTimeout(removeFadedMarkers);
    };
  }, [clusters]);

  return (
    <>
      {presentedClusters.map((cluster) => (
        <Marker
          key={cluster.id}
          position={[cluster.latitude, cluster.longitude]}
          icon={markerIcons.get(cluster.id) || iconCache.current.get(cluster.id)?.icon || PhotoMarker.createIcon(cluster.photo, cluster.count, 80)}
          opacity={cluster.phase === 'entering' || cluster.phase === 'leaving' ? 0 : 1}
          interactive={cluster.phase !== 'leaving'}
          eventHandlers={{
            click: () => onClusterClick?.(cluster.photos),
          }}
        />
      ))}
    </>
  );
};

/**
 * Enables the continuous requestAnimationFrame wheel interaction supplied by
 * Leaflet.SmoothWheelZoom, while retaining a native-wheel fallback if loading
 * the optional plugin ever fails.
 */
const SmoothWheelZoom = () => {
  const map = useMap();

  useEffect(() => {
    let cancelled = false;
    let handler: Leaflet.Handler | undefined;

    const enableSmoothWheelZoom = async () => {
      // The upstream plugin registers itself against Leaflet's global `L`.
      // Leaflet is ESM in this app, so expose that same instance before import.
      (globalThis as typeof globalThis & { L?: typeof Leaflet }).L = Leaflet;

      try {
        await import('@luomus/leaflet-smooth-wheel-zoom');
        if (cancelled) return;

        const smoothMap = map as Leaflet.Map & { smoothWheelZoom?: Leaflet.Handler };
        const mapConstructor = Leaflet.Map as typeof Leaflet.Map & {
          SmoothWheelZoom?: new (targetMap: Leaflet.Map) => Leaflet.Handler;
        };

        handler = smoothMap.smoothWheelZoom
          || (mapConstructor.SmoothWheelZoom
            ? new mapConstructor.SmoothWheelZoom(map)
            : undefined);
        smoothMap.smoothWheelZoom = handler;
        map.scrollWheelZoom.disable();
        handler?.enable();
      } catch (error) {
        console.warn('Smooth wheel zoom could not be enabled; using Leaflet wheel zoom.', error);
        if (!cancelled) map.scrollWheelZoom.enable();
      }
    };

    void enableSmoothWheelZoom();

    return () => {
      cancelled = true;
      handler?.disable();
    };
  }, [map]);

  return null;
};

export interface MapViewProps {
  photos: Photo[];
  onClusterClick?: (clusterPhotos: Photo[]) => void;
}

/**
 * Map view component with Leaflet integration
 * Displays photo locations on an interactive map
 */
const MapView = ({ photos, onClusterClick }: MapViewProps) => {
  const [isMapReady, setIsMapReady] = useState(false);
  const [thumbnailPaths, setThumbnailPaths] = useState<Record<string, string>>({});

  const photosWithLocation = useMemo(
    () => photos.filter((photo) => photo.metadata?.location !== undefined),
    [photos]
  );
  const mapPhotoKey = photosWithLocation.map((photo) => photo.id).join('|');

  useEffect(() => {
    let cancelled = false;
    const cachedPaths: Record<string, string> = {};
    const missingPhotos = photosWithLocation.filter((photo) => {
      const cachedThumbnail = photo.thumbnailPath || getCachedThumbnail(photo.path);
      if (cachedThumbnail) {
        cachedPaths[photo.path] = cachedThumbnail;
        return false;
      }
      return true;
    });

    if (Object.keys(cachedPaths).length > 0) {
      setThumbnailPaths((current) => ({ ...current, ...cachedPaths }));
    }

    let nextIndex = 0;
    const loadNext = async (): Promise<void> => {
      while (!cancelled && nextIndex < missingPhotos.length) {
        const photo = missingPhotos[nextIndex++];
        const thumbnailPath = await generateThumbnail(photo.path);
        if (!cancelled && thumbnailPath) {
          setThumbnailPaths((current) =>
            current[photo.path] === thumbnailPath
              ? current
              : { ...current, [photo.path]: thumbnailPath }
          );
        }
      }
    };

    void Promise.all(Array.from({ length: Math.min(4, missingPhotos.length) }, loadNext));
    return () => {
      cancelled = true;
    };
    // Re-run only when the map's photo set changes, not as each thumbnail lands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapPhotoKey]);

  const mapPhotos = useMemo(
    () => photosWithLocation.map((photo) => ({
      ...photo,
      thumbnailPath: photo.thumbnailPath || thumbnailPaths[photo.path] || getCachedThumbnail(photo.path),
    })),
    [photosWithLocation, thumbnailPaths]
  );
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

  // Voyager keeps roads, water, terrain, and labels recognizable while still
  // fitting the app's cyan accent better than a monochrome dark tile.
  const currentProvider = TILE_PROVIDERS.voyager;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#e8f3f7]">
      <MapContainer
        key={`map-${photosWithLocation.length}`}
        center={center}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        className="w-full h-full"
        zoomControl={true}
        attributionControl={false}
        scrollWheelZoom={false}
        smoothWheelZoom={true}
        smoothSensitivity={1}
        zoomSnap={0}
        zoomDelta={0.5}
        zoomAnimation={true}
        markerZoomAnimation={true}
        fadeAnimation={true}
        whenReady={() => setIsMapReady(true)}
      >
        <TileLayer
          attribution={currentProvider.attribution}
          url={currentProvider.url}
          subdomains={currentProvider.subdomains}
          errorTileUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Crect fill='%23e8f3f7' width='256' height='256'/%3E%3Cpath d='M0 128h256M128 0v256' stroke='%23bdd6df' stroke-width='2'/%3E%3C/svg%3E"
          maxZoom={19}
          maxNativeZoom={19}
          crossOrigin={true}
        />
        <MapBoundsFitter photos={photosWithLocation} />
        <SmoothWheelZoom />
        <ClusteredPhotoMarkers photos={mapPhotos} onClusterClick={onClusterClick} />
      </MapContainer>
      <div className="absolute bottom-2 right-2 z-[450] rounded-full border border-white/70 bg-white/72 px-2.5 py-1 text-[10px] font-medium text-[#527080] shadow-[0_2px_8px_rgba(37,99,120,0.12)] backdrop-blur-md">
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="hover:text-[#123247]"
        >
          © OpenStreetMap
        </a>
        <span aria-hidden="true"> · </span>
        <a
          href="https://carto.com/attributions"
          target="_blank"
          rel="noreferrer"
          className="hover:text-[#123247]"
        >
          CARTO
        </a>
      </div>
      <div
        className={`absolute inset-0 z-[500] flex items-center justify-center bg-[#e8f3f7]/92 backdrop-blur-sm transition-opacity duration-300 ${
          isMapReady ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
        aria-hidden={isMapReady}
      >
        <div className="flex items-center gap-3 rounded-2xl border border-[#b9d7e1] bg-white/90 px-5 py-4 shadow-[0_14px_35px_rgba(37,99,120,0.16)]">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#0A6E8C]">
            <span className="absolute h-7 w-7 rounded-full border border-white/60 animate-ping" />
            <span className="h-3 w-3 rounded-full bg-white shadow-sm" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#123247]">Finding your places</p>
            <p className="text-xs text-[#527080]">Loading map details</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
