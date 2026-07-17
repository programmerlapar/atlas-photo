import { Share2, Download, Trash2, X, Loader2 } from 'lucide-react';
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
    <div className="fixed inset-x-4 bottom-5 z-40 flex justify-center pointer-events-none">
      <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg-3)] px-3 py-2 shadow-l3 backdrop-blur-2xl animate-scale-in">
        <div className="flex h-9 items-center rounded-xl bg-[var(--glass-bg-1)] px-3 text-sm font-semibold text-[var(--text-primary)]">
          {isProcessing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" aria-hidden="true" />
          ) : null}
          {isProcessing
            ? 'Working...'
            : `${count} ${count === 1 ? 'photo' : 'photos'} selected`}
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content="Share selected photos" position="top">
            <Button
              onClick={onShare}
              variant="secondary"
              size="sm"
              disabled={isProcessing || count === 0}
              className="transition-smooth"
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
              className="transition-smooth"
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
              className="transition-smooth"
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
