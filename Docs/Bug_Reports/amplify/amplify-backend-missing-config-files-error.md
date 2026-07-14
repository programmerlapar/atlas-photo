---
# Bug Report Template

**IMPORTANT:** Use this template for all new bug reports. Copy this file and fill in the details.

---

## Metadata (AI-Friendly)

```yaml
bug_id: BUG-008
category: amplify
context: amplify/gen2-backend-config
severity: critical
status: resolved
priority: high
date_reported: 2024-12-19
date_resolved: 2024-12-19
reporter: Auto (AI Assistant)
resolver: Auto (AI Assistant)
related_files:
  - amplify/package.json
  - amplify/tsconfig.json
  - amplify/backend.ts
  - Docs/Implementation.md
  - Docs/Configuration_Guide.md
related_bugs: []
tags:
  - amplify
  - gen2
  - backend
  - es-modules
  - configuration
  - missing-files
tech_stack:
  - '@aws-amplify/backend'
  - '@aws-amplify/backend-cli'
  - 'typescript'
  - 'node.js'
  - 'yarn'
error_code: Cannot find module
```

## Summary

**One-line description:** Amplify Gen 2 backend fails with module resolution error when `amplify/package.json` and `amplify/tsconfig.json` configuration files are missing.

**Impact:** Users cannot run Amplify Gen 2 sandbox or backend CLI commands, blocking local development setup. Module imports in `amplify/backend.ts` cannot be resolved.

## Description

When running `npx ampx sandbox` or other Amplify backend CLI commands, Node.js throws a `Cannot find module` error because the `amplify/` directory is missing required configuration files (`package.json` and `tsconfig.json`).

The Amplify Gen 2 backend requires:

1. `amplify/package.json` with `"type": "module"` to enable ES module support
2. `amplify/tsconfig.json` with specific TypeScript compiler options for ES2022 modules

Without these files, the TypeScript compiler and Node.js runtime cannot properly resolve module imports in the `amplify/backend.ts` file and other backend resources.

The error occurs when the backend tries to import local modules:

```
Error: Cannot find module 'D:\Development\ocr-app\amplify\auth\resource' imported from D:\Development\ocr-app\amplify\backend.ts
```

## Steps to Reproduce

1. Set up a new Amplify Gen 2 project with `amplify/backend.ts` and resource files
2. Do not create `amplify/package.json` or `amplify/tsconfig.json` configuration files
3. Run `yarn install` to install dependencies
4. Run `npx ampx sandbox` or `yarn sandbox`
5. Error occurs: `Cannot find module '.../resource'` imported from `backend.ts`

**Expected Behavior:**

- Amplify backend CLI should run successfully
- Module imports in `amplify/backend.ts` should resolve correctly
- Sandbox command should start the local development backend

**Actual Behavior:**

- Node.js throws `Cannot find module` error
- Backend imports cannot be resolved
- Sandbox/backend commands fail during build/assembly phase

## Environment

- **OS:** Windows 10 (10.0.26200)
- **Node.js:** v22.17.1
- **Package Manager:** Yarn (with node_modules linker)
- **Framework:** Next.js 15.0.0
- **Amplify Backend CLI:** @aws-amplify/backend-cli ^1.0.0
- **Amplify Backend:** @aws-amplify/backend ^1.0.0
- **Reference:** Official AWS Amplify template: https://github.com/aws-samples/amplify-next-template

## Error Messages/Logs

```
8:13:28 AM [ERROR] [BackendBuildError] Unable to deploy due to CDK Assembly Error
  ∟ Caused by: [AssemblyError] Assembly builder failed
    ∟ Caused by: [Error] Cannot find module 'D:\Development\ocr-app\amplify\auth\resource' imported from D:\Development\ocr-app\amplify\backend.ts
```

## Root Cause Analysis

- **Primary Cause:** The `amplify/` directory is missing required configuration files:
  - `amplify/package.json` with `"type": "module"` to enable ES module support
  - `amplify/tsconfig.json` with ES2022 module configuration for proper module resolution
- **Contributing Factors:**
  - The implementation plan did not identify these configuration files as required for Amplify Gen 2 backend
  - The Configuration_Guide.md did not include templates for `amplify/package.json` and `amplify/tsconfig.json`
  - These files are separate from the root `package.json` and `tsconfig.json` and serve a different purpose (backend compilation)
  - Amplify Gen 2 backend requires ES module configuration that differs from Next.js App Router configuration
- **Why it wasn't caught earlier:**
  - These configuration files are specific to the Amplify backend directory and not part of standard Next.js setup
  - The Amplify Gen 2 documentation may not explicitly emphasize these files in quick start guides
  - These files are present in official templates but may be overlooked when setting up projects manually

## Resolution

**Solution:** Create `amplify/package.json` and `amplify/tsconfig.json` configuration files with proper ES module settings.

**Files Created:**

1. **`amplify/package.json`:**

```json
{
  "type": "module"
}
```

2. **`amplify/tsconfig.json`:**

```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "paths": {
      "$amplify/*": ["../.amplify/generated/*"]
    }
  }
}
```

**Verification Steps:**

1. Create `amplify/package.json` with `"type": "module"`
2. Create `amplify/tsconfig.json` with ES2022 module configuration
3. Run `yarn install` to ensure dependencies are installed
4. Run `npx ampx sandbox` - should start without module resolution errors
5. Verify that backend resources are created successfully

## Prevention Strategies

1. **Documentation Updates:**
   - Update `Docs/Implementation.md` to include `amplify/package.json` and `amplify/tsconfig.json` as required configuration files
   - Update `Docs/Configuration_Guide.md` to include templates for both files
   - Add note that these are separate from root configuration files

2. **Checklist Updates:**
   - Add to Error Prevention Checklist in Implementation.md:
     - [ ] Verify `amplify/package.json` exists with `"type": "module"`
     - [ ] Verify `amplify/tsconfig.json` exists with ES2022 module configuration
     - [ ] Ensure Amplify backend configuration files are created during Stage 1 setup

3. **Implementation Plan Generator Updates:**
   - Update `generate_v2_apple` rule to automatically include `amplify/package.json` and `amplify/tsconfig.json` when Amplify Gen 2 backend is detected
   - Add these files to the Configuration Files Required section
   - Include templates in Configuration_Guide.md generation

4. **Project Structure Updates:**
   - Update `project_structure.md` to explicitly list `amplify/package.json` and `amplify/tsconfig.json` as required files
   - Document that these files are specific to Amplify backend compilation

5. **Reference Official Template:**
   - Always reference the official AWS Amplify template: https://github.com/aws-samples/amplify-next-template
   - Include these configuration files in initial project setup

## Related Information

**Related Documentation:**

- AWS Amplify Gen 2 Documentation: https://docs.amplify.aws/gen2/
- Official AWS Amplify Next.js Template: https://github.com/aws-samples/amplify-next-template
- TypeScript ES Module Configuration: https://www.typescriptlang.org/docs/handbook/esm-node.html

**External Resources:**

- The official AWS Amplify template includes these configuration files by default
- These files enable ES module support for the Amplify backend compilation process
- The `amplify/` directory requires its own TypeScript configuration separate from the Next.js app configuration

## Testing Notes

**How to Verify Fix:**

1. Ensure `amplify/package.json` exists with `"type": "module"`
2. Ensure `amplify/tsconfig.json` exists with ES2022 module configuration
3. Run `yarn install` to install dependencies
4. Run `npx ampx sandbox` - should start without errors
5. Verify backend resources are created successfully
6. Verify imports in `amplify/backend.ts` resolve correctly

**Regression Testing:**

- Ensure other Amplify CLI commands work (deploy, generate, etc.)
- Verify that adding these files doesn't conflict with root configuration
- Test that backend resources can be imported correctly
- Verify that TypeScript compilation works for backend files

---

**Last Updated:** 2024-12-19
**Version Fixed In:** 1.0.0
