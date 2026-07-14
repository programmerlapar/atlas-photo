---
# Next.js Route Group Routing Error

## Metadata (AI-Friendly)

```yaml
bug_id: BUG-004
category: nextjs
context: nextjs/app-router-route-groups-parentheses-routing
severity: critical
status: resolved
priority: high
date_reported: 2024-12-19
date_resolved: 2024-12-19
reporter: AI Agent
resolver: AI Agent
related_files:
  - src/lib/constants/routes.ts
  - src/middleware.ts
  - src/components/layout/header.tsx
  - src/components/layout/footer.tsx
  - src/app/(auth)/login/page.tsx
  - src/app/(auth)/signup/page.tsx
related_bugs: []
tags:
  - nextjs
  - app-router
  - route-groups
  - routing
  - parentheses-folders
tech_stack:
  - nextjs
  - app-router
error_code: "404 Not Found or incorrect route paths"
```

---

## Summary

**One-line description:** Route groups (folders with parentheses) in Next.js App Router don't create URL segments, so `(auth)/login` creates `/login` route, not `/auth/login`, causing incorrect route paths throughout the application.

**Impact:** Navigation links, route constants, and middleware redirect to incorrect paths, causing 404 errors or broken navigation.

---

## Detailed Description

### Error Behavior

Routes defined in route groups (folders with parentheses) are accessible at paths **without the group folder name**:

- Folder: `app/(auth)/login/page.tsx` → URL: `/login` (NOT `/auth/login`)
- Folder: `app/(dashboard)/dashboard/page.tsx` → URL: `/dashboard` (NOT `/dashboard/dashboard`)

However, code was using incorrect paths:

- Route constants: `LOGIN: '/auth/login'` (incorrect)
- Middleware: `authRoutes = ["/auth/login", "/auth/signup"]` (incorrect)
- Navigation: `<Link href="/auth/login">` (incorrect)

### Root Cause

Route groups in Next.js App Router (folders with parentheses `(folderName)`) are **organizational only** and do NOT create URL segments. They are used for:

- Organizing routes logically
- Sharing layouts among related routes
- Grouping routes without affecting the URL structure

This is a common misunderstanding where developers think route groups create URL paths, but they don't.

### Affected Components

- `src/lib/constants/routes.ts` - Route constants using incorrect paths
- `src/middleware.ts` - Middleware checking incorrect route paths
- All navigation components using route constants
- All redirects using route constants

---

## Solution

### Immediate Fix

Update all route paths to exclude route group folder names:

1. **Update route constants:**

   ```typescript
   // Before (incorrect)
   export const ROUTES = {
     LOGIN: '/auth/login',
     SIGNUP: '/auth/signup',
   };

   // After (correct)
   export const ROUTES = {
     LOGIN: '/login',
     SIGNUP: '/signup',
   };
   ```

2. **Update middleware:**

   ```typescript
   // Before (incorrect)
   const authRoutes = ['/auth/login', '/auth/signup'];

   // After (correct)
   const authRoutes = ['/login', '/signup'];
   ```

3. **Verify all navigation links** use correct paths (they should use route constants, which are now fixed)

### Verification

After fixing, verify:

1. All navigation links work correctly
2. Middleware redirects work properly
3. Direct URL access works (e.g., `/login` and `/signup` are accessible)
4. No 404 errors when navigating between pages

### Prevention

1. **Understand route groups:** Route groups `(folderName)` are organizational only, not URL segments
2. **Test routes:** Always test routes by accessing the actual URL (without group folder names)
3. **Document routing:** Document the relationship between folder structure and URL paths
4. **Use route constants:** Centralize route definitions in constants file for easy updates
5. **Code review:** Verify route paths match actual URLs during code review

---

## Next.js Route Group Rules

### Route Groups DO:

- Organize routes into logical groups
- Allow sharing layouts among related routes
- Group routes without affecting URLs

### Route Groups DON'T:

- Create URL segments
- Affect the actual route path
- Change how routes are accessed

### Examples

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx      → /login
│   └── signup/
│       └── page.tsx      → /signup
├── (dashboard)/
│   ├── dashboard/
│   │   └── page.tsx      → /dashboard
│   └── scan/
│       └── page.tsx      → /scan
└── page.tsx              → /
```

**Note:** The `(auth)` and `(dashboard)` folders don't appear in the URL paths!

---

## Prevention Checklist

- [x] Understand Next.js route groups don't create URL segments
- [x] Use actual URL paths in route constants
- [x] Test all routes by accessing actual URLs
- [x] Update middleware to use correct paths
- [x] Document route group behavior in project documentation
- [x] Add route group rules to generate.mdc rule file

---

## Related Documentation

- [Next.js Route Groups Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Next.js App Router Routing](https://nextjs.org/docs/app/building-your-application/routing)
- [Project Structure](Docs/project_structure.md)
- [Route Constants](src/lib/constants/routes.ts)

---

## Resolution Notes

**Resolved by:** Updating all route paths to exclude route group folder names

**Resolution Date:** 2024-12-19

**Testing Status:** ✅ Verified - All routes now work correctly

**Files Updated:**

- `src/lib/constants/routes.ts` - Fixed route constants
- `src/middleware.ts` - Fixed route checks
