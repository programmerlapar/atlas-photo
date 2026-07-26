---
name: atlas-photo-motion
description: Enforce PhotoMap's zoom-and-fade motion language whenever changing React routes, full-page views, map/detail navigation, or other view-level transitions. Use when adding or reviewing navigation, overlays that act as views, and motion-sensitive UI in this repository.
---

# PhotoMap Motion

## Overview

PhotoMap navigation should feel immediate and spatial: a view enters with a subtle zoom in plus fade in, and leaves with a subtle zoom out plus fade out. Apply this rule to every new or changed view transition.

## Required motion

- Enter: animate `opacity: 0 -> 1` and `transform: scale(0.96) -> scale(1)` over 180–240 ms.
- Leave: retain the outgoing view until `opacity: 1 -> 0` and `transform: scale(1) -> scale(0.98)` completes over 160–200 ms, then complete navigation.
- Animate only `transform` and `opacity`; do not delay navigation for image, tile, or network work.
- Keep outgoing views non-interactive while leaving. Never show a generic full-screen spinner for a normal route transition.
- Respect `prefers-reduced-motion`: use no scale movement and near-instant opacity/state changes.

## Applying the rule

1. Reuse the existing PhotoMap transition classes or helpers when available; extend them rather than adding a competing animation system.
2. For a route change, preserve the current route during its leave animation, then mount the next route with the enter animation.
3. For map markers, popups, and similar spatial elements, use a short opacity/transform transition when items enter, split, merge, or leave.
4. Verify forward navigation, back navigation, and rapid repeated navigation. The UI must stay responsive and must not leave stale interactive elements behind.

## Review checklist

- Entering view zooms in and fades in.
- Exiting view zooms out and fades out before it unmounts.
- Durations are brief enough that navigation still feels instant.
- Reduced-motion behavior is preserved.
- Motion does not trigger unnecessary re-renders, data loading, or layout work.
