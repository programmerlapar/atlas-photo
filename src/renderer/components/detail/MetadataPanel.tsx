import {
  MapPin,
  Calendar,
  Camera,
  X,
  ExternalLink,
  Share2,
  FolderOpen,
  Copy,
} from 'lucide-react';
import {
  sharePhoto,
  showPhotoInFolder,
  copyPhotoPath,
} from '../../services/api';
import { useState } from 'react';
import Card from '../ui/Card';
import type { Photo } from '../../../shared/types/photo';

export interface MetadataPanelProps {
  photo: Photo;
  onClose: () => void;
  onLocationClick?: () => void;
}

/**
 * Metadata panel component for photo detail view
 * Displays EXIF data, date, location, and camera information
 * Uses Liquid Glass Card component for elevated surface
 */
const MetadataPanel = ({
  photo,
  onClose,
  onLocationClick,
}: MetadataPanelProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isShowingInFolder, setIsShowingInFolder] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLocation = (location?: {
    latitude: number;
    longitude: number;
  }) => {
    if (!location) return null;
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  const formatCamera = (camera?: {
    make?: string;
    model?: string;
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    focalLength?: string;
  }) => {
    if (!camera) return null;
    const parts = [];
    if (camera.make) parts.push(camera.make);
    if (camera.model) parts.push(camera.model);
    return parts.join(' ');
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const result = await sharePhoto(photo.path);
      if (!result.success && result.error) {
        console.error('Error sharing photo:', result.error);
      }
    } catch (error) {
      console.error('Error sharing photo:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleShowInFolder = async () => {
    setIsShowingInFolder(true);
    try {
      const result = await showPhotoInFolder(photo.path);
      if (!result.success && result.error) {
        console.error('Error showing photo in folder:', result.error);
      }
    } catch (error) {
      console.error('Error showing photo in folder:', error);
    } finally {
      setIsShowingInFolder(false);
    }
  };

  const handleCopyPath = async () => {
    setIsCopying(true);
    try {
      const result = await copyPhotoPath(photo.path);
      if (result.success) {
        // Show feedback (could use a toast notification in the future)
      } else if (result.error) {
        console.error('Error copying photo path:', result.error);
      }
    } catch (error) {
      console.error('Error copying photo path:', error);
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Card
      variant="custom-glass"
      padding="p-0"
      shadow="l3"
      rounded="md"
      className="w-80 border-l border-[var(--border-default)] flex flex-col animate-slide-up"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-default)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Details</h2>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[var(--glass-bg-1)] transition-smooth"
          aria-label="Close metadata"
        >
          <X className="w-5 h-5 text-[var(--text-primary)]" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* File info */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
            File
          </h3>
          <div className="space-y-1">
            <p className="text-sm text-[var(--text-primary)] break-all">{photo.filename}</p>
            <p className="text-xs text-[var(--text-tertiary)] break-all">{photo.path}</p>
          </div>
          {/* File actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-primary)] bg-[var(--glass-bg-1)] hover:bg-[var(--glass-bg-2)] rounded transition-smooth disabled:opacity-50"
              title="Share photo"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <button
              onClick={handleShowInFolder}
              disabled={isShowingInFolder}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-primary)] bg-[var(--glass-bg-1)] hover:bg-[var(--glass-bg-2)] rounded transition-smooth disabled:opacity-50"
              title="Show in folder"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Folder
            </button>
            <button
              onClick={handleCopyPath}
              disabled={isCopying}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-primary)] bg-[var(--glass-bg-1)] hover:bg-[var(--glass-bg-2)] rounded transition-smooth disabled:opacity-50"
              title="Copy path to clipboard"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Path
            </button>
          </div>
        </div>

        {/* Date */}
        {photo.metadata?.date && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date
            </h3>
            <p className="text-sm text-[var(--text-primary)]">
              {formatDate(photo.metadata.date)}
            </p>
          </div>
        )}

        {/* Location */}
        {photo.metadata?.location && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wide flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Location
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-[var(--text-primary)]">
                {formatLocation(photo.metadata.location)}
              </p>
              {onLocationClick && (
                <button
                  onClick={onLocationClick}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Map
                </button>
              )}
            </div>
          </div>
        )}

        {/* Camera */}
        {photo.metadata?.camera && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wide flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Camera
            </h3>
            <div className="space-y-1">
              {formatCamera(photo.metadata.camera) && (
                <p className="text-sm text-[var(--text-primary)]">
                  {formatCamera(photo.metadata.camera)}
                </p>
              )}
              {photo.metadata.camera.iso && (
                <p className="text-xs text-[var(--text-tertiary)]">
                  ISO {photo.metadata.camera.iso}
                </p>
              )}
              {photo.metadata.camera.aperture && (
                <p className="text-xs text-[var(--text-tertiary)]">
                  Aperture: {photo.metadata.camera.aperture}
                </p>
              )}
              {photo.metadata.camera.shutterSpeed && (
                <p className="text-xs text-[var(--text-tertiary)]">
                  Shutter: {photo.metadata.camera.shutterSpeed}
                </p>
              )}
              {photo.metadata.camera.focalLength && (
                <p className="text-xs text-[var(--text-tertiary)]">
                  Focal Length: {photo.metadata.camera.focalLength}
                </p>
              )}
            </div>
          </div>
        )}

        {/* EXIF data */}
        {photo.metadata?.exif && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
              EXIF Data
            </h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {Object.entries(photo.metadata.exif).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-[var(--text-tertiary)]">{key}:</span>
                  <span className="text-[var(--text-primary)] text-right">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetadataPanel;
