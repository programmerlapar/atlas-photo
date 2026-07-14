# Quick Start: Bug Reporting System

**Quick reference for using the structured bug reporting system.**

---

## When You Encounter a Bug

### Step 1: Check First

1. **Check `INDEX.md`** for similar bugs
2. Search by:
   - Category (nextjs, amplify, typescript, etc.)
   - Error code or message
   - Technology involved

### Step 2: Create Bug Report (If New)

1. **Determine Category:**
   - `nextjs/` - Next.js framework issues
   - `amplify/` - AWS Amplify issues
   - `typescript/` - TypeScript issues
   - `packages/` - Package management issues
   - `configuration/` - Configuration file issues
   - `ui-ux/` - UI/UX issues
   - `api/` - API integration issues
   - `general/` - General issues

2. **Get Next Bug ID:**
   - Check `INDEX.md` for highest bug ID
   - Add 1 (e.g., if highest is BUG-005, use BUG-006)

3. **Create File (CRITICAL - Descriptive Filename):**
   - Copy `TEMPLATE.md`
   - **Create descriptive filename** (NOT `bug-[id].md`):
     - Format: `[technology]-[error-type]-[context].md` (lowercase, kebab-case)
     - Examples: `tailwind-css-variable-mapping-error.md`, `postcss-config-syntax-error.md`
     - Purpose: Allow AI to understand bug context from filename alone
   - Save as `[category]/[descriptive-filename].md`
   - Fill in metadata (including `bug_id: BUG-XXX`) and details

4. **Update Index:**
   - Add entry to `INDEX.md` in appropriate category section

---

## Bug Report Metadata (Required)

Fill in this metadata at the top of each bug report:

```yaml
bug_id: BUG-XXX
category: [nextjs|amplify|typescript|packages|configuration|ui-ux|api|general]
context: [specific area, e.g., 'nextjs/app-router']
severity: [critical|major|minor]
status: [open|in-progress|resolved|closed]
priority: [high|medium|low]
date_reported: YYYY-MM-DD
reporter: [your name]
related_files: [array of file paths]
related_bugs: [array of related bug IDs]
tags: [array of search tags]
tech_stack: [array of technologies]
error_code: [error code if applicable]
```

---

## Bug Categories Explained

- **nextjs/** - Next.js framework, App Router, Server Components, routing
- **amplify/** - AWS Amplify, Cognito, AppSync, Sandbox
- **typescript/** - TypeScript compiler, types, strict mode, path aliases
- **packages/** - Yarn, npm, dependencies, peer dependencies, versions
- **configuration/** - Config files (PostCSS, ESLint, TypeScript, etc.)
- **ui-ux/** - UI components, styling, dark mode, accessibility
- **api/** - API integration, GraphQL, REST, authentication
- **general/** - Everything else

---

## File Structure

```
Bug_Reports/
├── INDEX.md           # Start here - search for bugs
├── TEMPLATE.md        # Copy this for new bugs
├── README.md          # Complete guide
├── QUICK_START.md     # This file
└── [category]/        # Bug reports by category
    └── [descriptive-filename].md
```

---

## Example: Creating a Bug Report

1. **You encounter an error:** "Cannot find module '@/components/button'"

2. **Check `INDEX.md`:** Search for "typescript" or "path alias" - found similar bug

3. **Create new bug:**
   - Category: `typescript/`
   - Get next ID from INDEX: BUG-003
   - Create descriptive filename: `typescript-path-alias-resolution-error.md`
   - Copy `TEMPLATE.md` to `typescript/typescript-path-alias-resolution-error.md`

4. **Fill metadata:**

   ```yaml
   bug_id: BUG-003
   category: typescript
   context: typescript/path-aliases
   severity: major
   status: open
   priority: high
   date_reported: 2024-12-19
   reporter: Developer Name
   related_files: ['tsconfig.json']
   tags: ['path-alias', 'import-error']
   tech_stack: ['typescript', 'nextjs']
   error_code: "Cannot find module '@/components/button'"
   ```

5. **Fill details:** Steps to reproduce, expected vs actual, etc.

6. **Update `INDEX.md`:** Add entry in TypeScript section

---

## After Fixing a Bug

1. **Update Resolution Section:**
   - Document root cause
   - Include code changes (before/after)
   - List files modified

2. **Update Status:**
   - Set `status: resolved`
   - Add `date_resolved: YYYY-MM-DD`
   - Add `resolver: [your name]`

3. **Update Prevention:**
   - Document prevention steps
   - Note any docs to update

4. **Update `INDEX.md`:**
   - Change status to `resolved`

---

## AI-Friendly Features

This system is designed for AI agents:

- **Descriptive filenames** - AI can understand bug context from filename alone without opening files
- **Rich metadata** for semantic search
- **Context-based organization** by technology
- **Centralized index** for quick reference
- **File references** linking bugs to code
- **Search tags** for filtering
- **Consistent format** across all bugs

---

## Need More Details?

- **Complete Guide:** See `README.md`
- **Bug Tracking Overview:** See `../Bug_tracking.md`
- **Workflow Integration:** See `.cursor/rules/workflow.mdc`
- **Project Structure:** See `../project_structure.md`

---

**Last Updated:** 2024-12-19
