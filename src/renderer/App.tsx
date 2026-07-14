import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useThemeStore } from './stores/themeStore';
import WelcomeScreen from './views/WelcomeScreen';
import AlbumsView from './views/AlbumsView';
import GalleryView from './views/GalleryView';
import DetailView from './views/DetailView';
import MapViewPage from './views/MapView';
import SettingsView from './views/SettingsView';

/**
 * Root application component
 * Handles routing between different views and theme management
 */
const App = () => {
  const { theme } = useThemeStore();
  const [hasAlbums, setHasAlbums] = useState<boolean | null>(null);

  // Apply theme to document on mount and theme change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Check if albums exist on mount
  useEffect(() => {
    const checkAlbums = async () => {
      try {
        if (window.electronAPI) {
          const recentDirs = await window.electronAPI.getRecentDirectories();
          setHasAlbums(recentDirs.length > 0);
        } else {
          setHasAlbums(false);
        }
      } catch (error) {
        console.error('Error checking albums:', error);
        setHasAlbums(false);
      }
    };

    checkAlbums();
  }, []);

  // Show loading state while checking albums
  if (hasAlbums === null) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg-primary) transition-colors duration-300">
      <Routes>
        <Route
          path="/"
          element={hasAlbums ? <AlbumsView /> : <WelcomeScreen />}
        />
        <Route path="/albums" element={<AlbumsView />} />
        <Route path="/gallery" element={<GalleryView />} />
        <Route path="/detail/:photoId" element={<DetailView />} />
        <Route path="/map" element={<MapViewPage />} />
        <Route path="/settings" element={<SettingsView />} />
      </Routes>
    </div>
  );
};

export default App;
