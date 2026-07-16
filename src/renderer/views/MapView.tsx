import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePhotos } from '../hooks/usePhotos';
import { encodePhotoId } from '../utils/photoId';
import MapView from '../components/map/MapView';
import PhotoClusterSheet from '../components/map/PhotoClusterSheet';
import type { Photo } from '../../shared/types/photo';

/**
 * Map view page component
 * Full-screen map showing photo locations
 */
const MapViewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { photos } = usePhotos();
  const [nearbyPhotos, setNearbyPhotos] = useState<Photo[] | null>(null);
  const restoredClusterKey = useRef<string | null>(null);

  useEffect(() => {
    const reopenClusterPhotoIds = location.state?.reopenClusterPhotoIds;
    if (!Array.isArray(reopenClusterPhotoIds) || !reopenClusterPhotoIds.every((id) => typeof id === 'string')) {
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

  const handleClusterClick = (clusterPhotos: Photo[]) => {
    if (clusterPhotos.length === 1) {
      handlePhotoSelect(clusterPhotos[0]);
      return;
    }

    setNearbyPhotos(clusterPhotos);
  };

  const handlePhotoSelect = (photo: Photo) => {
    navigate(`/detail/${encodePhotoId(photo.id)}`, {
      state: {
        returnTo: '/map',
        clusterPhotoIds: nearbyPhotos?.map((nearbyPhoto) => nearbyPhoto.id),
      },
    });
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/gallery');
  };

  return (
    <div className="w-full h-screen bg-[var(--bg-primary)] flex flex-col relative">
      {/* A single contextual back action is more reliable than a duplicate Gallery button. */}
      <header className="z-10 border-b border-white/70 bg-white/72 backdrop-blur-2xl shadow-[0_4px_20px_rgba(37,99,120,0.12)]">
        <div className="grid h-[68px] grid-cols-[44px_1fr_44px] items-center px-4">
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/55 text-[#123247] shadow-[0_2px_8px_rgba(37,99,120,0.12)] transition-smooth hover:bg-white/90 focus-visible:bg-white/90"
            aria-label="Go back"
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-center text-[17px] font-semibold tracking-[-0.01em] text-[#123247]">
            Map
          </h1>
          <div aria-hidden="true" />
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
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
