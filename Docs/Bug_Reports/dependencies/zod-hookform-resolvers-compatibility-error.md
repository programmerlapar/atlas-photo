---
# Zod @hookform/resolvers Compatibility Error

## Metadata (AI-Friendly)

```yaml
bug_id: BUG-003
category: dependencies
context: zod/@hookform/resolvers-version-incompatibility
severity: critical
status: resolved
priority: high
date_reported: 2024-12-19
date_resolved: 2024-12-19
reporter: AI Agent
resolver: AI Agent
related_files:
  - package.json
  - src/app/(auth)/login/page.tsx
  - src/app/(auth)/signup/page.tsx
  - src/lib/schemas/auth.ts
related_bugs: []
tags:
  - zod
  - @hookform/resolvers
  - dependencies
  - import-error
  - version-incompatibility
tech_stack:
  - nextjs
  - zod
  - @hookform/resolvers
  - react-hook-form
error_code: "Module not found: Package path ./v4/core is not exported from package zod"
```

---

## Summary

**One-line description:** `@hookform/resolvers@5.2.2` tries to import `zod/v4/core` but zod 3.24.2 doesn't export this path, causing a module import error.

**Impact:** Prevents application from running in development mode. Causes 500 errors when pages using form validation with zod resolver are accessed.

---

## Detailed Description

### Error Message

```
Module not found: Package path ./v4/core is not exported from package D:\Development\healthtech2\node_modules\zod (see exports field in D:\Development\healthtech2\node_modules\zod\package.json)

Import trace for requested module:
./node_modules/@hookform/resolvers/zod/dist/zod.mjs
./src/app/(auth)/login/page.tsx
```

### Root Cause

`@hookform/resolvers@5.2.2` requires zod v4 and tries to import from `zod/v4/core`, but zod 3.24.2 (which was installed) doesn't export this path. This is a version compatibility issue where:

- `@hookform/resolvers@5.2.2` expects zod v4 API
- `zod@3.24.2` doesn't have the v4 export paths
- The package resolver can't find the requested export

### Affected Components

All components using `zodResolver` from `@hookform/resolvers`:

- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- Any other forms using zod validation with React Hook Form

---

## Solution

### Immediate Fix

Upgrade `zod` to version 4.x to match `@hookform/resolvers@5.2.2` requirements:

```bash
yarn add zod@^4
```

This will upgrade from `zod@3.24.2` to `zod@4.1.12` (or latest v4), which includes the `/v4/core` export path.

### Verification

After upgrading, verify:

1. Run `yarn dev` - the error should no longer appear
2. Check that login and signup pages load correctly
3. Verify form validation works as expected
4. Check that no zod v3-specific API is being used (v4 has some breaking changes)

### Prevention

1. **Check peer dependencies:** When installing `@hookform/resolvers`, check its peer dependency requirements for zod
2. **Version compatibility:** Ensure zod version matches what `@hookform/resolvers` expects
3. **Install together:** Install compatible versions together:
   ```bash
   yarn add zod@^4 @hookform/resolvers@latest
   ```
4. **Check documentation:** Always check package documentation for peer dependency requirements before installing

---

## Workaround (If Upgrade Not Possible)

If for some reason you cannot upgrade zod to v4:

1. Downgrade `@hookform/resolvers` to a version compatible with zod v3:
   ```bash
   yarn add @hookform/resolvers@^3 zod@^3
   ```
2. Note: This may limit features available in newer versions

**Note:** Upgrading zod is the preferred solution as it's more future-proof.

---

## Prevention Checklist

- [x] Verify zod version compatibility with @hookform/resolvers before installation
- [x] Check peer dependency requirements in package documentation
- [x] Update package.json to use compatible versions
- [x] Test form validation after dependency updates
- [x] Document version requirements in Implementation.md

---

## Related Documentation

- [Zod Documentation](https://zod.dev/)
- [@hookform/resolvers Documentation](https://github.com/react-hook-form/resolvers)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Package Version Compatibility](Docs/Implementation.md#dependency-compatibility-matrix)

---

## Resolution Notes

**Resolved by:** Upgrading zod from 3.24.2 to ^4.1.12

**Resolution Date:** 2024-12-19

**Testing Status:** ✅ Verified - Application now runs without import errors

**Breaking Changes:** Zod v4 has some API changes:

- `z.record(valueSchema)` → `z.record(keySchema, valueSchema)` - Now requires key schema as first parameter
- Verify all zod usage is compatible with v4
- Common breaking change: `z.record(z.unknown())` → `z.record(z.string(), z.unknown())`
