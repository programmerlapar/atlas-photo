import { BrowserWindow, app } from 'electron';
import { join } from 'path';

const isDev = !app.isPackaged;

/**
 * Creates and configures the main application window
 */
export const createMainWindow = (): BrowserWindow => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    icon: join(__dirname, '../../public/icons/logo.png'),
    backgroundColor: '#FFFFFF',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
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
     mainWindow.loadFile(join(__dirname, '../../dist-electron/renderer/index.html'));
   }

  // Set Content-Security-Policy for security
  // In development mode, we need 'unsafe-eval' and 'unsafe-inline' for Vite HMR,
  // which triggers an Electron security warning that is expected and safe in dev.
  // Packaged builds use a stricter policy without those directives.
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
    : "script-src 'self'; ";
  const csp =
    "default-src 'self'; " +
    scriptSrc +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: atlas-photo: file: https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org; " +
    "font-src 'self' data:; " +
    "connect-src 'self' http://localhost:* ws://localhost:* ws://127.0.0.1:* https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org;";

  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [csp],
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
  mainWindow.setTitle('Atlas Photo');
    mainWindow.show();

    if (isDev) {
      mainWindow.webContents.openDevTools();
    }

  return mainWindow;
};
