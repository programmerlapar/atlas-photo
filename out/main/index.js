'use strict';
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === 'object') || typeof from === 'function') {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, 'default', { value: mod, enumerable: true })
      : target,
    mod
  )
);
const electron = require('electron');
const path = require('path');
const promises = require('fs/promises');
const exifr = require('exifr');
const sharp = require('sharp');
const fs = require('fs');
const createMainWindow = () => {
  const mainWindow = new electron.BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    backgroundColor: '#0A2A4A',
    // Midnight Blue
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
  });
  {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  }
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    {
      mainWindow.webContents.openDevTools();
    }
  });
  return mainWindow;
};
const PHOTO_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.bmp',
  '.webp',
  '.heic',
  '.heif',
  '.tiff',
  '.tif',
  '.raw',
  '.cr2',
  '.nef',
  '.arw',
  '.dng',
];
const isPhotoFile = (filename) => {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return PHOTO_EXTENSIONS.includes(ext);
};
const scanDirectory = async (directoryPath, onProgress) => {
  const photos = [];
  let totalFiles = 0;
  let processedFiles = 0;
  const scanRecursive = async (dirPath) => {
    try {
      const entries = await promises.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          await scanRecursive(fullPath);
        } else if (entry.isFile() && isPhotoFile(entry.name)) {
          totalFiles++;
          const stats = await promises.stat(fullPath);
          const photo = {
            id: `${fullPath}-${stats.mtimeMs}`,
            // Unique ID based on path and modification time
            path: fullPath,
            filename: entry.name,
          };
          photos.push(photo);
          processedFiles++;
          if (onProgress) {
            onProgress({
              current: processedFiles,
              total: totalFiles,
              path: fullPath,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
    }
  };
  await scanRecursive(directoryPath);
  return photos;
};
const extractPhotoMetadata = async (photoPath) => {
  try {
    const exifData = await exifr.parse(photoPath, {
      // Extract GPS coordinates
      gps: true,
      // Extract camera information
      exif: true,
      // Extract date/time
      ifd0: true,
      // Extract all available data
      translateKeys: false,
      translateValues: false,
    });
    if (!exifData) {
      return null;
    }
    const metadata = {};
    if (exifData.latitude && exifData.longitude) {
      const location = {
        latitude: exifData.latitude,
        longitude: exifData.longitude,
      };
      if (exifData.GPSAltitude) {
        location.altitude = exifData.GPSAltitude;
      }
      metadata.location = location;
    }
    if (exifData.DateTimeOriginal || exifData.DateTime || exifData.CreateDate) {
      const dateString =
        exifData.DateTimeOriginal || exifData.DateTime || exifData.CreateDate;
      if (dateString) {
        metadata.date = new Date(dateString);
      }
    }
    if (exifData.Make || exifData.Model) {
      const camera = {};
      if (exifData.Make) {
        camera.make = String(exifData.Make);
      }
      if (exifData.Model) {
        camera.model = String(exifData.Model);
      }
      if (exifData.ISO) {
        camera.iso = Number(exifData.ISO);
      }
      if (exifData.FNumber) {
        camera.aperture = `f/${exifData.FNumber}`;
      }
      if (exifData.ExposureTime) {
        camera.shutterSpeed = `${exifData.ExposureTime}s`;
      }
      if (exifData.FocalLength) {
        camera.focalLength = `${exifData.FocalLength}mm`;
      }
      if (Object.keys(camera).length > 0) {
        metadata.camera = camera;
      }
    }
    metadata.exif = exifData;
    return metadata;
  } catch (error) {
    console.error(`Error extracting metadata from ${photoPath}:`, error);
    return null;
  }
};
const generateThumbnail = async (photoPath, size = 300) => {
  try {
    const cacheDir = path.join(electron.app.getPath('userData'), 'thumbnails');
    if (!fs.existsSync(cacheDir)) {
      await promises.mkdir(cacheDir, { recursive: true });
    }
    const pathHash = Buffer.from(photoPath)
      .toString('base64')
      .replace(/[/+=]/g, '_');
    const thumbnailPath = path.join(cacheDir, `${pathHash}_${size}.jpg`);
    if (fs.existsSync(thumbnailPath)) {
      const thumbnailStats = await promises.stat(thumbnailPath);
      const photoStats = await promises.stat(photoPath);
      if (thumbnailStats.mtimeMs >= photoStats.mtimeMs) {
        return thumbnailPath;
      }
    }
    await sharp(photoPath)
      .resize(size, size, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toFile(thumbnailPath);
    return thumbnailPath;
  } catch (error) {
    console.error(`Error generating thumbnail for ${photoPath}:`, error);
    return null;
  }
};
const processPhotos = async (directoryPath, onProgress) => {
  if (onProgress) {
    onProgress({ stage: 'scanning', current: 0, total: 0 });
  }
  const photos = await scanDirectory(directoryPath, (progress) => {
    if (onProgress) {
      onProgress({
        stage: 'scanning',
        current: progress.current,
        total: progress.total,
        path: progress.path,
      });
    }
  });
  if (onProgress) {
    onProgress({ stage: 'metadata', current: 0, total: photos.length });
  }
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const metadata = await extractPhotoMetadata(photo.path);
    if (metadata) {
      photo.metadata = metadata;
    }
    if (onProgress) {
      onProgress({
        stage: 'metadata',
        current: i + 1,
        total: photos.length,
        path: photo.path,
      });
    }
  }
  if (onProgress) {
    onProgress({ stage: 'thumbnails', current: 0, total: photos.length });
  }
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const thumbnailPath = await generateThumbnail(photo.path);
    if (thumbnailPath) {
      photo.thumbnailPath = thumbnailPath;
    }
    if (onProgress) {
      onProgress({
        stage: 'thumbnails',
        current: i + 1,
        total: photos.length,
        path: photo.path,
      });
    }
  }
  return photos;
};
class FileWatcher {
  watcher = null;
  watchedPath = null;
  onPhotoAdded;
  onPhotoRemoved;
  /**
   * Starts watching a directory for changes
   * @param directoryPath - Path to watch
   * @param onPhotoAdded - Callback when a new photo is detected
   * @param onPhotoRemoved - Callback when a photo is removed
   */
  startWatching(directoryPath, onPhotoAdded, onPhotoRemoved) {
    this.stopWatching();
    this.watchedPath = directoryPath;
    this.onPhotoAdded = onPhotoAdded;
    this.onPhotoRemoved = onPhotoRemoved;
    this.watcher = fs.watch(
      directoryPath,
      { recursive: true },
      async (eventType, filename) => {
        if (!filename) return;
        const fullPath = path.join(directoryPath, filename);
        if (eventType === 'rename') {
          try {
            const stats = await promises.stat(fullPath);
            if (stats.isFile() && isPhotoFile(filename)) {
              const photo = {
                id: `${fullPath}-${stats.mtimeMs}`,
                path: fullPath,
                filename,
              };
              if (this.onPhotoAdded) {
                this.onPhotoAdded(photo);
              }
            }
          } catch {
            if (this.onPhotoRemoved) {
              this.onPhotoRemoved(fullPath);
            }
          }
        }
      }
    );
  }
  /**
   * Stops watching the directory
   */
  stopWatching() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    this.watchedPath = null;
    this.onPhotoAdded = void 0;
    this.onPhotoRemoved = void 0;
  }
  /**
   * Checks if currently watching a directory
   */
  isWatching() {
    return this.watcher !== null;
  }
  /**
   * Gets the currently watched path
   */
  getWatchedPath() {
    return this.watchedPath;
  }
}
const scriptRel = (function detectScriptRel() {
  const relList =
    typeof document !== 'undefined' && document.createElement('link').relList;
  return relList && relList.supports && relList.supports('modulepreload')
    ? 'modulepreload'
    : 'preload';
})();
const assetsURL = function (dep) {
  return '/' + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (false) {
    document.getElementsByTagName('link');
    const cspNonceMeta = document.querySelector('meta[property=csp-nonce]');
    const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute('nonce');
    promise = Promise.allSettled(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith('.css');
        const cssSelector = isCss ? '[rel="stylesheet"]' : '';
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement('link');
        link.rel = isCss ? 'stylesheet' : scriptRel;
        if (!isCss) {
          link.as = 'script';
        }
        link.crossOrigin = '';
        link.href = dep;
        if (cspNonce) {
          link.setAttribute('nonce', cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener('load', res);
            link.addEventListener('error', () =>
              rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event('vite:preloadError', {
      cancelable: true,
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== 'rejected') continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
class Storage {
  storageDir;
  constructor() {
    this.storageDir = path.join(electron.app.getPath('userData'), 'storage');
    if (!fs.existsSync(this.storageDir)) {
      promises.mkdir(this.storageDir, { recursive: true }).catch(console.error);
    }
  }
  /**
   * Gets a value from storage
   */
  async get(key) {
    try {
      const filePath = path.join(this.storageDir, `${key}.json`);
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const data = await promises.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading storage key ${key}:`, error);
      return null;
    }
  }
  /**
   * Sets a value in storage
   */
  async set(key, value) {
    try {
      const filePath = path.join(this.storageDir, `${key}.json`);
      await promises.writeFile(
        filePath,
        JSON.stringify(value, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error(`Error writing storage key ${key}:`, error);
    }
  }
  /**
   * Removes a value from storage
   */
  async remove(key) {
    try {
      const filePath = path.join(this.storageDir, `${key}.json`);
      if (fs.existsSync(filePath)) {
        const { unlink } = await __vitePreload(
          async () => {
            const { unlink: unlink2 } = await import('fs/promises');
            return { unlink: unlink2 };
          },
          false ? __VITE_PRELOAD__ : void 0
        );
        await unlink(filePath);
      }
    } catch (error) {
      console.error(`Error removing storage key ${key}:`, error);
    }
  }
  /**
   * Clears all storage
   */
  async clear() {
    try {
      const { readdir, unlink } = await __vitePreload(
        async () => {
          const { readdir: readdir2, unlink: unlink2 } = await import(
            'fs/promises'
          );
          return { readdir: readdir2, unlink: unlink2 };
        },
        false ? __VITE_PRELOAD__ : void 0
      );
      const files = await readdir(this.storageDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          await unlink(path.join(this.storageDir, file));
        }
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}
let currentPhotos = [];
let currentDirectory = null;
const fileWatcher = new FileWatcher();
const storage = new Storage();
(async () => {
  const lastDirectory = await storage.get('lastDirectory');
  if (lastDirectory) {
    currentDirectory = lastDirectory;
  }
})();
const sendProgress = (progress) => {
  const windows = electron.BrowserWindow.getAllWindows();
  windows.forEach((window2) => {
    window2.webContents.send('directory-scan-progress', progress);
  });
};
const setupIpcHandlers = () => {
  electron.ipcMain.handle('select-directory', async () => {
    const result = await electron.dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select Photo Directory',
    });
    if (result.canceled) {
      return null;
    }
    return result.filePaths[0];
  });
  electron.ipcMain.handle('scan-directory', async (_event, path2) => {
    try {
      currentDirectory = path2;
      await storage.set('lastDirectory', path2);
      fileWatcher.startWatching(
        path2,
        async (photo) => {
          const metadata = await extractPhotoMetadata(photo.path);
          if (metadata) {
            photo.metadata = metadata;
          }
          const thumbnailPath = await generateThumbnail(photo.path);
          if (thumbnailPath) {
            photo.thumbnailPath = thumbnailPath;
          }
          currentPhotos.push(photo);
          const windows = electron.BrowserWindow.getAllWindows();
          windows.forEach((window2) => {
            window2.webContents.send('photo-added', photo);
          });
        },
        (photoPath) => {
          currentPhotos = currentPhotos.filter((p) => p.path !== photoPath);
          const windows = electron.BrowserWindow.getAllWindows();
          windows.forEach((window2) => {
            window2.webContents.send('photo-removed', photoPath);
          });
        }
      );
      const photos = await processPhotos(path2, sendProgress);
      currentPhotos = photos;
      return { photos, error: null };
    } catch (error) {
      console.error('Error scanning directory:', error);
      return {
        photos: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });
  electron.ipcMain.handle('get-photos', async () => {
    return currentPhotos;
  });
  electron.ipcMain.handle('get-photo-metadata', async (_event, path2) => {
    try {
      const metadata = await extractPhotoMetadata(path2);
      return metadata;
    } catch (error) {
      console.error('Error getting photo metadata:', error);
      return null;
    }
  });
  electron.ipcMain.handle('generate-thumbnail', async (_event, path2) => {
    try {
      const thumbnailPath = await generateThumbnail(path2);
      return thumbnailPath;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  });
  electron.ipcMain.handle('get-current-directory', async () => {
    if (!currentDirectory) {
      const lastDirectory = await storage.get('lastDirectory');
      if (lastDirectory) {
        currentDirectory = lastDirectory;
      }
    }
    return currentDirectory;
  });
  electron.ipcMain.handle('stop-file-watcher', async () => {
    fileWatcher.stopWatching();
    return true;
  });
};
setupIpcHandlers();
electron.app.whenReady().then(() => {
  createMainWindow();
  electron.app.on('activate', () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});
electron.app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    electron.app.quit();
  }
});
