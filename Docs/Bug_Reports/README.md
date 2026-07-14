# Bug Reports Directory

This directory contains all bug reports organized by context and category for easy reference and AI-assisted debugging.

## Structure

```
Bug_Reports/
├── README.md              # This file - overview and usage guide
├── INDEX.md               # Central index of all bugs (for quick search)
├── TEMPLATE.md            # Template for creating new bug reports
├── nextjs/                # Next.js framework issues
│   └── [descriptive-filename].md
├── amplify/               # AWS Amplify issues
│   └── [descriptive-filename].md
├── typescript/            # TypeScript compiler/type issues
│   └── [descriptive-filename].md
├── packages/              # Package/dependency management issues
│   └── [descriptive-filename].md
├── configuration/         # Configuration file issues
│   └── [descriptive-filename].md
├── ui-ux/                 # UI/UX related issues
│   └── [descriptive-filename].md
├── api/                   # API integration issues
│   └── [descriptive-filename].md
└── general/               # General/uncategorized issues
    └── [descriptive-filename].md
```

## Categories Explained

### nextjs/

Issues related to Next.js framework:

- App Router problems
- Server/Client component errors
- Routing issues
- Build/compilation errors
- Next.js configuration problems

### amplify/

Issues related to AWS Amplify:

- Authentication problems
- GraphQL API issues
- Storage configuration
- Amplify CLI errors
- Backend deployment issues

### typescript/

Issues related to TypeScript:

- Type errors
- Strict mode violations
- Path alias resolution
- Type definition problems
- Compiler configuration issues

### packages/

Issues related to package management:

- Dependency conflicts
- Peer dependency problems
- Version incompatibilities
- Package manager errors (Yarn, npm)
- Module resolution issues

### configuration/

Issues related to configuration files:

- PostCSS config errors
- ESLint configuration problems
- TypeScript config issues
- Next.js config problems
- Environment variable issues

### ui-ux/

Issues related to user interface and experience:

- Responsive design problems
- Dark mode issues
- Accessibility violations
- Animation performance problems
- Component styling issues

### api/

Issues related to API integration:

- CORS errors
- Authentication token issues
- Request/response type mismatches
- Error handling failures
- Network request problems

### general/

General issues that don't fit other categories:

- Development environment problems
- Tooling issues
- General errors not specific to a category

## Usage Guidelines

### Creating a New Bug Report

1. **Identify Category:** Determine which category folder is most appropriate
2. **Get Next Bug ID:** Check `INDEX.md` for the highest bug ID, increment by 1
3. **Create Descriptive Filename (CRITICAL - AI-Friendly):**
   - Create a descriptive filename that explains the bug without opening the file
   - **Format:** `[technology]-[error-type]-[context].md` (lowercase, kebab-case)
   - **Examples:**
     - `tailwind-css-variable-mapping-error.md`
     - `postcss-config-syntax-error.md`
     - `nextjs-server-component-hydration-error.md`
     - `yarn-pnp-amplify-compatibility-issue.md`
   - **Guidelines:**
     - Use kebab-case (lowercase with hyphens)
     - Be specific: include technology name, error type, and context
     - Keep concise but informative (3-6 words typically)
     - Include error type if applicable (`-error`, `-issue`, `-bug`)
4. **Copy Template:** Copy `TEMPLATE.md` to `[category]/[descriptive-filename].md`
5. **Fill Metadata:** Complete all YAML frontmatter fields (including `bug_id: BUG-XXX`)
6. **Fill Details:** Complete all sections with accurate information
7. **Update Index:** Add entry to `INDEX.md` in appropriate section with descriptive filename
8. **Link Files:** Add `related_files` in metadata pointing to actual code files

### Bug ID and Filename Format

**Bug ID (for metadata):**

- **Format:** `BUG-XXX` where XXX is a zero-padded number
- **Examples:** `BUG-001`, `BUG-002`, `BUG-100`
- **Usage:** Only in YAML metadata `bug_id` field, not in filename

**Filename (CRITICAL - Must be descriptive):**

- **Format:** `[descriptive-title].md` (lowercase, kebab-case)
- **Purpose:** Allow AI to understand bug context from filename alone
- **Examples:**
  - `tailwind-css-variable-mapping-error.md` (not `bug-001.md`)
  - `postcss-config-es-module-syntax-error.md` (not `bug-002.md`)
  - `typescript-path-alias-resolution-issue.md` (not `bug-003.md`)
- **Why Descriptive Names:** AI can search and understand bugs without opening files, improving efficiency

### Metadata Best Practices

**Category:** Choose the most specific category. If a bug spans multiple categories, choose the primary one and mention others in tags.

**Context:** Be specific:

- ✅ Good: `nextjs/app-router/server-components`
- ❌ Bad: `nextjs`

**Tags:** Use descriptive tags for searchability:

- `hydration-error`
- `postcss-config`
- `yarn-pnp`
- `authentication`
- `type-error`

**Related Files:** Use full paths from project root:

- ✅ Good: `src/components/ui/button.tsx`
- ❌ Bad: `button.tsx`

**Tech Stack:** List all relevant technologies:

- `["nextjs", "typescript", "yarn", "tailwindcss"]`

### When to Create a Bug Report

Create a bug report when:

- ✅ Encountering an error that blocks development
- ✅ Finding a bug that affects functionality
- ✅ Discovering a configuration issue
- ✅ Identifying a compatibility problem
- ✅ Noticing unexpected behavior
- ✅ Fixing a bug (document the resolution)

Don't create a bug report for:

- ❌ Feature requests (use issue tracker or feature docs)
- ❌ Questions about how something works (use documentation)
- ❌ Planned refactoring work (use task tracking)

## AI-Friendly Structure

This structure is designed to be AI-friendly:

1. **Clear Categorization:** Bugs are organized by context, making it easy to find related issues
2. **Descriptive Filenames:** Bug report filenames are descriptive, allowing AI to understand context without opening files
3. **Rich Metadata:** YAML frontmatter provides structured data for searching
4. **Consistent Format:** All bugs follow the same template
5. **Centralized Index:** `INDEX.md` provides quick overview and search entry point
6. **File References:** `related_files` field links bugs to actual code
7. **Search-Friendly:** Tags, context fields, and descriptive filenames enable semantic search

**Key AI-Friendly Feature: Descriptive Filenames**

- AI can identify bug context from filename alone (e.g., `tailwind-css-variable-mapping-error.md`)
- No need to open files to understand what a bug is about
- Enables faster bug lookup and cross-referencing
- Improves AI agent efficiency when searching for similar issues

## Maintenance

### Regular Updates

- **Daily:** Update bug statuses as work progresses
- **Weekly:** Review open bugs and prioritize
- **After Resolution:** Ensure all resolved bugs are properly documented
- **Periodically:** Archive or consolidate duplicate bugs

### Index Maintenance

The `INDEX.md` file should be kept up-to-date:

- Add new bugs immediately after creation
- Update status changes promptly
- Remove or mark duplicates
- Keep count statistics accurate

## Integration with Workflow

This bug report system integrates with the development workflow:

1. **During Development:** Log bugs as encountered
2. **Before Fixing:** Check for similar bugs in INDEX.md
3. **While Fixing:** Reference related bugs and resolutions
4. **After Fixing:** Document resolution and update status
5. **Prevention:** Update checklists and documentation

See `.cursor/rules/workflow.mdc` for detailed workflow integration.

---

**Last Updated:** 2024-12-19
**Version:** 1.0.0
