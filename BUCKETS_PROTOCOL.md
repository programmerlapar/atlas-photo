# Photomap — Buckets Protocol (v1)

**Original intent:** polished MVP photo gallery (Electron + Leaflet) with snappy performance, iOS-like feel.

## Bucket 1 — Persistent Index & Cache Layer
Goal: EXIF reads and thumbnail generation happen once per session, not every revisit. Reopening same directory loads from index without full scan.
Touching files: storage.ts (main), PhotoIndex store / photoStore (renderer), IPC handlers, cache layer updates (thumbCache.ts renderer side)
Acceptance: scanning 5k photos takes seconds not minutes; reopen same dir loads instantly

## Bucket 2 — Map Reliability  
Goal: map pins always display thumbnail; no flickering/crashing on hover or click
Touching files: ViewMap.tsx, PhotoMarker.tsx (renderer/components/map), error handling in image loading path, retry + fallback logic for pin images
Acceptance: all pins render consistently

## Bucket 3 — Gallery & Detail Polish  
Goal: snappier gallery transitions welcome -> grid -> detail, batch ops polished, iOS-like feel
Touching files: GalleryView.tsx (renderer/views), DetailView.tsx (renderer/views), PhotoCard.tsx, BatchOperationsBar.tsx, WelcomeScreen.tsx

## Bucket 4 — Filtering & Grouping Verification  
Goal: verify existing filter/group works; implement date range + location grouping if missing
Touching files: FilterPanel.tsx (renderer/components/filters), filterStore.ts (renderer/stores), possibly new photoGroupStore
Acceptance: filters apply live, smart albums appear for date/location

## Bucket 5 — Visual & Responsive Polish  
Goal: bright dark mode, denser gallery UI matching iOS feel, responsive grid polish, smooth animations
Touching files: globals.css / styles/, themeStore.ts (renderer/stores), styling tweaks on views/components
