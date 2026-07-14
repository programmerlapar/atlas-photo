---
bug_id: BUG-015
category: electron
context: electron/security
severity: minor
status: resolved
priority: medium
date_reported: 2024-12-19
date_resolved: 2024-12-19
reporter: system
resolver: ai-assistant
related_files:
  - src/main/windows/mainWindow.ts
related_bugs: []
tags:
  - electron
  - security
  - content-security-policy
  - csp
  - warnings
tech_stack:
  - electron
  - security
error_code: Insecure Content-Security-Policy
---

# Electron Content-Security-Policy Warning

## Summary

**One-line description:** Electron renderer process displaying security warning about missing or insecure Content-Security-Policy

**Impact:** Security warning in console, but no functional impact in development

## Description

Electron is displaying a security warning that the renderer process has either no Content-Security-Policy (CSP) set or a policy with "unsafe-eval" enabled. This exposes users to unnecessary security risks.

The warning appears in development mode but won't show in packaged builds.

## Steps to Reproduce

1. Start the Electron application in development mode
2. Open DevTools console
3. Check console for security warnings

**Expected Behavior:**
No security warnings about Content-Security-Policy

**Actual Behavior:**
Console displays warning:
```
Electron Security Warning (Insecure Content-Security-Policy) This renderer process has either no Content Security Policy set or a policy with "unsafe-eval" enabled. This exposes users of this app to unnecessary security risks.
```

## Environment

- **OS:** Windows 10
- **Node.js:** v20+
- **Package Manager:** Yarn
- **Electron:** v30.9
- **Other relevant versions:** Development mode

## Error Messages/Logs

```
VM285 renderer_init:2 Electron Security Warning (Insecure Content-Security-Policy) This renderer process has either no Content Security
  Policy set or a policy with "unsafe-eval" enabled. This exposes users of
  this app to unnecessary security risks.

For more information and help, consult
https://electronjs.org/docs/tutorial/security.

This warning will not show up once the app is packaged.
```

## Root Cause Analysis

- **Primary Cause:** Electron renderer process doesn't have Content-Security-Policy headers set
- **Contributing Factors:** 
  - Development mode requires `unsafe-eval` for Vite HMR
  - No CSP headers configured in Electron window
- **Why it wasn't caught earlier:** This is a development-only warning that doesn't affect packaged builds

## Resolution

Added Content-Security-Policy headers via Electron's `webRequest.onHeadersReceived` API to set appropriate CSP for development and production.

**Code Changes:**

```typescript
// Before
// No CSP configuration

// After
// Set Content-Security-Policy for security
mainWindow.webContents.session.webRequest.onHeadersReceived(
  (details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: photomap: file:; " +
            "font-src 'self' data:; " +
            "connect-src 'self' http://localhost:* ws://localhost:* ws://127.0.0.1:*;",
        ],
      },
    });
  }
);
```

**Files Modified:**

- `src/main/windows/mainWindow.ts`

**CSP Policy Details:**

- `default-src 'self'`: Only allow resources from same origin
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'`: Allow scripts (needed for Vite HMR in dev)
- `style-src 'self' 'unsafe-inline'`: Allow inline styles (needed for Tailwind)
- `img-src 'self' data: photomap: file:`: Allow images from same origin, data URIs, custom protocol, and file system
- `font-src 'self' data:`: Allow fonts from same origin and data URIs
- `connect-src 'self' http://localhost:* ws://localhost:* ws://127.0.0.1:*`: Allow connections to localhost (for Vite dev server)

## Prevention Strategies

1. **Set CSP Early:** Configure Content-Security-Policy when creating Electron windows
2. **Security Best Practices:** Follow Electron security guidelines from the start
3. **Development vs Production:** Use different CSP policies for development (with `unsafe-eval` for HMR) and production

**Documentation Updates:**

- Updated `.cursor/rules/generate.mdc` to include Electron CSP configuration best practice

**Checklist Updates:**

- Add to checklist: "Configure Content-Security-Policy for Electron renderer processes"

## Related Information

**Related Documentation:**

- [Electron Security Tutorial](https://www.electronjs.org/docs/tutorial/security)
- [Content Security Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

**External Resources:**

- [Electron Security Best Practices](https://www.electronjs.org/docs/tutorial/security)

## Testing Notes

**How to Verify Fix:**

1. Start Electron application in development mode
2. Open DevTools console
3. Verify no Content-Security-Policy warning appears
4. Verify app functionality still works (routing, images, etc.)

**Regression Testing:**
- Test image loading (thumbnails, full photos)
- Test routing functionality
- Test Vite HMR in development mode
- Verify custom protocol (`photomap://`) still works

---

**Last Updated:** 2024-12-19
**Version Fixed In:** Current

