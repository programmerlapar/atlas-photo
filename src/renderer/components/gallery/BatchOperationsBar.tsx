import { Share2, Download, Trash2, X } from 'lucide-react';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import type { Photo } from '../../../shared/types/photo';

export interface BatchOperationsBarProps {
  selectedPhotos: Photo[];
  onShare: () => void;
  onExport: () => void;
  onDelete: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

/**
 * Batch operations toolbar component
 * Displays when photos are selected in selection mode
 */
const BatchOperationsBar = ({
  selectedPhotos,
  onShare,
  onExport,
  onDelete,
  onCancel,
  isProcessing = false,
}: BatchOperationsBarProps) => {
  const count = selectedPhotos.length;

  return (
    <div className="glass-surface-2 border-t border-white/10 sticky bottom-0 z-20">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left section - Selection count */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--text-primary)] font-medium">
            {count} {count === 1 ? 'photo' : 'photos'} selected
          </span>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          <Tooltip content="Share selected photos" position="top">
            <Button
              onClick={onShare}
              variant="secondary"
              size="sm"
              disabled={isProcessing || count === 0}
              className="transition-smooth hover-lift"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </Tooltip>
          <Tooltip content="Export selected photos to folder" position="top">
            <Button
              onClick={onExport}
              variant="secondary"
              size="sm"
              disabled={isProcessing || count === 0}
              className="transition-smooth hover-lift"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </Tooltip>
          <Tooltip content="Delete selected photos (permanent)" position="top">
            <Button
              onClick={onDelete}
              variant="secondary"
              size="sm"
              disabled={isProcessing || count === 0}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-smooth"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </Tooltip>
          <Tooltip content="Cancel selection (ESC)" position="top">
            <Button
              onClick={onCancel}
              variant="secondary"
              size="sm"
              disabled={isProcessing}
              className="transition-smooth hover-lift"
            >
              <X className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default BatchOperationsBar;
