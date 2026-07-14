import { app, BrowserWindow } from 'electron';
import { createMainWindow } from './windows/mainWindow';
import { setupIpcHandlers } from './ipc/handlers';
import { registerCustomProtocol } from './utils/protocol';

// Configure cache paths and command line switches before app is ready
// This must be called before app.whenReady()
if (process.platform === 'win32') {
  try {
    // Set cache directory to user data directory to avoid permission issues
    const userDataPath = app.getPath('userData');
    app.setPath('userCache', userDataPath);
    app.setPath('sessionData', userDataPath);
  } catch (error) {
    // Silently ignore if paths can't be set (non-critical)
    console.warn('Could not set Electron cache paths:', error);
  }

  // Suppress cache-related errors by disabling problematic cache features
  // These are non-critical warnings that don't affect app functionality
  app.commandLine.appendSwitch('disable-gpu-disk-cache');
  app.commandLine.appendSwitch('disable-software-rasterizer');
}

// Note: Some cache permission errors may still appear in console but are non-critical.
// They occur when Electron tries to create cache directories but don't affect app functionality.

// Setup IPC handlers
setupIpcHandlers();

// Handle app lifecycle
app.whenReady().then(() => {
  // Register custom protocol for serving thumbnails and photos
  // This must be done before creating the window to ensure protocol is available
  // Protocol registration must be synchronous - it cannot be async
  try {
    registerCustomProtocol();
  } catch (error) {
    console.error('Failed to register custom protocol:', error);
    // Continue anyway - protocol might still work
  }

  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
