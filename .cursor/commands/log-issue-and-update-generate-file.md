# Log Issue and Update Generate File Command

**Purpose:** Fix an issue, log it to the global bug report, and update `generate.mdc` if the issue could break initial setup.

## Workflow

When you encounter this command, follow the **Error Reporting After Resolution** workflow from `.cursor/rules/workflow.mdc`:

### Step 1: Fix the Issue
- Resolve the reported issue
- Verify the fix works correctly
- Test to ensure no regressions

### Step 2: Categorize the Issue
- **Critical (Would Break Initial Setup):** Issue affects project generation, bootstrap, configuration files, build processes, or core dependencies
- **Non-Critical (Would NOT Break Initial Setup):** Issue affects runtime behavior, UI/UX, or specific features but doesn't prevent initial project setup

### Step 3: Report Based on Category

#### If Critical (Would Break Initial Setup):
1. **Update `generate.mdc`:**
   - Add prevention measures, guardrails, or explicit configuration requirements
   - Cross-reference the bug report in relevant sections (e.g., Zero-Error Bootstrap Guardrails)
   - Ensure future project generation prevents this issue

2. **Create/Update Global Bug Report:**
   - Create bug report in `/Docs/Bug_Reports/[category]/[descriptive-filename].md`
   - Use descriptive filename: `[technology]-[error-type]-[context].md` (e.g., `tailwind-css-v4-postcss-plugin-error.md`)
   - Complete all metadata fields (bug_id, category, severity, status, etc.)
   - Document root cause, resolution, and prevention strategies
   - Update `/Docs/Bug_Reports/INDEX.md` with new bug entry

#### If Non-Critical (Would NOT Break Initial Setup):
1. **Create/Update Global Bug Report Only:**
   - Create bug report in `/Docs/Bug_Reports/[category]/[descriptive-filename].md`
   - Use descriptive filename: `[technology]-[error-type]-[context].md`
   - Complete all metadata fields
   - Document root cause and resolution
   - Update `/Docs/Bug_Reports/INDEX.md` with new bug entry

2. **No generate.mdc update needed** (unless explicitly requested)

### Step 4: Verification Checklist
- [ ] Issue is fixed and verified
- [ ] Issue is categorized correctly (critical vs. non-critical)
- [ ] Bug report created with descriptive filename in appropriate category folder
- [ ] Bug report metadata completed (bug_id, category, severity, status, etc.)
- [ ] `/Docs/Bug_Reports/INDEX.md` updated with new bug entry
- [ ] If critical: `generate.mdc` updated with prevention measures
- [ ] If critical: Bug report cross-referenced in `generate.mdc` where relevant
- [ ] Resolution documented with root cause and prevention strategies
- [ ] Related files listed in bug report metadata

## Reference

See `.cursor/rules/workflow.mdc` section **6.1. Error Reporting After Resolution (CRITICAL)** for complete workflow details.
