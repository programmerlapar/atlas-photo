# Atlas Photo — Buckets Protocol (v1)

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
- Thumbnail work is now priority-aware: Gallery, Detail, and the first Map-sheet cells use foreground requests, while one cancellable idle worker continues the rest of the current album across every view. Rapid index thumbnail updates are coalesced into one delayed atomic write instead of rewriting the full index per image.
- Unsupported HEIC codecs skip Sharp's redundant retry and go straight to `heic-convert`; successful fallback conversion is retained as a normal cached thumbnail.
- A follow-up performance pass batches renderer thumbnail-store updates, memoizes unchanged Gallery cards, and prevents Map thumbnail arrivals from rebuilding its spatial clusters/Leaflet marker layer. Map marker images refresh in compact batches instead.
- The index is now version 2: existing v1 entries migrate their stored raw EXIF capture dates in place, avoiding a costly cold re-scan. New scans read translated EXIF dates and use a filesystem timestamp only when no embedded date exists.
- Collections never decode cover images while loading. Background thumbnail work waits briefly for navigation to settle and processes one file at a time; EXIF parsing uses four workers to keep the app responsive on modest machines.

**Manual validation remaining:** time a cold 5k-photo import and a warm reopen; verify fast photo open/close and Albums return after scrolling deeply through a large album.

## Bucket 2 — Map Reliability  
Goal: map pins always display thumbnail; no flickering/crashing on hover or click
Touching files: ViewMap.tsx, PhotoMarker.tsx (renderer/components/map), error handling in image loading path, retry + fallback logic for pin images
Acceptance: all pins render consistently

**Status (2026-07-16): Wrapped and implemented; final interactive validation remains for the user's full library.**

- Removed the old route-level `Suspense` spinner and the artificial 500 ms map delay. The map now reveals from a compact, geographic loading surface only once Leaflet is ready.
- Replaced the dark monochrome tile treatment with CartoDB Voyager and a light geographic map surface; custom markers and popups retain a visible image fallback when a thumbnail cannot load.
- Map warming submits low-priority work to the shared thumbnail queue; map entry is not blocked and visible Gallery/Detail/Sheet images always take precedence.
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

**Status (2026-07-16): Implemented; final interactive validation remains.**

- Added `useMotionNavigate`, a shared route helper using Chromium View Transitions for a 180–220 ms zoom-and-fade navigation handoff. It is used for Welcome, Albums, Gallery, Detail, Map, and Settings routes, with an immediate reduced-motion fallback.
- Reworked the Welcome entry motion to use a quiet zoom/fade rather than a sliding card and removed the perpetual decorative pulse.
- Converted the selection action bar into a floating, responsive liquid-glass control with clear selected/working feedback and non-blocking action states. Selection indicators no longer scale-pop.
- Unified Detail's overlapping zoom and slideshow controls into one compact glass toolbar that keeps image position, photo count, slideshow speed, loop, and reset controls coherent.
- Removed stale navigation and view-state code exposed during the pass, including unsafe Settings preference casts.
- Collections now use their imported folder name (or `Untitled Collection` only if no usable folder name exists), retain accurate indexed photo counts when a custom cover is set, and expose an explicit “Remove from Collections” confirmation that guarantees source photos and folders remain untouched.
- Gallery has one consolidated liquid-glass header for back navigation, album context, actions, and View All. The unsupported free-text “Search photos” control was removed; undated groups are labelled “Undated photos” instead of “Unknown Date”.
- Light-mode glass now uses a bright, restrained frosted surface without the dark displacement/filter artifact. Header blur is capped at 20 px; all light-mode surface and glass shadows are reduced by 60%; header tooltips escape the glass boundary and appear above controls. Interactive buttons/links consistently show a pointer cursor.
- Desktop shell follow-up: the Electron window is frameless with renderer-owned minimize, maximize, and close controls. Library and Albums live in a compact floating glass sidebar, Settings is a sidebar popover, Gallery and Map headers are floating glass pills, and the inherited `**:drop-shadow-sm` filter was removed.

**Manual validation remaining:** verify route motion from Welcome → Albums → Gallery → Detail and back, selection actions on narrow and wide windows, Detail zoom/slideshow controls, and reduced-motion behavior.

## Bucket 4 — Filtering & Grouping Verification  
Goal: verify existing filter/group works; implement date range + location grouping if missing
Touching files: FilterPanel.tsx (renderer/components/filters), filterStore.ts (renderer/stores), possibly new photoGroupStore
Acceptance: filters apply live, smart albums appear for date/location

## Bucket 5 — Visual & Responsive Polish  
Goal: bright dark mode, denser gallery UI matching iOS feel, responsive grid polish, smooth animations
Touching files: globals.css / styles/, themeStore.ts (renderer/stores), styling tweaks on views/components
