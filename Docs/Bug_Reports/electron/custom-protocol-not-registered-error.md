---
bug_id: BUG-013
title: Custom Protocol Not Registered Error (ERR_UNKNOWN_URL_SCHEME)
category: electron
severity: critical
status: resolved
date: 2024-12-19
tech_stack: Electron, Protocol Handler, Custom URLs
context: Custom protocol registration, thumbnail loading
error_code: 'net::ERR_UNKNOWN_URL_SCHEME'
related_files:
  - src/main/utils/protocol.ts
  - src/main/index.ts
  - src/renderer/components/gallery/PhotoCard.tsx
tags:
  - electron
  - protocol-handler
  - custom-protocol
  - url-scheme
related_bugs:
  - BUG-010
---

## Bug Description

The custom `photomap://` protocol handler is not being recognized by Electron, causing "ERR_UNKNOWN_URL_SCHEME" errors when trying to load thumbnails and photos.

### Error Message

```
GET photomap://QzpcVXNlcnNcRmlybWFuXEFwcERhdGFcUm9hbWluZ1xwaG90b21hcFx0aHVtYm5haWxzXFJUcGNVR2h2ZEc5eklHRnVaQ0JXYVdSbGIzTmNTbTluYW1GY1NHOTBaV3dnU0dGeWNHVnlYRWxOUjE4d01qQTJMbWhsYVdNX18zMDAuanBn net::ERR_UNKNOWN_URL_SCHEME
```

### Impact

- **User Experience:** Thumbnails and photos fail to load
- **Functionality:** Core feature (viewing photos) is broken
- **Protocol Handler:** Custom protocol registration is not working

## Root Cause Analysis

**Primary Cause:** The custom protocol handler may not be registered correctly, or there may be a timing issue where the protocol is registered after the renderer tries to use it. The protocol registration might also fail silently.

**Contributing Factors:**

1. Protocol registration happens in `app.whenReady()` but may not complete before renderer loads
2. No error handling or verification that protocol registration succeeded
3. Protocol might need to be registered before `app.whenReady()` in some cases
4. Using Vite dev server (`http://localhost:5173`) might require additional protocol handling

**Why it wasn't caught earlier:**

- This only becomes apparent when running the actual Electron app
- Protocol registration errors might be silent
- The error only appears when trying to load resources via custom protocol

## Steps to Reproduce

1. Run the Electron app with `yarn electron:dev`
2. Select a directory containing photos
3. Wait for thumbnails to be generated
4. Observe console errors: "ERR_UNKNOWN_URL_SCHEME"

**Expected Behavior:**

- Custom protocol should be registered and recognized
- Thumbnails should load via `photomap://` protocol
- No protocol errors in console

**Actual Behavior:**

- "ERR_UNKNOWN_URL_SCHEME" errors appear
- Thumbnails fail to load
- Protocol handler is not recognized

## Resolution

**Code Changes:**

1. **Updated `src/main/utils/protocol.ts`** - Added protocol registration check and logging:

```typescript
export const registerCustomProtocol = () => {
  // Check if protocol is already registered
  if (protocol.isProtocolRegistered('photomap')) {
    console.log('Protocol photomap already registered');
    return;
  }

  protocol.registerFileProtocol('photomap', (request, callback) => {
    // ... handler code
  });

  console.log('Custom protocol photomap registered successfully');
};
```

2. **Updated `src/main/index.ts`** - Added error handling for protocol registration:

```typescript
app.whenReady().then(async () => {
  try {
    registerCustomProtocol();
  } catch (error) {
    console.error('Failed to register custom protocol:', error);
  }

  createMainWindow();
});
```

**Critical Fix - Custom Partition Registration:**

When using a custom partition (`partition: 'persist:main'`) in `webPreferences`, the protocol **MUST** be registered to that specific session, not the default session. This was the root cause of the error.

**Files Modified:**

- `src/main/utils/protocol.ts` - Register protocol to custom session (`session.fromPartition('persist:main')`) and also to default session as fallback
- `src/main/index.ts` - Added error handling
- `src/main/windows/mainWindow.ts` - Disabled sandbox mode to allow custom protocol access

**Key Changes:**

```typescript
// Get the custom session that matches the partition
const customSession = session.fromPartition('persist:main');

// Register protocol to the custom session (required!)
customSession.protocol.registerFileProtocol('photomap', protocolHandler);

// Also register to default session as fallback
protocol.registerFileProtocol('photomap', protocolHandler);
```

## Prevention Strategies

1. **Documentation Updates:**
   - Always verify protocol registration with `protocol.isProtocolRegistered()`
   - Add logging to confirm protocol registration
   - Handle protocol registration errors gracefully

2. **Checklist Updates:**
   - Added to setup checklist: "Verify custom protocol registration with logging"
   - Added to setup checklist: "Test protocol handler with actual file paths"
   - Added to setup checklist: "Handle protocol registration errors"

3. **Code Review:**
   - Always check protocol registration status
   - Verify protocol handler is called correctly
   - Test with actual file paths in development

## Additional Notes

- Protocol registration should happen before creating BrowserWindow
- Use `protocol.isProtocolRegistered()` to verify registration
- Add error handling for protocol registration failures
- Log protocol registration for debugging
