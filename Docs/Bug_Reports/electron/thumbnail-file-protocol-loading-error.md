---
bug_id: BUG-010
title: Thumbnail File Protocol Loading Error in Electron
category: electron
severity: critical
status: resolved
date: 2024-12-19
tech_stack: Electron, React Router, File Protocol
context: Thumbnail loading, renderer process security
error_code: 'Not allowed to load local resource: file:///'
related_files:
  - src/renderer/components/gallery/PhotoCard.tsx
  - src/renderer/views/DetailView.tsx
  - src/main/utils/protocol.ts
  - src/main/index.ts
tags:
  - electron
  - file-protocol
  - security
  - thumbnails
related_bugs:
  - []
---

## Bug Description

The renderer process cannot load local file:// URLs for thumbnails and photos due to Electron's security restrictions. This causes "Not allowed to load local resource" errors when trying to display thumbnails.

### Error Message

```
Not allowed to load local resource: file:///C:/Users/Firman/AppData/Roaming/photomap/thumbnails/...
```

### Impact

- **User Experience:** Thumbnails and photos fail to display in the gallery and detail views
- **Functionality:** Core feature (viewing photos) is broken
- **Security:** Direct file:// URLs are blocked by Electron's security model

## Root Cause Analysis

**Primary Cause:** Electron's renderer process has security restrictions that prevent loading local `file://` URLs directly. The renderer process runs in a sandboxed environment and cannot access the file system directly.

**Contributing Factors:**

1. Attempting to use `file://` URLs in `<img>` tags
2. No custom protocol handler registered to serve local files
3. Not using Electron's protocol API to serve files securely

**Why it wasn't caught earlier:**

- This only becomes apparent when running the actual Electron app
- Development mode with Vite dev server may not trigger this security restriction
- The error only appears when trying to load local files

## Steps to Reproduce

1. Run the Electron app with `yarn electron:dev`
2. Select a directory containing photos
3. Wait for thumbnails to be generated
4. Observe console errors: "Not allowed to load local resource: file:///..."

**Expected Behavior:**

- Thumbnails and photos should display correctly
- No security errors in console

**Actual Behavior:**

- Thumbnails fail to load
- "Not allowed to load local resource" errors appear in console
- Photos cannot be displayed

## Resolution

**Code Changes:**

1. **Created `src/main/utils/protocol.ts`** - Custom protocol handler:

```typescript
import { protocol } from 'electron';
import { existsSync } from 'fs';

export const registerCustomProtocol = () => {
  protocol.registerFileProtocol('photomap', (request, callback) => {
    const url = request.url.replace('photomap://', '');

    try {
      const filePath = Buffer.from(url, 'base64url').toString('utf-8');

      if (existsSync(filePath)) {
        callback({ path: filePath });
      } else {
        callback({ error: -2 }); // FILE_NOT_FOUND
      }
    } catch (error) {
      callback({ error: -2 });
    }
  });
};
```

2. **Updated `src/main/index.ts`** - Register protocol on app ready:

```typescript
app.whenReady().then(() => {
  registerCustomProtocol();
  createMainWindow();
});
```

3. **Updated all image sources** - Changed from `file://` to `photomap://`:

```typescript
// Before
src={`file://${photo.thumbnailPath}`}

// After
src={`photomap://${Buffer.from(photo.thumbnailPath).toString('base64url')}`}
```

**Files Modified:**

- `src/main/utils/protocol.ts` - Created custom protocol handler
- `src/main/index.ts` - Register protocol on app ready
- `src/renderer/components/gallery/PhotoCard.tsx` - Use custom protocol
- `src/renderer/views/DetailView.tsx` - Use custom protocol
- `src/renderer/components/map/MapPopup.tsx` - Use custom protocol

## Prevention Strategies

1. **Documentation Updates:**
   - Always use custom protocol handlers for local files in Electron apps
   - Never use `file://` URLs in renderer process
   - Register custom protocols before creating windows

2. **Checklist Updates:**
   - Added to setup checklist: "Register custom protocol handler for serving local files"
   - Added to setup checklist: "Never use file:// URLs in renderer process"
   - Added to setup checklist: "Test thumbnail and photo loading in Electron app"

3. **Code Review:**
   - Always check for `file://` URLs in renderer code
   - Ensure custom protocols are registered before app initialization
   - Verify file paths are properly encoded/decoded

## Additional Notes

- Custom protocols must be registered before creating BrowserWindow
- File paths are base64url encoded to avoid special character issues
- The protocol handler verifies file existence before serving
