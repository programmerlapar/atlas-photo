---
# Bug Report Template

**IMPORTANT:** Use this template for all new bug reports. Copy this file and fill in the details.

---

## Metadata (AI-Friendly)

```yaml
bug_id: BUG-017
category: amplify
context: amplify/gen2-backend-cli
severity: critical
status: resolved
priority: high
date_reported: 2024-12-19
date_resolved: 2024-12-19
reporter: Auto (AI Assistant)
resolver: Auto (AI Assistant)
related_files:
  - package.json
  - Docs/Implementation.md
  - Docs/Configuration_Guide.md
related_bugs: []
tags:
  - amplify
  - backend-cli
  - aws-cdk-lib
  - peer-dependencies
  - missing-dependency
tech_stack:
  - '@aws-amplify/backend-cli'
  - 'aws-cdk-lib'
  - 'node.js'
  - 'yarn'
error_code: ERR_MODULE_NOT_FOUND
```

## Summary

**One-line description:** Amplify backend CLI fails with `ERR_MODULE_NOT_FOUND` error when `aws-cdk-lib` peer dependency is missing.

**Impact:** Users cannot run Amplify Gen 2 sandbox or backend CLI commands, blocking local development setup.

## Description

When running `npx ampx sandbox` or other Amplify backend CLI commands, Node.js throws an `ERR_MODULE_NOT_FOUND` error because `aws-cdk-lib` is not installed. The `@aws-amplify/backend-cli` package requires `aws-cdk-lib` as a peer dependency, but it's not automatically installed and was not included in the initial project setup.

The error occurs when the CLI tries to import `aws-cdk-lib` from its internal modules:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'aws-cdk-lib' imported from D:\Development\ocr-app\node_modules\@aws-amplify\backend-cli\lib\seed-policy-generation\generate_seed_policy_template.js
```

## Steps to Reproduce

1. Set up a new project with `@aws-amplify/backend-cli` and `@aws-amplify/backend` dependencies
2. Do not include `aws-cdk-lib` in dependencies
3. Run `yarn install` to install dependencies
4. Run `npx ampx sandbox` or `yarn sandbox`
5. Error occurs: `ERR_MODULE_NOT_FOUND` for `aws-cdk-lib`

**Expected Behavior:**

- Amplify backend CLI should run successfully
- Sandbox command should start the local development backend

**Actual Behavior:**

- Node.js throws `ERR_MODULE_NOT_FOUND` error
- CLI cannot find `aws-cdk-lib` package
- Sandbox/backend commands fail immediately

## Environment

- **OS:** Windows 10 (10.0.26200)
- **Node.js:** v22.17.1
- **Package Manager:** Yarn (with node_modules linker)
- **Framework:** Next.js 15.0.0
- **Amplify Backend CLI:** @aws-amplify/backend-cli ^1.0.0
- **Amplify Backend:** @aws-amplify/backend ^1.0.0

## Error Messages/Logs

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'aws-cdk-lib' imported from D:\Development\ocr-app\node_modules\@aws-amplify\backend-cli\lib\seed-policy-generation\generate_seed_policy_template.js
    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:256:9)
    at packageResolve (node:internal/modules/esm/resolve:768:81)
    at moduleResolve (node:internal/modules/esm/resolve:854:18)
    at defaultResolve (node:internal/modules/esm/resolve:984:11)
    at ModuleLoader.defaultResolve (node:internal/modules/esm/loader:780:12)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:704:25)
    at ModuleLoader.resolve (node:internal/modules/esm/loader:687:38)
    at ModuleLoader.getModuleJobForImport (node:internal/modules/esm/loader:305:38)
    at ModuleJob._link (node:internal/modules/esm/module_job:175:49) {
  code: 'ERR_MODULE_NOT_FOUND'
}
```

## Root Cause Analysis

- **Primary Cause:** `aws-cdk-lib` is a peer dependency of `@aws-amplify/backend-cli` but is not automatically installed. The package.json did not include `aws-cdk-lib` in the initial dependency list.
- **Contributing Factors:**
  - Peer dependencies are not automatically installed by npm/yarn (they must be explicitly added)
  - The implementation plan did not identify `aws-cdk-lib` as a required dependency for Amplify Gen 2
  - The Amplify Gen 2 documentation may not explicitly state this dependency requirement
- **Why it wasn't caught earlier:**
  - The dependency compatibility matrix in Implementation.md did not include AWS CDK dependencies
  - The Configuration_Guide.md did not list `aws-cdk-lib` as a required dev dependency

## Resolution

**Solution:** Add `aws-cdk-lib` as a dev dependency in `package.json`.

**Code Changes:**

```json
// package.json - devDependencies
{
  "devDependencies": {
    // ... existing dependencies
    "aws-cdk-lib": "^2.0.0"
    // ... rest of dependencies
  }
}
```

**Files Modified:**

- `package.json` - Added `aws-cdk-lib` to devDependencies

**Verification Steps:**

1. Add `aws-cdk-lib` to `package.json` devDependencies
2. Run `yarn install` to install the dependency
3. Run `npx ampx sandbox` or `yarn sandbox`
4. Verify that the sandbox starts successfully without errors

## Prevention Strategies

1. **Documentation Updates:**
   - Update `Docs/Implementation.md` to include `aws-cdk-lib` in the dependency compatibility matrix
   - Update `Docs/Configuration_Guide.md` to list `aws-cdk-lib` as a required dev dependency for Amplify Gen 2 projects
   - Add note about peer dependencies for Amplify backend CLI

2. **Checklist Updates:**
   - Add to Error Prevention Checklist in Implementation.md:
     - [ ] Verify all peer dependencies for AWS Amplify packages are installed
     - [ ] Include `aws-cdk-lib` when using `@aws-amplify/backend-cli`

3. **Implementation Plan Generator Updates:**
   - Update `generate_v2_apple` rule to automatically include `aws-cdk-lib` when `@aws-amplify/backend-cli` is detected
   - Add check for AWS CDK dependencies when using Amplify Gen 2

4. **Package Installation Verification:**
   - Add verification step in Stage 1 setup to test `yarn sandbox` command
   - Include peer dependency check in dependency verification process

## Related Information

**Related Documentation:**

- AWS Amplify Gen 2 Documentation: https://docs.amplify.aws/gen2/
- AWS CDK Documentation: https://docs.aws.amazon.com/cdk/

**External Resources:**

- AWS Amplify Gen 2 requires AWS CDK under the hood for infrastructure as code
- `@aws-amplify/backend-cli` uses `aws-cdk-lib` for generating CloudFormation templates

## Testing Notes

**How to Verify Fix:**

1. Ensure `aws-cdk-lib` is in `package.json` devDependencies
2. Run `yarn install` to install dependencies
3. Run `npx ampx sandbox` - should start without errors
4. Verify backend resources are created successfully

**Regression Testing:**

- Ensure other Amplify CLI commands work (deploy, generate, etc.)
- Verify that adding `aws-cdk-lib` doesn't conflict with other dependencies
- Test that build process still works correctly

---

**Last Updated:** 2024-12-19
**Version Fixed In:** 1.0.0
