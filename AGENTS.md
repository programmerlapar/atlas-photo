# Development Workflow and Conventions (Source of Truth)

This file summarizes non-obvious, high-signal developer conventions for working in this monorepo/multi-process Electron application. Always prioritize documented commands over assumption.

### 🚀 Essential Commands & Flow
The workflow must follow a strict order to ensure stability across main (Node.js) and renderer (React/TSX) processes.

**1. Development Sequence:**
*   **Format:** Clean up code style using Prettier: `npm run format`
*   **Check Types & Lint:** Enforce type correctness and linting standards (Required order check): `npm run check`
*   **Start Dev Server:** Choose based on need (`npm run dev` for renderer, `npm run electron:dev` for full stack).

**2. Quality Assurance (QA) / Testing:**
*   **Run Unit Tests:** Run all unit tests defined with Vitest: `npm run test`
*   **Watch Tests:** Use the watcher during development: `npm run test:watch`
*   **Production Build Verification (Critical Path):** This sequence is mandatory to generate correct artifact and ensure compatibility.
    1.  `tsc --noEmit`: Checks for TypeScript errors without emitting files.
    2.  `vite build`: Bundles the renderer assets correctly.

### 📌 Key Architectural Conventions & Quirks
*   **Process Boundaries:** The application follows a multi-process architecture:
    *   **Main Process:** Node.js logic resides primarily in `src/main/index.ts`. Uses IPC handling utility at `src/main/ipc`.
    *   **Renderer Process:** React components are managed by Vite, starting contextually from `App.tsx` and defined in `src/renderer/components`.
*   **State Management:** Use **Zustand** for all global (or component-scoped) state since it is standard across the renderer process (`photoStore.ts`, `filterStore.ts`).
*   **Testing Structure:** Unit tests are contained within `src/renderer/**/__tests__` and utilize `vitest`.
*   **Styling:** Tailwind CSS is the primary styling method, configured via `tailwind.config.ts`.

### ⚠️ Limitations & Gotchas
*   The project uses generated assets (`out/*`) and standard build artifacts (`dist/`). Assume these directories contain necessary compiled code when running certain scripts.

# Global OpenCode Instructions

## Task Completion Contract

For every implementation, debugging, refactoring, or migration task:

1. Create and maintain a todo list for multi-step work.
2. Continue until all requested work is implemented.
3. Do not stop after planning, investigation, or partial edits.
4. Run relevant verification after implementation.
5. Load the `final-review` skill before producing the final response.
6. Fix issues found during final review and repeat verification.
7. Return control only when:
   - the task is complete and verified;
   - a user-controlled decision or resource is required; or
   - a persistent environment failure prevents further progress.

Do not ask for confirmation for reversible code changes or normal
verification commands.

Do not present remaining work as optional next steps when it can be
performed in the current task.