import {
  ArrowUpRight,
  FolderOpen,
  Globe2,
  Images,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import logoImg from '../assets/logo.png';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import RecentDirectories from '../components/layout/RecentDirectories';
import { useMotionNavigate } from '../hooks/useMotionNavigate';
import { usePhotos } from '../hooks/usePhotos';
import { selectDirectory } from '../services/api';

const WelcomeScreen = () => {
  const navigate = useMotionNavigate();
  const { handleScanDirectory, currentDirectory } = usePhotos();
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelectDirectory = async (directory?: string) => {
    try {
      setIsSelecting(true);

      if (!window.electronAPI) {
        throw new Error('Electron API not available');
      }

      const selectedDirectory = directory || (await selectDirectory());

      if (selectedDirectory) {
        await handleScanDirectory(selectedDirectory);
        navigate('/albums');
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-shell">
        <header className="welcome-brand">
          <div className="welcome-brand-mark">
            <img src={logoImg} alt="" />
          </div>
          <div>
            <p className="welcome-brand-name">Atlas Photo</p>
            <p className="welcome-brand-detail">Your local photo atlas</p>
          </div>
        </header>

        <div className="welcome-layout">
          <section className="welcome-story" aria-labelledby="welcome-heading">
            <div className="welcome-story-copy">
              <div className="welcome-title-row">
                <Sparkles size={18} aria-hidden="true" />
                <span>A new way to look back</span>
              </div>
              <h1 id="welcome-heading">
                Find the places
                <br />
                <em>inside your photos.</em>
              </h1>
              <p className="welcome-intro">
                Atlas Photo turns a folder of images into a living collection of
                memories, organized by album and mapped by where each moment
                happened.
              </p>
            </div>

            <div
              className="welcome-preview"
              aria-label="Illustration of photos arranged on a map"
            >
              <div className="welcome-preview-header">
                <span>ATLAS VIEW</span>
                <span>LOCAL LIBRARY</span>
              </div>
              <div className="welcome-map" aria-hidden="true">
                <div className="welcome-map-grid" />
                <svg viewBox="0 0 620 260" role="presentation">
                  <path d="M30 202 C130 176 168 214 251 151 S382 70 464 111 S545 159 591 45" />
                  <path d="M82 64 C151 103 186 79 250 107 S360 197 438 178" />
                </svg>
                <span className="welcome-map-pin welcome-map-pin-one">
                  <span />
                </span>
                <span className="welcome-map-pin welcome-map-pin-two">
                  <span />
                </span>
                <span className="welcome-map-pin welcome-map-pin-three">
                  <span />
                </span>
                <div className="welcome-map-label welcome-map-label-one">
                  COASTAL ROAD
                </div>
                <div className="welcome-map-label welcome-map-label-two">
                  ALPINE LIGHT
                </div>
              </div>
              <div className="welcome-preview-footer">
                <span className="welcome-preview-status">
                  <span className="welcome-status-dot" />
                  Ready when you are
                </span>
                <span>EXIF · MAP · ALBUMS</span>
              </div>
            </div>

            <div className="welcome-values" aria-label="Atlas Photo features">
              <div className="welcome-value">
                <span className="welcome-value-icon">
                  <Globe2 size={17} aria-hidden="true" />
                </span>
                <span>Location-aware</span>
              </div>
              <div className="welcome-value">
                <span className="welcome-value-icon">
                  <Images size={17} aria-hidden="true" />
                </span>
                <span>Album-first</span>
              </div>
              <div className="welcome-value">
                <span className="welcome-value-icon">
                  <ShieldCheck size={17} aria-hidden="true" />
                </span>
                <span>Private by design</span>
              </div>
            </div>
          </section>

          <Card
            variant="custom-glass"
            padding="p-0"
            shadow="l3"
            rounded="xl"
            className="welcome-menu"
          >
            <div className="welcome-menu-intro">
              <p className="welcome-menu-kicker">Start here</p>
              <h2>Open your photo library</h2>
              <p>
                Choose a folder on your device. Atlas Photo reads your images
                locally and builds your albums as it goes.
              </p>
            </div>

            <Button
              onClick={() => handleSelectDirectory()}
              variant="primary"
              size="lg"
              disabled={isSelecting}
              className="welcome-open-button"
            >
              {isSelecting ? (
                <span className="welcome-button-content">
                  <Loader2 size={19} className="animate-spin" />
                  Opening library...
                </span>
              ) : (
                <span className="welcome-button-content">
                  <FolderOpen size={19} />
                  Choose a photo folder
                  <ArrowUpRight size={17} aria-hidden="true" />
                </span>
              )}
            </Button>

            <div className="welcome-privacy-note">
              <ShieldCheck size={17} aria-hidden="true" />
              <span>
                <strong>Your photos stay on this device.</strong>
                <small>No upload, account, or subscription required.</small>
              </span>
            </div>

            <div className="welcome-menu-divider" />

            <RecentDirectories
              onSelectDirectory={handleSelectDirectory}
              currentDirectory={currentDirectory}
              className="welcome-recent"
            />
          </Card>
        </div>

        <footer className="welcome-footer">
          <span>Atlas Photo</span>
          <span>Browse locally. Remember visually.</span>
        </footer>
      </div>
    </div>
  );
};

export default WelcomeScreen;
