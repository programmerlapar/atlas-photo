import { BrowserWindow } from 'electron';
import { join } from 'path';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Creates and configures the main application window
 */
export const createMainWindow = (): BrowserWindow => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    backgroundColor: '#FFFFFF',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Disable sandbox to allow custom protocol access
      // Disable cache to prevent permission errors on Windows
      cache: false,
      // Use session cache instead of disk cache
      partition: 'persist:main',
      // Allow custom protocols to work
      webSecurity: true, // Keep web security enabled for security
    },
    // The renderer owns the title area so the same liquid-glass chrome works
    // consistently on macOS and Windows.
    frame: false,
    titleBarStyle: 'hidden',
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../../renderer/index.html'));
  }

  // Set Content-Security-Policy for security
  // Note: In development mode, we need 'unsafe-eval' for Vite HMR, which will trigger
  // Electron's security warning. This is expected and safe in development.
  // The warning will not appear in packaged builds.
  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: photomap: file: https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org; " +
              "font-src 'self' data:; " +
              "connect-src 'self' http://localhost:* ws://localhost:* ws://127.0.0.1:* https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org;",
          ],
        },
      });
    }
  );

  // Suppress CSP warning in development mode (it's expected due to Vite HMR requiring 'unsafe-eval')
  // This warning is informational and doesn't affect functionality
  // The warning will not appear in packaged builds
  if (isDev) {
    // Override console methods to filter CSP warnings after page loads
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents
        .executeJavaScript(
          `
        (function() {
          const originalWarn = console.warn;
          console.warn = function(...args) {
            const message = args.join(' ');
            if (message.includes('Content Security Policy') || 
                message.includes('Insecure Content-Security-Policy')) {
              // Suppress CSP warnings in dev mode - they're expected
              return;
            }
            originalWarn.apply(console, args);
          };
        })();
      `
        )
        .catch(() => {
          // Ignore if script execution fails
        });
    });
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  return mainWindow;
};
