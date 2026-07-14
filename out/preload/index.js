'use strict';
const electron = require('electron');
electron.contextBridge.exposeInMainWorld('electronAPI', {
  // Directory operations
  selectDirectory: () => electron.ipcRenderer.invoke('select-directory'),
  scanDirectory: (path) => electron.ipcRenderer.invoke('scan-directory', path),
  // Photo operations
  getPhotos: () => electron.ipcRenderer.invoke('get-photos'),
  getPhotoMetadata: (path) =>
    electron.ipcRenderer.invoke('get-photo-metadata', path),
  // Thumbnail operations
  generateThumbnail: (path) =>
    electron.ipcRenderer.invoke('generate-thumbnail', path),
  // Directory state
  getCurrentDirectory: () =>
    electron.ipcRenderer.invoke('get-current-directory'),
  // File watcher
  stopFileWatcher: () => electron.ipcRenderer.invoke('stop-file-watcher'),
  // Event listeners
  onDirectoryScanProgress: (callback) => {
    electron.ipcRenderer.on('directory-scan-progress', (_event, progress) =>
      callback(progress)
    );
  },
  onPhotoAdded: (callback) => {
    electron.ipcRenderer.on('photo-added', (_event, photo) => callback(photo));
  },
  onPhotoRemoved: (callback) => {
    electron.ipcRenderer.on('photo-removed', (_event, photoPath) =>
      callback(photoPath)
    );
  },
  removeAllListeners: (channel) => {
    electron.ipcRenderer.removeAllListeners(channel);
  },
});
