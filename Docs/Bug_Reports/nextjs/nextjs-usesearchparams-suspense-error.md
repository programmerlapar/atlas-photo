---
bug_id: BUG-005
category: nextjs
context: nextjs/app-router
severity: critical
status: resolved
priority: high
date_reported: 2024-12-19
date_resolved: 2024-12-19
reporter: Roboto (AI Assistant)
resolver: Roboto (AI Assistant)
related_files:
  - app/(auth)/login/page.tsx
  - app/(auth)/verify/page.tsx
  - components/auth/LoginForm.tsx
  - components/auth/ConfirmSignupForm.tsx
related_bugs: []
tags:
  - useSearchParams
  - Suspense
  - static-generation
  - prerendering
tech_stack:
  - nextjs
  - react
  - typescript
error_code: 'useSearchParams() should be wrapped in a suspense boundary at page'
---

## Summary

**One-line description:** Build fails when `useSearchParams()` is used in pages without a Suspense boundary, preventing static generation.

**Impact:** Production builds fail for pages that use `useSearchParams()` without proper Suspense boundaries, preventing deployment.

## Description

When using `useSearchParams()` hook from `next/navigation` in Next.js App Router pages, the build process fails with an error indicating that `useSearchParams()` should be wrapped in a Suspense boundary. This occurs during static page generation because `useSearchParams()` requires client-side rendering, and Next.js needs a Suspense boundary to handle the dynamic nature of search parameters during static generation.

The error affects any page that directly or indirectly (through components) uses `useSearchParams()` without proper Suspense wrapping.

## Steps to Reproduce

1. Create a page or component that uses `useSearchParams()` from `next/navigation`
2. Use the hook directly in the component without wrapping it in a Suspense boundary
3. Run `yarn build` to create a production build
4. Build fails with error: `useSearchParams() should be wrapped in a suspense boundary at page "[route]"`

**Expected Behavior:**
Build should succeed, with pages that use `useSearchParams()` properly wrapped in Suspense boundaries for static generation.

**Actual Behavior:**
Build fails with prerendering errors for pages using `useSearchParams()` without Suspense boundaries.

## Environment

- **OS:** Windows 10 (10.0.26200)
- **Node.js:** [Version from package.json if available]
- **Package Manager:** Yarn
- **Framework:** Next.js 14.2.33
- **React:** [Version from package.json if available]

## Error Messages/Logs

```
⨯ useSearchParams() should be wrapped in a suspense boundary at page "/verify". Read more: https://nextjs.org/messages/missing-suspense-with-csr-bailout
Error occurred prerendering page "/verify".

⨯ useSearchParams() should be wrapped in a suspense boundary at page "/login". Read more: https://nextjs.org/messages/missing-suspense-with-csr-bailout
Error occurred prerendering page "/login".
```

## Root Cause Analysis

**Primary Cause:**
Next.js App Router requires Suspense boundaries when using hooks like `useSearchParams()` because these hooks access browser-only APIs (URL search parameters) that aren't available during static generation. The Suspense boundary tells Next.js to defer rendering the component until the client-side, allowing static generation of the page shell while the dynamic content loads separately.

**Contributing Factors:**

- Direct usage of `useSearchParams()` in page components or components used in pages
- Missing Suspense boundaries in the component tree
- Unawareness of Next.js App Router requirements for static generation

**Why it wasn't caught earlier:**

- Development mode (`yarn dev`) doesn't enforce this requirement as strictly
- The error only appears during production builds with static generation enabled

## Resolution

**Code Changes:**

Wrapped components using `useSearchParams()` in Suspense boundaries at the page level:

**Before (`app/(auth)/login/page.tsx`):**

```typescript
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return <LoginForm />;
}
```

**After (`app/(auth)/login/page.tsx`):**

```typescript
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

function LoginPageContent() {
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
```

**Files Modified:**

- `app/(auth)/login/page.tsx`
- `app/(auth)/verify/page.tsx`

## Prevention Strategies

1. **Always wrap `useSearchParams()` usage in Suspense boundaries** when used in pages that will be statically generated
2. **Create wrapper components** to isolate `useSearchParams()` usage and wrap them in Suspense at the page level
3. **Add ESLint rules** (if available) to detect missing Suspense boundaries for hooks that require them
4. **Test production builds regularly** during development, not just in development mode
5. **Document pattern** in Configuration_Guide.md or project documentation

**Documentation Updates:**

- Add to Bug_tracking.md as a known pattern
- Update project documentation with Next.js App Router requirements

**Checklist Updates:**

- When using `useSearchParams()`, `useRouter()`, or other dynamic hooks, always wrap in Suspense
- Test production builds before deploying
- Review Next.js App Router best practices for static generation

## Related Information

**Related Documentation:**

- [Next.js Documentation - useSearchParams](https://nextjs.org/docs/app/api-reference/functions/use-search-params)
- [Next.js Documentation - Static Generation](https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic-rendering)
- [Next.js Documentation - Suspense](https://nextjs.org/docs/app/api-reference/react/components/suspense)

**External Resources:**

- [Next.js Error: useSearchParams should be wrapped in suspense boundary](https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout)

## Testing Notes

**How to Verify Fix:**

1. Run `yarn build` - should complete successfully
2. Check that both `/login` and `/verify` pages are listed in the build output without errors
3. Verify pages still work correctly in development mode
4. Test that search parameters are still accessible in the components

**Regression Testing:**

- Verify all pages that use `useSearchParams()` are wrapped in Suspense
- Test that authentication flow still works correctly
- Verify redirect functionality using search parameters still works

---

**Last Updated:** 2024-12-19
**Version Fixed In:** Next.js 14.2.33
