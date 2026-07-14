import { useNavigate } from 'react-router-dom';
import { Grid, ArrowLeft } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { usePhotos } from '../hooks/usePhotos';
import { encodePhotoId } from '../utils/photoId';
import Button from '../components/ui/Button';

// Lazy load MapView to avoid context issues with react-leaflet v5 in Electron/Vite
const MapView = lazy(() => import('../components/map/MapView'));

/**
 * Map view page component
 * Full-screen map showing photo locations
 */
const MapViewPage = () => {
  const navigate = useNavigate();
  const { photos } = usePhotos();

  const handlePhotoClick = (photo: { id: string }) => {
    navigate(`/detail/${encodePhotoId(photo.id)}`);
  };

  const handleGalleryToggle = () => {
    navigate('/gallery');
  };

  return (
    <div className="w-full h-screen bg-[var(--bg-primary)] flex flex-col relative">
      {/* Toolbar */}
      <div className="glass-surface-2 border-b border-white/10 sticky top-0 z-10 shadow-l2">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGalleryToggle}
              className="p-2 rounded hover:bg-white/10 transition-smooth"
              aria-label="Back to gallery"
              title="Back to gallery"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
            </button>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Map View</h2>
          </div>
          <Button onClick={handleGalleryToggle} variant="secondary" size="sm">
            <Grid className="w-4 h-4 mr-2" />
            Gallery
          </Button>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <Suspense
          fallback={
            <div className="w-full h-full bg-[var(--bg-primary)] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-lg text-[var(--text-primary)] font-semibold">Loading map...</p>
              </div>
            </div>
          }
        >
          <MapView photos={photos} onPhotoClick={handlePhotoClick} />
        </Suspense>
      </div>
    </div>
  );
};

export default MapViewPage;
