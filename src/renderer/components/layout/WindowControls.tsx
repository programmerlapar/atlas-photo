import { Maximize2, Minus, X } from 'lucide-react';

/** Renderer-owned traffic controls for the frameless desktop window. */
const WindowControls = () => {
  const controlWindow = (action: 'minimize' | 'maximize' | 'close') => {
    void window.electronAPI?.windowControl(action);
  };

  return (
    <div className="window-no-drag flex items-center gap-1 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg-2)] p-1 shadow-l1 backdrop-blur-xl">
      <button onClick={() => controlWindow('minimize')} className="desktop-window-control" aria-label="Minimize window" title="Minimize">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => controlWindow('maximize')} className="desktop-window-control" aria-label="Maximize window" title="Maximize">
        <Maximize2 className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => controlWindow('close')} className="desktop-window-control desktop-window-control-close" aria-label="Close window" title="Close">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default WindowControls;
