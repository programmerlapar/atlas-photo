# PhotoMap Project Index — Master Reference Document

**This project is an Electron desktop photo gallery application modeled after Apple Photos (macOS/iOS native feel) adapted for Windows Desktop.** Uses EXIF/HPF extraction to pull camera info, dates, and GPS coordinates from media files. Displays photos in masonry/grid layout via react-leaflet maps as secondary navigation alongside photo browsing. Supports RAW/HEIC via exifr heic-convert sharp, batch operations (add/remove photos), metadata display via usePhotos hook.

## Tech Stack
| Runtime | Framework/Library |
|---------|-------------------|
| Electron 30 | Desktop runtime (renderer + main process communication via ipcMain/preload) |
| Vite 4.5.2 & React 18.3 | Dev server sibling to Renderer; HMR support for fast iteration |
| TailwindCSS v4 (beta) | Utility-first CSS styling (--color-primary, --bg-default-white etc.) |
| Zustand 4.5 | State management in renderer (stores/hooks/usePhotos useKeyboard hooks) |

## Key Files & Status (Fully Reviewed ✅ Across This Conversation)

### Main Process ✅ Fully Explored + Preload  
- `src/main/index.ts`: Entry point — main process setup with preload, window create etc.
- `src/main/preload.ts`: IPC bridge for renderer API surface (scanDirectory/addPhoto/removePhoto/directoryChange/deleteDirectory/listDirectories/enablePreview)

### Renderer Views & Components ✅ All Reviewed
**Views:** GalleryView (photo gallery with batch op bar / photo-grid masonry layout), WelcomeScreen (directory picker entry point on import), MapView (Leaflet map + usePhotos hook integration for gallery browsing), SettingsView (preferences + theme toggle), Detail view, MetadataPanel (metadata display)

**Components reviewed:** PhotoCard/Grid, BatchOperationsBar/PhotoBatchOperationRow/AddRemoveGroup/thumbnailImageContainer etc.  
**Hooks reviewed:** usePhotos / useKeyboard hooks for EXIF extraction + photoId encoding with file-size check optimization in utils  

### Stores ✅ Fully Reviewed
- `preferencesStore` — user preferences including smartAlbums (deferred), darkMode, albumGridSize
- `filterStore` — filter/groupBy/sortOrder/state management (default filters: name asc/desc by date default)
- `themeStore` — dark + cyan theme variants (including system)

### Performance Features ✅ Already Implemented  
Thumbnail generator with sharp cache integrated for HEIC/EXR/etc. fallback chain, file watcher in main process for real-time fs.watch updates, lazy/suspense loading pattern. All source code explored and confirmed. Sections up through Background Design Proposal ✅ captured from previous turns where user returned context — full source structure already in place!

## What Was Already Reviewed (This Session)  
✅ Main process + preload fully reviewed ✅ (Section 7+ onwards done)
- ThumbnailGenerator with sharp cache for thumbnails ✅ 
- CacheManager, ExifExtractor (GPS/camera/date extraction via heic-convert fallback), directoryScanner/fileWatcher real-time events  
✅ All existing source scaffold explored including: renderer views/components/stores/hooks/utils/services — same structure as previous sessions where Sections were fully captured

**Note:** Project index also now persisted at `/PROJECT_ROOT/.cursor/rules/metadata.json` for next AI session pick-up.