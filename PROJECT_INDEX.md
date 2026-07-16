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

- `src/main/services/photoIndex.ts` is the persistent directory index. It stores processed photos and restores Date metadata after JSON reads.
- `src/main/ipc/handlers.ts` uses the index before a cold process, keeps it current from watcher/thumbnail/delete operations, and avoids full Album-screen scans for unindexed recent directories.
- `ImageCacheService` deduplicates thumbnail requests and limits generation concurrency; `thumbCache.ts` caches thumbnail paths in the renderer.
- `photoProcessor.ts` parses cold-import EXIF in an eight-worker pool. `usePhotos.ts` batches thumbnail updates so large galleries do not rerender once per image.
- `PhotoGrid` mounts an initial screenful and adds more cards only as the user nears the end; `PhotoCard` uses a stable thumbnail surface. `DetailView` opens from its thumbnail before the original is ready.
- Targeted lint passes. Pending acceptance validation: measure cold and warm behavior with a 5,000-photo library.

## Bucket 2 Implementation â€” 2026-07-16

- `MapView` no longer uses a lazy-route fallback or artificial loader delay. It uses CartoDB Voyager, a light geographic surface, a compact ready-state overlay, and background thumbnail warming that never blocks map interaction.
- `PhotoMarker` and `MapPopup` have reliable thumbnail fallbacks. Nearby photos cluster by screen distance, select the newest representative, retain a count badge, and split/merge with short marker fades during zoom.
- CSP no longer includes the invalid Stamen wildcard. `skills/photomap-motion/SKILL.md` is the project-local standard for zoom-and-fade navigation motion and reduced-motion behavior.
- Targeted map lint passes. Pending acceptance validation: exercise map entry, repeat entry, zoom split/merge, and marker-to-detail navigation with the user's large library.

**Follow-up:** `@luomus/leaflet-smooth-wheel-zoom` provides continuous cursor-anchored wheel zoom. Marker transitions are opacity-only, and the stock Leaflet attribution was replaced with a compact required OpenStreetMap/CARTO credit pill.

**Cluster interaction:** Selecting a multi-photo map marker opens `PhotoClusterSheet`, a bottom-sheet browser for all photos represented by that marker. A selected photo records Map as its return context, so Detail Close returns to Map instead of Gallery.

**Bucket 2 status:** Wrapped on 2026-07-16. Targeted map lint passes; perform one final interactive check with the user's large library before release.
