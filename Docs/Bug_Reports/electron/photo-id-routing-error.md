---
bug_id: BUG-011
title: Photo ID Routing Error with File Paths
category: electron
severity: critical
status: resolved
date: 2024-12-19
tech_stack: Electron, React Router, URL Encoding
context: Photo navigation, URL routing
error_code: 'No routes matched location'
related_files:
  - src/renderer/views/GalleryView.tsx
  - src/renderer/views/DetailView.tsx
  - src/renderer/views/MapView.tsx
  - src/renderer/utils/photoId.ts
  - src/renderer/main.tsx
tags:
  - electron
  - react-router
  - url-encoding
  - routing
related_bugs:
  - []
---

## Bug Description

Photo IDs contain full file paths (e.g., `E:/Photos and Videos/Jogja/Hotel Harper/IMG_4977.heic-1738400878300`) which break React Router URL matching. The colons, spaces, and special characters in file paths cause routing failures.

### Error Message

```
No routes matched location "/detail/E:/Photos%20and%20Videos/Jogja/Hotel%20Harper/IMG_4977.heic-1738400878300"
```

### Impact

- **User Experience:** Clicking on photos fails to navigate to detail view
- **Functionality:** Photo detail view is inaccessible
- **Navigation:** All photo navigation is broken

## Root Cause Analysis

**Primary Cause:** Photo IDs include full file paths with special characters (colons, spaces, slashes) that break URL routing. React Router cannot match these paths correctly.

**Contributing Factors:**

1. Photo IDs are generated as `${fullPath}-${mtimeMs}` which includes colons (Windows drive letters)
2. File paths contain spaces and special characters
3. URL encoding doesn't fully solve the issue for React Router
4. Using BrowserRouter instead of HashRouter for Electron apps

**Why it wasn't caught earlier:**

- This only becomes apparent when navigating to photos with complex paths
- Development testing may not include photos with special characters in paths
- The error only appears when clicking on photos

## Steps to Reproduce

1. Run the Electron app
2. Select a directory with photos (especially on Windows drives like `E:/`)
3. Click on a photo in the gallery
4. Observe routing error: "No routes matched location"

**Expected Behavior:**

- Clicking a photo should navigate to detail view
- Photo ID should be properly encoded in URL
- Detail view should load correctly

**Actual Behavior:**

- Routing fails to match the photo detail route
- Navigation error appears in console
- Photo detail view does not load

## Resolution

**Code Changes:**

1. **Created `src/renderer/utils/photoId.ts`** - Photo ID encoding utilities:

```typescript
export const encodePhotoId = (photoId: string): string => {
  return Buffer.from(photoId).toString('base64url');
};

export const decodePhotoId = (encodedId: string): string => {
  try {
    return Buffer.from(encodedId, 'base64url').toString('utf-8');
  } catch (error) {
    return encodedId; // Return as-is if decoding fails
  }
};
```

2. **Switched to HashRouter** - Changed from BrowserRouter to HashRouter:

```typescript
// Before
import { BrowserRouter } from 'react-router-dom';
<BrowserRouter>

// After
import { HashRouter } from 'react-router-dom';
<HashRouter>
```

3. **Updated all navigation** - Encode photo IDs before navigation:

```typescript
// Before
navigate(`/detail/${photo.id}`);

// After
navigate(`/detail/${encodePhotoId(photo.id)}`);
```

4. **Updated DetailView** - Decode photo IDs when reading from URL:

```typescript
const decodedPhotoId = decodePhotoId(photoId);
const photo = photos.find((p) => p.id === decodedPhotoId);
```

**Files Modified:**

- `src/renderer/utils/photoId.ts` - Created encoding utilities
- `src/renderer/main.tsx` - Switched to HashRouter
- `src/renderer/views/GalleryView.tsx` - Encode photo IDs
- `src/renderer/views/DetailView.tsx` - Decode photo IDs
- `src/renderer/views/MapView.tsx` - Encode photo IDs

## Prevention Strategies

1. **Documentation Updates:**
   - Always use HashRouter for Electron apps
   - Always encode IDs with special characters before putting in URLs
   - Never use file paths directly in URLs

2. **Checklist Updates:**
   - Added to setup checklist: "Use HashRouter for Electron apps (not BrowserRouter)"
   - Added to setup checklist: "Encode all IDs with special characters before URL navigation"
   - Added to setup checklist: "Test navigation with photos containing special characters in paths"

3. **Code Review:**
   - Always check for direct file path usage in URLs
   - Ensure HashRouter is used for Electron apps
   - Verify ID encoding/decoding is consistent

## Additional Notes

- HashRouter is recommended for Electron apps to avoid file path issues
- base64url encoding is URL-safe and doesn't require additional encoding
- Photo IDs should be encoded at navigation boundaries and decoded at usage points
