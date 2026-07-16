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

## Bucket 1 Implementation — 2026-07-16

- Persistent `PhotoIndex` restores processed directory contents without repeat EXIF work; IPC, file-watcher, thumbnail, and deletion paths synchronize it.
- Cold EXIF parsing uses a bounded worker pool. Thumbnail generation is deduplicated, concurrency-limited, and cached in both main and renderer flows.
- Albums avoid recursive background scans for unindexed recents. Large galleries demand-load card batches near the scroll boundary, and detail opens from a thumbnail preview before the original image is ready.
- Pending acceptance validation: measure cold and warm behavior with a 5,000-photo library.

## Bucket 2 Implementation â€” 2026-07-16

- Map entry no longer depends on the old `Suspense` spinner or a simulated delay. It uses CartoDB Voyager, a geographic loading surface, and non-blocking thumbnail warming.
- Marker and popup thumbnails now have visible fallbacks. Nearby photos are grouped in screen space, represent the newest photo in a group, and split/merge with short opacity/transform motion as zoom changes.
- The invalid Stamen CSP wildcard was removed. `skills/photomap-motion/SKILL.md` records the mandatory zoom-and-fade view transition rule, including reduced-motion support.
- Pending manual validation: map entry/re-entry with a large library, marker split/merge while zooming, and marker-to-detail navigation.

**Follow-up:** The map uses `@luomus/leaflet-smooth-wheel-zoom` for continuous cursor-anchored wheel zoom. Marker transitions are opacity-only; a compact OpenStreetMap/CARTO credit replaces the stock Leaflet attribution control.

**Cluster interaction:** Multi-photo markers open `PhotoClusterSheet`, which shows the full nearby photo group newest-first. Detail Close returns to Map for a photo selected from this sheet.

**Bucket 2 status:** Wrapped on 2026-07-16. Targeted map lint passes; one final interactive check with the user's large library remains before release.
