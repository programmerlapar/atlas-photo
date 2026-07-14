---
# Electron Vite Output Directory Mismatch Error

## Metadata (AI-Friendly)

```yaml
bug_id: BUG-007
category: configuration
context: electron-vite/build-output
severity: critical
status: resolved
priority: high
date_reported: 2024-12-19
date_resolved: 2024-12-19
reporter: AI Agent
resolver: AI Agent
related_files:
  - electron.vite.config.ts
  - package.json
  - src/main/windows/mainWindow.ts
related_bugs: []
tags:
  - electron-vite
  - electron
  - vite
  - build-configuration
  - output-directory
  - setup-error
tech_stack:
  - electron
  - electron-vite
  - vite
  - typescript
  - yarn
error_code: "Error: No electron app entry file found: D:\\Development\\photomap\\dist-electron\\main\\index.js"
```

---

## Summary

**One-line description:** Electron-vite fails to start because the build output directory doesn't match the expected location in `package.json`, causing a mismatch between where files are built and where electron-vite looks for them.

**Impact:** Prevents the Electron app from starting in development mode. The build completes successfully but electron-vite can't find the entry file at the expected path.

## Description

When running `yarn electron:dev`, electron-vite builds the main process, preload, and renderer successfully, but then fails to start the Electron app because it can't find the entry file at `dist-electron/main/index.js`. The build output shows files are being built (e.g., `out/main/index.js`), but electron-vite expects them in `dist-electron/` as specified in `package.json`'s `main` field.

This occurs when the `outDir` configuration is not explicitly set in `electron.vite.config.ts`, causing electron-vite to use a default output directory that doesn't match the `package.json` configuration.

## Steps to Reproduce

1. Set up an Electron project with electron-vite
2. Configure `package.json` with `main: "dist-electron/main/index.js"`
3. Create `electron.vite.config.ts` without explicit `outDir` configuration
4. Run `yarn electron:dev`
5. Build completes successfully
6. Error occurs: "No electron app entry file found: D:\Development\photomap\dist-electron\main\index.js"

**Expected Behavior:**
The Electron app should start successfully after building.

**Actual Behavior:**
Build completes but electron-vite fails to find the entry file at the expected path.

## Environment

- **OS:** Windows 10 (Build 26200), but affects all platforms
- **Node.js:** 18.x / 20.x
- **Package Manager:** Yarn 4.10.3
- **Framework:** Electron 30.0.9
- **Build Tool:** electron-vite 1.0.28, Vite 5.4.21
- **Other relevant versions:** TypeScript 5.6.2

## Error Messages/Logs

```
vite v5.4.21 building for development...
✓ 11 modules transformed.
out/main/index.js  17.47 kB
✓ built in 612ms

build the electron main process successfully

-----

vite v5.4.21 building for development...
✓ 1 modules transformed.
out/preload/index.js  1.28 kB
✓ built in 9ms

build the electron preload files successfully

-----

dev server running for the electron renderer process at:

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
error during start dev server and electron app:
Error: No electron app entry file found: D:\Development\photomap\dist-electron\main\index.js
    at ensureElectronEntryFile (D:\Development\photomap\node_modules\electron-vite\dist\chunks\lib-30d3117e.js:28:23)
    at Object.startElectron (D:\Development\photomap\node_modules\electron-vite\dist\chunks\lib-30d3117e.js:126:5)
    at createServer (D:\Development\photomap\node_modules\electron-vite\dist\chunks\lib-3fb7872b.js:74:21)
    at async CAC.<anonymous> (D:\Development\photomap\node_modules\electron-vite\dist\cli.js:64:9)
```

## Root Cause Analysis

**Primary Cause:** The `electron.vite.config.ts` file didn't explicitly configure `outDir` for each build target (main, preload, renderer). Without explicit configuration, electron-vite may use default output directories that don't match the `package.json` `main` field path.

**Contributing Factors:**

1. Default output directory behavior in electron-vite may vary
2. The `package.json` `main` field points to `dist-electron/main/index.js` but files were being built to `out/main/index.js`
3. Path resolution in `mainWindow.ts` for preload script also needs to match the output structure

**Why it wasn't caught earlier:**

- This is a setup/configuration issue that only appears when running the dev server
- The build process completes successfully, masking the output directory mismatch
- The error only occurs when electron-vite tries to start the Electron app

## Resolution

**Code Changes:**

1. **Updated `electron.vite.config.ts`** to explicitly set `outDir` for each build target:

```typescript
// Before
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts'),
        },
      },
    },
  },
  // ... preload and renderer similar
});

// After
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist-electron/main', // Explicit output directory
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts'),
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist-electron/preload', // Explicit output directory
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/preload.ts'),
        },
      },
    },
  },
  renderer: {
    // ...
    build: {
      outDir: 'dist-electron/renderer', // Explicit output directory
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
        },
      },
    },
  },
});
```

2. **Updated `src/main/windows/mainWindow.ts`** to fix preload path:

```typescript
// Before
preload: join(__dirname, '../preload/index.js'),

// After
preload: join(__dirname, '../../preload/index.js'),
```

**Files Modified:**

- `electron.vite.config.ts` - Added explicit `outDir` configuration for all build targets
- `src/main/windows/mainWindow.ts` - Fixed preload script path to match output structure

## Prevention Strategies

1. **Documentation Updates:**
   - Updated setup checklist to require explicit `outDir` configuration in `electron.vite.config.ts`
   - Document that `outDir` must match `package.json` `main` field path structure
   - Note that preload script paths in window configuration must match output structure

2. **Checklist Updates:**
   - Added to setup checklist: "Verify `outDir` is explicitly set in `electron.vite.config.ts` for all build targets"
   - Added to setup checklist: "Verify `package.json` `main` field matches the `outDir` configuration"
   - Added to setup checklist: "Verify preload script path in window configuration matches output structure"

3. **Template Updates:**
   - `electron.vite.config.ts` template should always include explicit `outDir` configuration
   - `package.json` template should match the `outDir` structure
   - Window configuration templates should use correct preload paths

4. **AI Agent Awareness:**
   - AI should always configure explicit `outDir` when setting up electron-vite projects
   - AI should verify that `package.json` `main` field matches the `outDir` configuration
   - AI should verify preload script paths match the output directory structure
   - AI should test `yarn electron:dev` after setup to catch this issue early

**Documentation Updates:**

- `Docs/Implementation.md` - Added note about explicit `outDir` configuration requirement
- This bug report serves as reference for future electron-vite setups

**Checklist Updates:**

- Setup Checklist: "Verify `outDir` is explicitly set in `electron.vite.config.ts`"
- Setup Checklist: "Verify `package.json` `main` field matches `outDir`"
- Setup Checklist: "Verify preload script paths match output structure"
- Setup Checklist: "Test `yarn electron:dev` after setup"

## Related Information

**Related Documentation:**

- [Electron Vite Documentation](https://electron-vite.org/)
- [Electron Vite Configuration](https://electron-vite.org/config/)

**External Resources:**

- [Electron Vite GitHub](https://github.com/alex8088/electron-vite)
- [Vite Build Options](https://vitejs.dev/config/build-options.html#build-outdir)

## Testing Notes

**How to Verify Fix:**

1. Run `yarn electron:dev` - should start without errors
2. Check that files are built to `dist-electron/main/`, `dist-electron/preload/`, and `dist-electron/renderer/`
3. Verify Electron app window opens successfully
4. Verify preload script loads without errors

**Regression Testing:**

- All existing build processes continue to work
- Production builds still work correctly
- Preload scripts load correctly in both dev and production

---

**Last Updated:** 2024-12-19
**Version Fixed In:** electron-vite 1.0.28
