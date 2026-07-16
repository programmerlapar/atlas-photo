# Photomap — Buckets Protocol (v1)

**Original intent:** polished MVP photo gallery (Electron + Leaflet) with snappy performance, iOS-like feel.

## Bucket 1 — Persistent Index & Cache Layer
Goal: EXIF reads and thumbnail generation happen once per session, not every revisit. Reopening same directory loads from index without full scan.
Touching files: storage.ts (main), PhotoIndex store / photoStore (renderer), IPC handlers, cache layer updates (thumbCache.ts renderer side)
Acceptance: scanning 5k photos takes seconds not minutes; reopen same dir loads instantly

**Status (2026-07-16): Implemented; 5k-photo acceptance timing still needs manual verification.**

- Added a disk-backed per-directory photo index with atomic writes, metadata-date revival, and cache updates for file-watcher changes, thumbnail creation, and deletion.
- Cache hits return indexed photos before a full scan or EXIF extraction; album summaries reuse the index and do not scan every recent directory on the Albums screen.
- Parallelized cold EXIF extraction, deduplicated/throttled thumbnail generation, and added renderer thumbnail caching with batched photo-store updates.
- Gallery cards generate thumbnails near the viewport, use stable loading surfaces, and retain only a demand-loaded portion of a large grid in the DOM.
- Album, gallery, and detail transitions clear stale photos, avoid active-scan restore races, and display a cached thumbnail before the full-resolution detail image is ready.

**Manual validation remaining:** time a cold 5k-photo import and a warm reopen; verify fast photo open/close and Albums return after scrolling deeply through a large album.

## Bucket 2 — Map Reliability  
Goal: map pins always display thumbnail; no flickering/crashing on hover or click
Touching files: ViewMap.tsx, PhotoMarker.tsx (renderer/components/map), error handling in image loading path, retry + fallback logic for pin images
Acceptance: all pins render consistently

**Status (2026-07-16): Wrapped and implemented; final interactive validation remains for the user's full library.**

- Removed the old route-level `Suspense` spinner and the artificial 500 ms map delay. The map now reveals from a compact, geographic loading surface only once Leaflet is ready.
- Replaced the dark monochrome tile treatment with CartoDB Voyager and a light geographic map surface; custom markers and popups retain a visible image fallback when a thumbnail cannot load.
- Warm missing map thumbnails in a bounded four-request background queue. Map entry is not blocked on thumbnail generation.
- Nearby photos are grouped by a 68 px screen-distance threshold (52 px at zoom 14+). A group represents its newest photo, shows its count, and automatically splits into individual markers as zoom separates the locations.
- New and removed spatial markers use opacity-only fades; exiting markers are non-interactive during their 200 ms leave period.
- Map scrolling uses the MIT-licensed `@luomus/leaflet-smooth-wheel-zoom` plugin: stock wheel zoom is disabled in favor of continuous, cursor-anchored fractional zoom.
- Grouped markers open a bottom-sheet photo browser rather than a popup for only the newest representative. It shows every nearby photo newest-first; selecting one opens Detail and Close returns to the map.
- Removed the invalid Stamen wildcard from CSP. Restart Electron completely to load the revised policy.

**Project motion rule:** `skills/photomap-motion/SKILL.md` defines the required route/view motion: zoom in + fade in on entry, zoom out + fade out before exit, and reduced-motion support.

**Bucket 2 handoff:** Map loading, tile styling, CSP, thumbnail resilience, nearby-photo grouping, smooth wheel zoom, marker motion, attribution treatment, bottom-sheet browsing, and map-return navigation are complete. Final validation: test repeated map entry, wheel zoom, cluster split/merge, sheet selection, and Detail Close with the user's large photo library.

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
