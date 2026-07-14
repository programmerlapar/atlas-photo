import { useEffect } from 'react';
import { usePhotoStore } from '../stores/photoStore';
import { scanDirectory, getPhotos } from '../services/api';
import type { Photo } from '../../../shared/types/photo';

/**
 * Hook for managing photos and directory scanning
 */
export const usePhotos = () => {
  const {
    photos,
    currentDirectory,
    isLoading,
    loadingProgress,
    error,
    setPhotos,
    addPhoto,
    removePhoto,
    setCurrentDirectory,
    setLoading,
    setLoadingProgress,
    setError,
    clearPhotos,
  } = usePhotoStore();

  useEffect(() => {
    // Set up event listeners for file watcher
    if (!window.electronAPI) {
      return;
    }

    // Listen for directory scan progress
    window.electronAPI.onDirectoryScanProgress((progress) => {
      setLoadingProgress(progress);
    });

    // Listen for new photos added
    window.electronAPI.onPhotoAdded((photo: Photo) => {
      addPhoto(photo);
    });

    // Listen for photos removed
    window.electronAPI.onPhotoRemoved((photoPath: string) => {
      removePhoto(photoPath);
    });

    // Cleanup listeners on unmount
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('directory-scan-progress');
        window.electronAPI.removeAllListeners('photo-added');
        window.electronAPI.removeAllListeners('photo-removed');
      }
    };
  }, [addPhoto, removePhoto, setLoadingProgress]);

  /**
   * Scans a directory for photos
   */
  const handleScanDirectory = async (directoryPath: string) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentDirectory(directoryPath);
      setLoadingProgress({ stage: 'scanning', current: 0, total: 0 });

      const result = await scanDirectory(directoryPath);

      if (result.error) {
        setError(result.error);
      } else {
        setPhotos(result.photos);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
      setLoadingProgress(null);
    }
  };

  /**
   * Loads photos from current directory
   */
  const loadPhotos = async () => {
    try {
      setLoading(true);
      setError(null);

      const photos = await getPhotos();
      setPhotos(photos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gets the last selected directory from Electron storage
   */
  const getLastDirectory = async (): Promise<string | null> => {
    if (!window.electronAPI) {
      return null;
    }

    try {
      return await window.electronAPI.getCurrentDirectory();
    } catch (error) {
      console.error('Error getting last directory:', error);
      return null;
    }
  };

  return {
    photos,
    currentDirectory,
    isLoading,
    loadingProgress,
    error,
    handleScanDirectory,
    loadPhotos,
    getLastDirectory,
    clearPhotos,
  };
};
