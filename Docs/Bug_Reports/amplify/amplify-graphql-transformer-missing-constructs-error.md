---
# Bug Report Template

**IMPORTANT:** Use this template for all new bug reports. Copy this file and fill in the details.

---

## Metadata (AI-Friendly)

```yaml
bug_id: BUG-007
category: amplify
context: amplify/gen2-graphql-transformer
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
related_bugs:
  - BUG-006
tags:
  - amplify
  - graphql-transformer
  - constructs
  - peer-dependencies
  - missing-dependency
tech_stack:
  - '@aws-amplify/graphql-transformer-core'
  - '@aws-amplify/graphql-schema-generator'
  - 'constructs'
  - 'node.js'
  - 'yarn'
error_code: MODULE_NOT_FOUND
```

## Summary

**One-line description:** Amplify GraphQL transformer fails with `MODULE_NOT_FOUND` error when `constructs` peer dependency is missing.

**Impact:** Users cannot run Amplify Gen 2 sandbox or backend CLI commands when using GraphQL features, blocking local development setup.

## Description

When running `npx ampx sandbox` or other Amplify backend CLI commands with GraphQL resources, Node.js throws a `MODULE_NOT_FOUND` error because `constructs` is not installed. The `@aws-amplify/graphql-transformer-core` and related GraphQL packages require `constructs` as a peer dependency, but it's not automatically installed and was not included in the initial project setup.

The error occurs when the GraphQL transformer tries to import `constructs` from its internal modules:

```
Error: Cannot find module 'constructs'
```

The `constructs` library is a foundational package used by AWS CDK for building infrastructure constructs. It's required by Amplify's GraphQL transformer core when generating GraphQL APIs.

## Steps to Reproduce

1. Set up a new project with `@aws-amplify/backend-cli` and `@aws-amplify/backend` dependencies
2. Configure Amplify backend with GraphQL resources or use Amplify's GraphQL schema generation
3. Do not include `constructs` in dependencies
4. Run `yarn install` to install dependencies
5. Run `npx ampx sandbox` or `yarn sandbox`
6. Error occurs: `MODULE_NOT_FOUND` for `constructs`

**Expected Behavior:**

- Amplify backend CLI should run successfully with GraphQL resources
- Sandbox command should start the local development backend
- GraphQL schema generation should work correctly

**Actual Behavior:**

- Node.js throws `MODULE_NOT_FOUND` error for `constructs`
- CLI cannot find `constructs` package
- Sandbox/backend commands fail when GraphQL resources are processed

## Environment

- **OS:** Windows 10 (10.0.26200)
- **Node.js:** v22.17.1
- **Package Manager:** Yarn (with node_modules linker)
- **Framework:** Next.js 15.0.0
- **Amplify Backend CLI:** @aws-amplify/backend-cli ^1.0.0
- **Amplify Backend:** @aws-amplify/backend ^1.0.0
- **Related Packages:**
  - @aws-amplify/graphql-transformer-core
  - @aws-amplify/graphql-schema-generator

## Error Messages/Logs

```
Error: Cannot find module 'constructs'

Require stack:
- D:\Development\ocr-app\node_modules\@aws-amplify\graphql-transformer-core\lib\appsync-function.js
- D:\Development\ocr-app\node_modules\@aws-amplify\graphql-transformer-core\lib\transform-host.js
- D:\Development\ocr-app\node_modules\@aws-amplify\graphql-transformer-core\lib\graphql-api.js
- D:\Development\ocr-app\node_modules\@aws-amplify\graphql-transformer-core\lib\transformation\transform.js
- D:\Development\ocr-app\node_modules\@aws-amplify\graphql-transformer-core\lib\transformation\index.js
- D:\Development\ocr-app\node_modules\@aws-amplify\graphql-transformer-core\lib\index.js
- D:\Development\ocr-app\node_modules\@aws-amplify\graphql-schema-generator\lib\schema-generator\generate-schema.js

    at Function._resolveFilename (node:internal/modules/cjs/loader:1401:15)
    at defaultResolveImpl (node:internal/modules/cjs/loader:1057:19)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1062:22)
    at Function._load (node:internal/modules/cjs/loader:1211:37)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:235:24)
    at Module.require (node:internal/modules/cjs/loader:1487:12)
    at require (node:internal/modules/helpers:135:16)
    at Object.<anonymous> (D:\Development\ocr-app\node_modules\@aws-amplify\graphql-transformer-core\lib\appsync-function.js:5:22)
    at Module._compile (node:internal/modules/cjs/loader:1730:14) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [...]
}
```

## Root Cause Analysis

- **Primary Cause:** `constructs` is a peer dependency of `@aws-amplify/graphql-transformer-core` and related GraphQL packages but is not automatically installed. The package.json did not include `constructs` in the initial dependency list.
- **Contributing Factors:**
  - Peer dependencies are not automatically installed by npm/yarn (they must be explicitly added)
  - The implementation plan did not identify `constructs` as a required dependency for Amplify Gen 2 GraphQL features
  - The Amplify Gen 2 documentation may not explicitly state this dependency requirement for GraphQL transformer
  - This is related to BUG-006 (aws-cdk-lib missing) - both are AWS CDK-related peer dependencies
- **Why it wasn't caught earlier:**
  - The dependency compatibility matrix in Implementation.md did not include AWS CDK peer dependencies for GraphQL transformer
  - The Configuration_Guide.md did not list `constructs` as a required dev dependency
  - This error only occurs when using GraphQL resources or when Amplify's GraphQL transformer is invoked

## Resolution

**Solution:** Add `constructs` as a dev dependency in `package.json`.

**Code Changes:**

```json
// package.json - devDependencies
{
  "devDependencies": {
    // ... existing dependencies
    "aws-cdk-lib": "^2.0.0",
    "constructs": "^10.3.0"
    // ... rest of dependencies
  }
}
```

**Files Modified:**

- `package.json` - Added `constructs` to devDependencies

**Verification Steps:**

1. Add `constructs` to `package.json` devDependencies
2. Run `yarn install` to install the dependency
3. Run `npx ampx sandbox` or `yarn sandbox`
4. Verify that the sandbox starts successfully without errors
5. Verify that GraphQL resources are processed correctly (if applicable)

## Prevention Strategies

1. **Documentation Updates:**
   - Update `Docs/Implementation.md` to include `constructs` in the dependency compatibility matrix
   - Update `Docs/Configuration_Guide.md` to list `constructs` as a required dev dependency for Amplify Gen 2 projects using GraphQL
   - Add note about peer dependencies for Amplify GraphQL transformer packages

2. **Checklist Updates:**
   - Add to Error Prevention Checklist in Implementation.md:
     - [ ] Verify all peer dependencies for AWS Amplify packages are installed
     - [ ] Include `aws-cdk-lib` when using `@aws-amplify/backend-cli`
     - [ ] Include `constructs` when using Amplify GraphQL features or `@aws-amplify/graphql-transformer-core`

3. **Implementation Plan Generator Updates:**
   - Update `generate_v2_apple` rule to automatically include `constructs` when Amplify GraphQL features are detected
   - Add check for AWS CDK peer dependencies (`aws-cdk-lib`, `constructs`) when using Amplify Gen 2

4. **Package Installation Verification:**
   - Add verification step in Stage 1 setup to test `yarn sandbox` command
   - Include peer dependency check for all AWS CDK-related packages (`aws-cdk-lib`, `constructs`)
   - Document that these dependencies are required even if not explicitly used

5. **Group Related Dependencies:**
   - Document that `aws-cdk-lib` and `constructs` are both required AWS CDK peer dependencies
   - Include both in dependency compatibility matrix when using Amplify Gen 2
   - Consider them as a set: if using Amplify backend CLI, include both dependencies

## Related Information

**Related Documentation:**

- AWS Amplify Gen 2 Documentation: https://docs.amplify.aws/gen2/
- AWS CDK Documentation: https://docs.aws.amazon.com/cdk/
- Constructs Library: https://github.com/aws/constructs

**Related Issues:**

- BUG-006: Amplify Backend CLI Missing aws-cdk-lib Error (similar peer dependency issue)
- Both `aws-cdk-lib` and `constructs` are AWS CDK foundational packages required by Amplify Gen 2

**External Resources:**

- AWS Amplify Gen 2 uses AWS CDK under the hood for infrastructure as code
- `@aws-amplify/graphql-transformer-core` uses `constructs` for building AppSync constructs
- `constructs` is the foundational library for AWS CDK construct programming model

## Testing Notes

**How to Verify Fix:**

1. Ensure `constructs` is in `package.json` devDependencies
2. Run `yarn install` to install dependencies
3. Run `npx ampx sandbox` - should start without errors
4. Verify backend resources are created successfully
5. Verify GraphQL schema generation works (if using GraphQL features)

**Regression Testing:**

- Ensure other Amplify CLI commands work (deploy, generate, etc.)
- Verify that adding `constructs` doesn't conflict with other dependencies
- Test that build process still works correctly
- Verify that both `aws-cdk-lib` and `constructs` work together (they are complementary)

---

**Last Updated:** 2024-12-19
**Version Fixed In:** 1.0.0
