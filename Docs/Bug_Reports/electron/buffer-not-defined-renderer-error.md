---
bug_id: BUG-012
title: Buffer Not Defined Error in Renderer Process
category: electron
severity: critical
status: resolved
date: 2024-12-19
tech_stack: Electron, React, Browser APIs
context: Renderer process, file path encoding
error_code: 'ReferenceError: Buffer is not defined'
related_files:
  - src/renderer/components/gallery/PhotoCard.tsx
  - src/renderer/views/DetailView.tsx
  - src/renderer/components/map/MapPopup.tsx
  - src/renderer/utils/photoId.ts
tags:
  - electron
  - buffer
  - renderer
  - browser-compatibility
related_bugs:
  - BUG-010
  - BUG-011
---

## Bug Description

The renderer process throws "Buffer is not defined" errors when trying to encode file paths for the custom protocol handler. `Buffer` is a Node.js API that's not available in the browser/renderer process by default.

### Error Message

```
Uncaught ReferenceError: Buffer is not defined
    at PhotoCard (PhotoCard.tsx:72:34)
```

### Impact

- **User Experience:** Photos and thumbnails fail to load
- **Functionality:** Core feature (viewing photos) is broken
- **Compatibility:** Using Node.js APIs in renderer process breaks browser compatibility

## Root Cause Analysis

**Primary Cause:** The renderer process is a browser environment and doesn't have access to Node.js APIs like `Buffer` by default. Even though Electron allows some Node.js APIs in the renderer, `Buffer` may not be available or should not be used for browser compatibility.

**Contributing Factors:**

1. Using `Buffer.from()` directly in renderer components
2. Not using browser-compatible encoding APIs (TextEncoder, btoa, atob)
3. Assumption that Node.js APIs are available in renderer

**Why it wasn't caught earlier:**

- This only becomes apparent when running the actual Electron app
- Development mode may not catch this if the environment is different
- The error only appears when trying to encode file paths

## Steps to Reproduce

1. Run the Electron app with `yarn electron:dev`
2. Select a directory containing photos
3. Observe console errors: "Buffer is not defined"

**Expected Behavior:**

- Photos and thumbnails should load correctly
- File paths should be encoded using browser-compatible APIs
- No Buffer-related errors

**Actual Behavior:**

- "Buffer is not defined" errors appear in console
- Photos fail to load
- Thumbnails fail to display

## Resolution

**Code Changes:**

1. **Updated `src/renderer/utils/photoId.ts`** - Added browser-compatible encoding functions:

```typescript
/**
 * Encodes a string to base64url (browser-compatible)
 * Uses TextEncoder and btoa for browser compatibility
 */
const encodeToBase64Url = (str: string): string => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

/**
 * Decodes base64url to string (browser-compatible)
 * Uses TextDecoder and atob for browser compatibility
 */
const decodeFromBase64Url = (base64url: string): string => {
  try {
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  } catch (error) {
    console.error('Error decoding base64url:', error);
    throw error;
  }
};

/**
 * Encodes a file path for use in custom protocol URLs
 */
export const encodeFilePath = (filePath: string): string => {
  return encodeToBase64Url(filePath);
};
```

2. **Updated all renderer components** - Replaced `Buffer.from()` with `encodeFilePath()`:

```typescript
// Before
src={`photomap://${Buffer.from(photo.thumbnailPath).toString('base64url')}`}

// After
src={`photomap://${encodeFilePath(photo.thumbnailPath)}`}
```

**Files Modified:**

- `src/renderer/utils/photoId.ts` - Added browser-compatible encoding functions
- `src/renderer/components/gallery/PhotoCard.tsx` - Use `encodeFilePath()`
- `src/renderer/views/DetailView.tsx` - Use `encodeFilePath()`
- `src/renderer/components/map/MapPopup.tsx` - Use `encodeFilePath()`

## Prevention Strategies

1. **Documentation Updates:**
   - Never use Node.js APIs (like `Buffer`) directly in renderer process
   - Always use browser-compatible APIs (TextEncoder, btoa, atob) for encoding/decoding
   - Create utility functions for browser-compatible operations

2. **Checklist Updates:**
   - Added to setup checklist: "Never use Node.js APIs (Buffer, fs, path) directly in renderer process"
   - Added to setup checklist: "Use browser-compatible APIs (TextEncoder, btoa, atob) for encoding/decoding"
   - Added to setup checklist: "Create utility functions for browser-compatible operations"

3. **Code Review:**
   - Always check for Node.js API usage in renderer code
   - Ensure browser compatibility for all renderer utilities
   - Verify encoding/decoding uses browser APIs

## Additional Notes

- `Buffer` is a Node.js API and should not be used in renderer process
- Use `TextEncoder`/`TextDecoder` and `btoa`/`atob` for browser-compatible encoding/decoding
- The main process can use Node.js APIs, but renderer should use browser APIs
- This ensures compatibility with standard web technologies
