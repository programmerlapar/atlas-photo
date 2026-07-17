import { MapPin, Lock, Sparkles, Camera, Globe, Shield, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { selectDirectory } from '../services/api';
import { usePhotos } from '../hooks/usePhotos';
import { useMotionNavigate } from '../hooks/useMotionNavigate';
import RecentDirectories from '../components/layout/RecentDirectories';

/**
 * Welcome screen component displayed on first launch
 * Engages photography enthusiasts and travelers with compelling value proposition
 * Uses Liquid Glass Card component for elevated surfaces
 */
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

      // If directory is provided, use it; otherwise open file picker
      const selectedDirectory = directory || (await selectDirectory());

      if (selectedDirectory) {
        // Scan directory and navigate to albums view
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)]">
      <Card
        variant="custom-glass"
        padding="p-8 md:p-12"
        shadow="l3"
        rounded="xl"
        className="max-w-3xl w-full space-y-10 animate-scale-in"
      >
        {/* Welcome message with compelling headline */}
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Camera className="w-8 h-8 text-[var(--color-primary)]" />
              <Sparkles className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] leading-tight">
              Relive Your Memories
              <br />
              <span className="text-[var(--color-primary)]">On The Map</span>
            </h1>
          </div>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Transform your photo collection into a journey. Browse beautiful iOS-style galleries
            and discover exactly where each moment was captured—all on an interactive map.
          </p>
        </div>

        {/* Enhanced feature highlights with better descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            variant="custom-glass"
            padding="p-5"
            shadow="l1"
            rounded="md"
            className="text-center space-y-3 hover:shadow-l2 hover:-translate-y-1 transition-all duration-200"
          >
            <div className="flex justify-center">
              <div className="p-3 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
                <Camera className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">iOS Photos Experience</h3>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
              Beautiful, intuitive galleries that let you focus on your photos
            </p>
          </Card>
          <Card
            variant="custom-glass"
            padding="p-5"
            shadow="l1"
            rounded="md"
            className="text-center space-y-3 hover:shadow-l2 hover:-translate-y-1 transition-all duration-200"
          >
            <div className="flex justify-center">
              <div className="p-3 rounded-lg bg-[#1EC8E6]/10 border border-[#1EC8E6]/20">
                <Globe className="w-6 h-6 text-[#1EC8E6]" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Explore Your Journey</h3>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
              See where every photo was taken on an interactive world map
            </p>
          </Card>
          <Card
            variant="custom-glass"
            padding="p-5"
            shadow="l1"
            rounded="md"
            className="text-center space-y-3 hover:shadow-l2 hover:-translate-y-1 transition-all duration-200"
          >
            <div className="flex justify-center">
              <div className="p-3 rounded-lg bg-[#1EC8E6]/10 border border-[#1EC8E6]/20">
                <Shield className="w-6 h-6 text-[#1EC8E6]" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">100% Private & Local</h3>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
              Your photos never leave your device. No cloud, no subscriptions
            </p>
          </Card>
        </div>

        {/* Value proposition for travelers and photographers */}
        <div className="bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-lg p-6 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Perfect for Travelers & Photographers</h3>
              <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                Automatically extract location data from your photos and visualize your travel routes,
                vacation spots, and favorite places on a beautiful map. No manual tagging required.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Directories */}
        <RecentDirectories
          onSelectDirectory={handleSelectDirectory}
          currentDirectory={currentDirectory}
        />

        {/* Primary CTA with enhanced messaging */}
        <div className="flex flex-col items-center space-y-4 pt-2">
          <Button
            onClick={() => handleSelectDirectory()}
            variant="primary"
            size="lg"
            disabled={isSelecting}
            className="w-full md:w-auto min-w-[200px] text-base font-semibold"
          >
            {isSelecting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Selecting...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>Start Exploring Your Photos</span>
              </span>
            )}
          </Button>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--text-tertiary)]">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>100% Private</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[var(--color-primary)]">✓</span>
              <span>Free Forever</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Cross-Platform</span>
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WelcomeScreen;
