---
# Bug Report Template

**IMPORTANT:** Use this template for all new bug reports. Copy this file and fill in the details.

---

## Metadata (AI-Friendly)

**IMPORTANT - File Naming:**

- This bug report file should be named descriptively, NOT `bug-[id].md`
- **Format:** `[technology]-[error-type]-[context].md` (lowercase, kebab-case)
- **Examples:**
  - `tailwind-css-variable-mapping-error.md`
  - `postcss-config-syntax-error.md`
  - `nextjs-server-component-hydration-error.md`
- **Purpose:** Allow AI to understand bug context from filename alone
- See `Docs/Bug_Reports/README.md` for detailed naming guidelines

```yaml
bug_id: BUG-XXX # Unique bug identifier (for metadata only, NOT in filename)
category: [category] # nextjs, amplify, typescript, packages, configuration, ui-ux, api, general
context: [specific area] # e.g., "nextjs/app-router", "amplify/auth", "typescript/strict-mode"
severity: [severity] # critical, major, minor
status: [status] # open, in-progress, resolved, closed, duplicate
priority: [priority] # high, medium, low
date_reported: YYYY-MM-DD # Date bug was discovered
date_resolved: YYYY-MM-DD # Date bug was fixed (if resolved)
reporter: [name] # Person who reported the bug
resolver: [name] # Person who fixed the bug (if resolved)
related_files: [] # Array of file paths related to the bug
related_bugs: [] # Array of related bug IDs
tags: [] # Array of relevant tags for searching
tech_stack: [] # Technologies involved (e.g., ["nextjs", "typescript", "yarn"])
error_code: '' # Error code or message if applicable
```

## Summary

**One-line description:** [Brief description of the bug]

**Impact:** [Who/what is affected by this bug]

## Description

[Clear, detailed description of the bug]

## Steps to Reproduce

1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Additional steps if needed]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

## Environment

- **OS:** [Operating System and version]
- **Node.js:** [Version]
- **Package Manager:** [Yarn/npm version]
- **Browser:** [Browser and version, if applicable]
- **Framework:** [Next.js version]
- **Other relevant versions:** [List any other relevant versions]

## Error Messages/Logs

```
[Paste error messages or stack traces here]
```

## Screenshots/Recordings

[Links to screenshots, screen recordings, or other visual evidence]

## Root Cause Analysis

[Detailed analysis of why this bug occurred]

- **Primary Cause:** [Main reason]
- **Contributing Factors:** [Other factors that played a role]
- **Why it wasn't caught earlier:** [If applicable]

## Resolution

[Detailed steps taken to fix the bug]

**Code Changes:**

```typescript
// Before
[Problematic code]

// After
[Fixed code]
```

**Files Modified:**

- `path/to/file1.ts`
- `path/to/file2.ts`

## Prevention Strategies

[Steps to prevent similar issues in the future]

1. [Prevention strategy 1]
2. [Prevention strategy 2]
3. [Additional strategies]

**Documentation Updates:**

- [Link to updated documentation]

**Checklist Updates:**

- [Items to add to prevention checklist]

## Related Information

**Related Documentation:**

- [Link to relevant docs]

**Related Issues:**

- [Link to related bugs, GitHub issues, etc.]

**External Resources:**

- [Links to Stack Overflow, GitHub issues, documentation, etc.]

## Testing Notes

**How to Verify Fix:**

1. [Step 1 to verify]
2. [Step 2 to verify]

**Regression Testing:**
[Steps to ensure this fix doesn't break other functionality]

---

**Last Updated:** YYYY-MM-DD
**Version Fixed In:** [Version number, if applicable]
