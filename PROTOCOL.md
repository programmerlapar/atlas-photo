PhotoMap — Build Protocol
===========================

Last Updated: 2026-07-15
Status: Active
Goal: Polish MVP into a snappy, daily-useable PhotoMap app.

## ?? Project Goal
Electron desktop photo gallery app modeled after iOS Photos for Windows. 
Core loop: user selects a folder ? sees polished grid ? opens photos in detail ? maps show where they were taken (GPS).
Everything feels responsive and bright like the real Apple Photos feel.

---

## ?? Codebase Snapshot (pre-existing)

| Component | Status | Notes |
|-----------|--------|-------|
| Directory Picker / Recent Dirs | ? Done | Works as expected |
| App runs, can browse photos | ? Running | Has albums set up |
| EXIF extractor (exifExtractor.ts) | ? Built | But no persistent cache yet |
| ImageCacheService (IPC/cache/) | ?? Stubbed | Cache exists but not persisted across sessions |
| ThumbCache (renderer) | ?? Stubbed | Needs to be wired up for real caching |
| File watcher (ileWatcher.ts) | ? Built | Real-time fs.watch updates present |
| Map with pins | ?? Partially working | Pin image sometimes fails |
| Gallery grid + Detail view | ?? Needs polish | iOS feel not quite there yet |
| Filtering / Grouping logic | ? Unclear | Exists in stores but unsure if wired |
| Dark mode toggle | ? Built (themeStore) | Brightness/density needs tune-up |
| Batch operations bar | ? Built | Works as expected |

---

## ??? Work Buckets

### Bucket 1 — Persistent Index + Cache Layer (Foundation)
- **Goal**: EXIF reads and thumbnail generation happen once per session, not every revisit. Re-opened directories load instantly from an index.
- **Files touched**: src/main/services/directoryScanner.ts, src/main/services/exifExtractor.ts, src/main/ipc/cache/ImageCacheService.ts (and its 	ypes.ts), src/renderer/cache/thumbCache.ts. Renderer side: enderer/services/api.ts, the hooks (usePhotos.ts, useKeyboard.ts) so they check cache before re-scanning, and photoStore.ts.
- **Acceptance**: Scanning a 5k-photo folder takes seconds, not minutes. Re-opening same directory loads straight from index — no full rescan on revisit. Thumbnails show as cached, EXIF doesn't re-run per photo on reload.

### Bucket 2 — Map Reliability
- **Goal**: Every map pin consistently displays its thumbnail; nothing flickers or crashes when panning/zooming.
- **Files touched**: enderer/views/MapView.tsx, enderer/components/map/PhotoMarker.tsx (the broken piece), and error-handling in image loading + retry logic for lazy-loaded thumbnails.
- **Acceptance**: Map pins always render a visible thumbnail — no blank/crashing markers when hovering or clicking.

### Bucket 3 — Gallery & Detail View Polish (iOS feel)
- **Goal**: Snappier gallery with smooth transitions welcome ? grid ? detail, plus batch operations feeling natural and responsive.
- **Files touched**: enderer/views/GalleryView.tsx, DetailView.tsx, PhotoCard.tsx, BatchOperationsBar.tsx, WelcomeScreen.tsx.

### Bucket 4 — Filtering & Grouping Verification
- **Goal**: Confirm filtering/grouping is actually wired end-to-end; implement date range + location grouping if missing.
- **Files touched**: enderer/components/filters/FilterPanel.tsx, enderer/stores/filterStore.ts, potentially a new smart-albums store in stores/.

### Bucket 5 — Final Visual / Responsive Polish
- **Goal**: Brighten dark mode, densify gallery UI to match iOS feel, responsive grid polish, final smooth animations everywhere.
- **Files touched**: enderer/styles/globals.css + 	ailwind.config.ts, theme-related styling tweaks in any component.

---

## ?? How We Proceed
1. I present Bucket 1 plan ? user approves checkpoint ? we build it
2. After Bucket 1 complete, re-checkpoint before moving to Bucket 2
3. Repeat for Buckets 3, 4, 5 — each gets its own approval gate before starting
4. Key decisions get logged in PROTOCOL.md as they're confirmed so nothing drifts

---
**Notes:** PRD.md is the detailed product requirement doc at src/PRD.md. PROJECT_INDEX.md holds a higher-level summary. This PROTOCOL.md tracks our active build plan and decisions for this session.
