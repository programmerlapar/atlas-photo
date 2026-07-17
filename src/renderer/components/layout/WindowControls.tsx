import { Maximize2, Minus, X } from 'lucide-react';

/** Renderer-owned traffic controls for the frameless desktop window. */
const WindowControls = () => {
  const controlWindow = (action: 'minimize' | 'maximize' | 'close') => {
    void window.electronAPI?.windowControl(action);
  };

  return (
    <div className="window-no-drag photos-toolbar-group desktop-caption-control-group">
      <button onClick={() => controlWindow('minimize')} className="desktop-window-control" aria-label="Minimize window" title="Minimize">
        <Minus className="h-5 w-5" />
      </button>
      <span className="photos-group-divider" aria-hidden="true" />
      <button onClick={() => controlWindow('maximize')} className="desktop-window-control" aria-label="Maximize window" title="Maximize">
        <Maximize2 className="h-5 w-5" />
      </button>
      <span className="photos-group-divider" aria-hidden="true" />
      <button onClick={() => controlWindow('close')} className="desktop-window-control desktop-window-control-close" aria-label="Close window" title="Close">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default WindowControls;
