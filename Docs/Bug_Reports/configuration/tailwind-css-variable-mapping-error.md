---
# Tailwind CSS Variable Mapping Error

## Metadata (AI-Friendly)

```yaml
bug_id: BUG-001
category: configuration
context: tailwind-css/css-variables
severity: critical
status: resolved
priority: high
date_reported: 2024-12-19
date_resolved: 2024-12-19
reporter: AI Agent
resolver: AI Agent
related_files:
  - src/app/globals.css
  - tailwind.config.ts
  - Docs/Configuration_Guide.md
  - .cursor/rules/generate.mdc
  - Docs/Implementation.md
related_bugs: []
tags:
  - tailwind-css
  - css-variables
  - configuration
  - setup-error
  - @apply-directive
tech_stack:
  - nextjs
  - tailwindcss
  - postcss
error_code: "The `border-border` class does not exist"
```

---

## Summary

**One-line description:** Tailwind CSS throws error when using `@apply` with CSS variable-based classes like `border-border` because CSS variables are not mapped in `tailwind.config.ts`.

**Impact:** Prevents application from starting in development mode and breaks build process. Affects all projects using CSS variables with `@apply` directives in `globals.css`.

## Description

When setting up a Next.js project with Tailwind CSS, if `globals.css` defines CSS variables (e.g., `--background`, `--foreground`, `--border`) and uses `@apply` directives with classes like `border-border`, `bg-background`, `text-foreground`, the Tailwind CSS compiler throws an error because these classes are not recognized.

This is a common setup error that occurs when CSS variables are defined in `globals.css` but not mapped to Tailwind color classes in `tailwind.config.ts`. The error prevents the development server from starting and blocks the build process.

## Steps to Reproduce

1. Create a Next.js project with Tailwind CSS
2. Define CSS variables in `globals.css`:
   ```css
   :root {
     --background: 0 0% 100%;
     --foreground: 0 0% 12%;
     --border: 0 0% 90%;
   }
   ```
3. Use `@apply` with CSS variable-based classes in `globals.css`:
   ```css
   * {
     @apply border-border;
   }
   body {
     @apply bg-background text-foreground;
   }
   ```
4. Do NOT map these CSS variables in `tailwind.config.ts`
5. Run `yarn dev` or `next dev`
6. Error occurs: `The 'border-border' class does not exist`

**Expected Behavior:**
The development server should start successfully and Tailwind should recognize the classes.

**Actual Behavior:**
Build process fails with error: `The 'border-border' class does not exist. If 'border-border' is a custom class, make sure it is defined within a '@layer' directive.`

## Environment

- **OS:** Windows 10 (Build 26200), but affects all platforms
- **Node.js:** 18.x / 20.x
- **Package Manager:** Yarn 4.10.3 (node_modules linker)
- **Framework:** Next.js 15.2.3
- **Tailwind CSS:** 3.4.17
- **PostCSS:** 8.5.6
- **Other relevant versions:** React 19.0.0

## Error Messages/Logs

```
⨯ ./src/app/globals.css:1:1
Syntax error: D:\Development\healthtech2\src\app\globals.css The `border-border` class does not exist. If `border-border` is a custom class, make sure it is defined within a `@layer` directive.

No serializer registered for PostCSSSyntaxError
```

## Screenshots/Recordings

N/A - Error occurs during build/development startup

## Root Cause Analysis

**Primary Cause:** CSS variables defined in `globals.css` are not mapped to Tailwind color classes in `tailwind.config.ts`. When Tailwind encounters `@apply border-border`, it tries to find a `border` color class, but since it's not defined in the theme configuration, it fails.

**Contributing Factors:**

1. Common pattern from shadcn/ui and similar component libraries uses CSS variables with `@apply`
2. Documentation often shows CSS variable definitions but may not emphasize the need to map them in Tailwind config
3. TypeScript/ESLint doesn't catch this error - it's a runtime PostCSS/Tailwind compilation error
4. The error message suggests using `@layer` but doesn't explain that the colors need to be mapped in config

**Why it wasn't caught earlier:**

- This is a setup/configuration issue that only appears when first running the dev server
- Static analysis tools don't check CSS variable mapping
- The error message could be clearer about the solution

## Resolution

**Code Changes:**

1. **Updated `tailwind.config.ts`** to map all CSS variables:

```typescript
// Before
colors: {
  primary: { /* ... */ },
  // Missing: background, foreground, border, etc.
}

// After
colors: {
  // Semantic colors using CSS variables
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  surface: "hsl(var(--surface))",
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
  },
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))",
  },
  // ... other colors
}
```

2. **Updated `globals.css`** to include all required CSS variables:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 12%;
  --surface: 0 0% 96%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 12%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 12%;
  --primary: 210 100% 50%;
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 96%;
  --secondary-foreground: 0 0% 12%;
  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 45%;
  --accent: 0 0% 96%;
  --accent-foreground: 0 0% 12%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 0 0% 90%;
  --input: 0 0% 96%;
  --ring: 210 100% 50%;
  --radius: 0.5rem;
}

.dark {
  /* Dark mode values */
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
  /* ... all other dark mode variables */
}
```

**Files Modified:**

- `tailwind.config.ts` - Added semantic color mappings
- `src/app/globals.css` - Added all required CSS variables
- `Docs/Configuration_Guide.md` - Added pitfall section and updated template
- `.cursor/rules/generate.mdc` - Added Tailwind CSS error prevention section
- `Docs/Implementation.md` - Added to error prevention checklist

## Prevention Strategies

1. **Documentation Updates:**
   - Updated `.cursor/rules/generate.mdc` with specific Tailwind CSS error prevention section
   - Updated `Docs/Configuration_Guide.md` with:
     - Updated `tailwind.config.ts` template including all semantic color mappings
     - New pitfall section (Pitfall 6) explaining the issue
     - Prevention checklist
   - Updated `Docs/Implementation.md` error prevention checklist

2. **Checklist Updates:**
   - Added to `Docs/Implementation.md` error prevention checklist: "Tailwind CSS variables mapped"
   - Added to `Docs/Configuration_Guide.md` configuration file checklist

3. **Template Updates:**
   - `tailwind.config.ts` template now includes all required semantic color mappings with comments
   - `globals.css` template includes all required CSS variables

4. **AI Agent Awareness:**
   - Updated generate.mdc rule to explicitly check for this pattern during setup
   - AI will now recognize CSS variables + `@apply` pattern and automatically map them

**Documentation Updates:**

- `.cursor/rules/generate.mdc` - Added "For Tailwind CSS (CRITICAL - Common Setup Error)" section
- `Docs/Configuration_Guide.md` - Updated template and added Pitfall 6
- `Docs/Implementation.md` - Added to error prevention checklist

**Checklist Updates:**

- Configuration File Checklist: Added "Tailwind CSS variables are mapped"
- Error Prevention Checklist: Added "Tailwind CSS variables mapped" item

## Related Information

**Related Documentation:**

- [Configuration Guide - Tailwind CSS Section](../../Configuration_Guide.md#tailwindconfigts)
- [Configuration Guide - Pitfall 6](../../Configuration_Guide.md#pitfall-6-tailwind-css-variable-mapping-error-critical)
- [Implementation Plan - Error Prevention](../../Implementation.md#error-prevention-checklist)
- [Generate Rules - Tailwind CSS Section](../../../.cursor/rules/generate.mdc#for-tailwind-css-critical---common-setup-error)

**External Resources:**

- [Tailwind CSS - Using CSS Variables](https://tailwindcss.com/docs/customizing-colors#using-css-variables)
- [shadcn/ui - Theme Setup](https://ui.shadcn.com/docs/theming)

## Testing Notes

**How to Verify Fix:**

1. Run `yarn dev` - should start without errors
2. Check browser - styles should apply correctly
3. Toggle dark mode - colors should change appropriately
4. Verify all semantic color classes work: `bg-background`, `text-foreground`, `border-border`, etc.

**Regression Testing:**

- All existing components using Tailwind classes continue to work
- Dark mode toggle functions correctly
- Custom colors (primary, success, error) still work as expected
- Build process completes successfully

---

**Last Updated:** 2024-12-19
**Version Fixed In:** Initial setup (Stage 1)
