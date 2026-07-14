---
# Tailwind CSS v4 PostCSS Plugin Error

## Metadata (AI-Friendly)

```yaml
bug_id: BUG-006
category: configuration
context: tailwind-css-v4/postcss-plugin
severity: critical
status: resolved
priority: high
date_reported: 2024-12-19
date_resolved: 2024-12-19
reporter: AI Agent
resolver: AI Agent
related_files:
  - postcss.config.js
  - app/globals.css
  - package.json
  - Docs/Implementation.md
related_bugs: []
tags:
  - tailwind-css
  - tailwind-css-v4
  - postcss
  - configuration
  - setup-error
  - breaking-change
tech_stack:
  - nextjs
  - tailwindcss
  - postcss
  - yarn
error_code: "It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin. The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS with PostCSS you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration."
```

---

## Summary

**One-line description:** Tailwind CSS v4 requires a separate `@tailwindcss/postcss` package for PostCSS integration, causing build errors when using the old `tailwindcss` plugin directly.

**Impact:** Prevents application from starting in development mode and breaks build process. Affects all projects upgrading to or using Tailwind CSS v4 with PostCSS.

## Description

When using Tailwind CSS v4, the PostCSS plugin has been moved to a separate package `@tailwindcss/postcss`. Attempting to use `tailwindcss` directly as a PostCSS plugin (as was done in Tailwind CSS v3) causes a build error with a message indicating that the plugin has moved to a separate package.

This is a breaking change in Tailwind CSS v4 that requires:

1. Installing the `@tailwindcss/postcss` package
2. Updating `postcss.config.js` to use `@tailwindcss/postcss` instead of `tailwindcss`
3. Updating `globals.css` to use `@import 'tailwindcss';` instead of the old `@tailwind` directives

The error prevents the development server from starting and blocks the build process.

## Steps to Reproduce

1. Install Tailwind CSS v4 (version 4.x.x) in a Next.js project
2. Configure `postcss.config.js` with the old v3 syntax:
   ```javascript
   module.exports = {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     },
   };
   ```
3. Use `@tailwind` directives in `globals.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
4. Run `yarn dev` or `next dev`
5. Error occurs: "It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin..."

**Expected Behavior:**
The development server should start successfully with Tailwind CSS v4.

**Actual Behavior:**
Build process fails with error: "It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin. The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS with PostCSS you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration."

## Environment

- **OS:** Windows 10 (Build 26200), but affects all platforms
- **Node.js:** 18.x / 20.x
- **Package Manager:** Yarn 4.10.3 (node_modules linker)
- **Framework:** Next.js 14.2.10
- **Tailwind CSS:** 4.1.16
- **PostCSS:** 8.5.6
- **Other relevant versions:** React 18, TypeScript 5.6.2

## Error Messages/Logs

```
./app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[12].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[12].use[3]!./app/globals.css

Error: It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin. The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS with PostCSS you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration.
```

## Screenshots/Recordings

N/A - Error occurs during build/development startup

## Root Cause Analysis

**Primary Cause:** Tailwind CSS v4 introduced a breaking change where the PostCSS plugin was moved to a separate package `@tailwindcss/postcss`. The old configuration using `tailwindcss` directly as a PostCSS plugin is no longer supported.

**Contributing Factors:**

1. Breaking change in Tailwind CSS v4 architecture
2. Migration documentation may not be immediately obvious when upgrading
3. The error message is clear but requires manual intervention
4. Multiple files need to be updated (postcss.config.js and globals.css)
5. Package installation is required before configuration changes

**Why it wasn't caught earlier:**

- This is a breaking change in Tailwind CSS v4 that affects all projects upgrading from v3
- The error only appears when running the dev server or build
- Setup scripts or templates may still use v3 syntax

## Resolution

**Code Changes:**

1. **Installed `@tailwindcss/postcss` package:**

   ```bash
   yarn add -D @tailwindcss/postcss
   ```

2. **Updated `postcss.config.js`** to use the new package:

   ```javascript
   // Before
   module.exports = {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     },
   };

   // After
   module.exports = {
     plugins: {
       '@tailwindcss/postcss': {},
       autoprefixer: {},
     },
   };
   ```

3. **Updated `app/globals.css`** to use the new import syntax:

   ```css
   // Before
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   // After
   @import 'tailwindcss';
   ```

**Files Modified:**

- `postcss.config.js` - Changed plugin from `tailwindcss` to `@tailwindcss/postcss`
- `app/globals.css` - Changed from `@tailwind` directives to `@import 'tailwindcss';`
- `package.json` - Added `@tailwindcss/postcss` to devDependencies

## Prevention Strategies

1. **Documentation Updates:**
   - Updated `Docs/Implementation.md` with Tailwind CSS v4 integration requirements
   - Note that Tailwind CSS v4 requires `@tailwindcss/postcss` package for PostCSS integration
   - Updated configuration checklist to include PostCSS plugin verification

2. **Checklist Updates:**
   - Added to setup checklist: "Install `@tailwindcss/postcss` when using Tailwind CSS v4"
   - Added to configuration checklist: "PostCSS config uses `@tailwindcss/postcss` plugin"
   - Added to CSS checklist: "Use `@import 'tailwindcss';` in globals.css for v4"

3. **Template Updates:**
   - `postcss.config.js` template should use `@tailwindcss/postcss` for v4
   - `globals.css` template should use `@import 'tailwindcss';` for v4
   - Package installation should include `@tailwindcss/postcss` when using Tailwind v4

4. **AI Agent Awareness:**
   - AI should recognize Tailwind CSS v4 requires separate PostCSS package
   - AI should check version and apply appropriate configuration
   - AI should install `@tailwindcss/postcss` when setting up Tailwind v4 projects

**Documentation Updates:**

- `Docs/Implementation.md` - Added Tailwind CSS v4 integration requirements section
- This bug report serves as reference for future Tailwind CSS v4 setups

**Checklist Updates:**

- Setup Checklist: "Verify Tailwind CSS version and install `@tailwindcss/postcss` if v4"
- Configuration Checklist: "PostCSS uses `@tailwindcss/postcss` plugin for Tailwind v4"
- CSS Checklist: "Use `@import 'tailwindcss';` syntax for Tailwind v4"

## Related Information

**Related Documentation:**

- [Tailwind CSS v4 Installation Guide](https://tailwindcss.com/docs/installation/using-postcss)
- [Tailwind CSS v4 Migration Guide](https://tailwindcss.com/docs/upgrade-guide)

**External Resources:**

- [Tailwind CSS v4 PostCSS Plugin](https://tailwindcss.com/docs/installation/using-postcss)
- [Tailwind CSS v4 Release Notes](https://github.com/tailwindlabs/tailwindcss/releases)

## Testing Notes

**How to Verify Fix:**

1. Run `yarn dev` - should start without errors
2. Check browser - Tailwind styles should apply correctly
3. Verify build completes successfully: `yarn build`
4. Check that all Tailwind utility classes work as expected

**Regression Testing:**

- All existing Tailwind classes continue to work
- Custom Tailwind configuration (tailwind.config.ts) still functions
- PostCSS processing completes without errors
- Build process completes successfully

---

**Last Updated:** 2024-12-19
**Version Fixed In:** Tailwind CSS v4.1.16
