---
# Framer Motion motion-dom Import Error

## Metadata (AI-Friendly)

```yaml
bug_id: BUG-002
category: dependencies
context: framer-motion/motion-dom-version-mismatch
severity: critical
status: resolved
priority: high
date_reported: 2024-12-19
date_resolved: 2024-12-19
reporter: AI Agent
resolver: AI Agent
related_files:
  - package.json
  - src/components/features/landing/feature-cards.tsx
  - src/components/features/landing/hero-section.tsx
  - src/app/(dashboard)/dashboard/page.tsx
related_bugs: []
tags:
  - framer-motion
  - motion-dom
  - dependencies
  - import-error
  - version-mismatch
tech_stack:
  - nextjs
  - framer-motion
  - motion-dom
error_code: "Attempted import error: 'GroupPlaybackControls' is not exported from 'motion-dom'"
```

---

## Summary

**One-line description:** Framer Motion 12.5.0 throws import error when trying to import `GroupPlaybackControls` from `motion-dom` because the export doesn't exist in the installed version of motion-dom.

**Impact:** Prevents application from running in development mode. Causes 500 errors when pages using framer-motion are accessed.

---

## Detailed Description

### Error Message

```
Attempted import error: 'GroupPlaybackControls' is not exported from 'motion-dom' (imported as 'GroupPlaybackControls').

Import trace for requested module:
./node_modules/framer-motion/dist/es/animation/animate/index.mjs
./node_modules/framer-motion/dist/es/index.mjs
./src/components/features/landing/feature-cards.tsx
```

### Root Cause

Framer Motion version 12.5.0 has a dependency on `motion-dom` that expects `GroupPlaybackControls` to be exported from the `motion-dom` package. However, the version of `motion-dom` that gets installed as a peer dependency (12.23.23) doesn't export this function, causing a module import error.

This is a version compatibility issue between `framer-motion@12.5.0` and its peer dependency `motion-dom`.

### Affected Components

All components using `framer-motion`:

- `src/components/features/landing/feature-cards.tsx`
- `src/components/features/landing/hero-section.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`
- Any other components using `motion` from `framer-motion`

---

## Solution

### Immediate Fix

Upgrade `framer-motion` to the latest version:

```bash
yarn add framer-motion@latest
```

This will update from `12.5.0` to `12.23.24` (or later), which includes the correct compatibility with `motion-dom`.

### Verification

After upgrading, verify:

1. **Clear Next.js cache:** Delete `.next` folder if the error persists after upgrade

   ```bash
   # Windows PowerShell
   Remove-Item -Recurse -Force .next

   # Or manually delete .next folder
   ```

2. **Restart dev server:** Stop and restart `yarn dev` after clearing cache
3. Run `yarn dev` - the error should no longer appear
4. Check that pages using framer-motion load correctly
5. Verify animations work as expected

**Note:** If the error persists after upgrading, it's likely a caching issue. Clear the `.next` folder and restart the dev server.

### Prevention

1. **Always use compatible versions:** When specifying framer-motion version in `package.json`, ensure it's compatible with its peer dependencies
2. **Check peer dependencies:** Review peer dependency warnings during `yarn install`
3. **Update together:** When updating framer-motion, ensure motion-dom is also compatible

---

## Workaround (If Upgrade Not Possible)

If for some reason you cannot upgrade framer-motion:

1. Remove framer-motion animations temporarily
2. Use CSS transitions as a fallback
3. Replace with a different animation library that's compatible

**Note:** This is not recommended as it removes functionality. Upgrading is the preferred solution.

---

## Prevention Checklist

- [x] Verify framer-motion version compatibility with motion-dom
- [x] Update package.json to use latest stable version
- [x] Check peer dependency warnings during installation
- [x] Test animations after dependency updates

---

## Related Documentation

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [motion-dom Package](https://www.npmjs.com/package/motion-dom)
- [Package Version Compatibility](Docs/Implementation.md#dependency-compatibility-matrix)

---

## Resolution Notes

**Resolved by:** Upgrading framer-motion from 12.5.0 to 12.23.24

**Resolution Date:** 2024-12-19

**Testing Status:** ✅ Verified - Application now runs without import errors
