import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePhotos } from '../hooks/usePhotos';
import { useMotionNavigate } from '../hooks/useMotionNavigate';
import { encodePhotoId } from '../utils/photoId';
import MapView from '../components/map/MapView';
import PhotoClusterSheet from '../components/map/PhotoClusterSheet';
import { Toolbar } from '../components/layout';
import type { Photo } from '../../shared/types/photo';

/**
 * Map view page component
 * Full-screen map showing photo locations
 */
const MapViewPage = () => {
  const navigate = useMotionNavigate();
  const location = useLocation();
  const { photos } = usePhotos();
  const [nearbyPhotos, setNearbyPhotos] = useState<Photo[] | null>(null);
  const restoredClusterKey = useRef<string | null>(null);

  useEffect(() => {
    const reopenClusterPhotoIds = location.state?.reopenClusterPhotoIds;
    if (
      !Array.isArray(reopenClusterPhotoIds) ||
      !reopenClusterPhotoIds.every((id) => typeof id === 'string')
    ) {
      return;
    }

    const clusterKey = reopenClusterPhotoIds.join('|');
    if (!clusterKey || restoredClusterKey.current === clusterKey) return;

    const photosById = new Map(photos.map((photo) => [photo.id, photo]));
    const restoredPhotos = reopenClusterPhotoIds
      .map((id) => photosById.get(id))
      .filter((photo): photo is Photo => Boolean(photo));

    if (restoredPhotos.length > 0) {
      restoredClusterKey.current = clusterKey;
      setNearbyPhotos(restoredPhotos);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate, photos]);

  const handlePhotoSelect = useCallback(
    (photo: Photo) => {
      navigate(`/detail/${encodePhotoId(photo.id)}`, {
        state: {
          returnTo: '/map',
          clusterPhotoIds: nearbyPhotos?.map((nearbyPhoto) => nearbyPhoto.id),
        },
      });
    },
    [navigate, nearbyPhotos]
  );

  const handleClusterClick = useCallback(
    (clusterPhotos: Photo[]) => {
      if (clusterPhotos.length === 1) {
        handlePhotoSelect(clusterPhotos[0]);
        return;
      }

      setNearbyPhotos(clusterPhotos);
    },
    [handlePhotoSelect]
  );

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/gallery');
  };

  return (
    <div className="map-page flex flex-col">
      <Toolbar title="Map" subtitle="Photo locations" onBack={handleBack} />
      <div className="relative min-h-0 flex-1">
        <MapView photos={photos} onClusterClick={handleClusterClick} />
        {nearbyPhotos && (
          <PhotoClusterSheet
            photos={nearbyPhotos}
            onClose={() => setNearbyPhotos(null)}
            onPhotoSelect={handlePhotoSelect}
          />
        )}
      </div>
    </div>
  );
};

export default MapViewPage;
