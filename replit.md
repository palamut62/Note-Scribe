# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Not Uygulaması (notes-app) — `/`
A full-featured Turkish note-taking web app (nootle.io).

**Features:**
- Rich text editor (TipTap v3): bold, italic, underline, font family/size, text color, lists, todo, text alignment
- Notebook-style page with optional lined/grid background, floating draggable textboxes
- **Folder/notebook system** — create folders, filter notes by folder
- **Templates** — predefined note templates (meeting, todo, diary, blank)
- **Version history** — snapshot timeline with restore
- **Wiki-style note links** — `[[note title]]` auto-links between notes
- **Full-text search** — real-time search across all notes
- **Smart filters & sort** — sort by title/date/updated; pin notes
- **AI chat panel** — per-note AI conversation using OpenRouter/NVIDIA
- **AI auto-summary** — appends AI-generated summary at bottom of note
- **AI tag suggestions** — AI proposes tags based on content
- **LaTeX/math formulas** — KaTeX math insert dialog
- **Code syntax highlighting** — CodeBlockLowlight with common language support
- **Voice recording** — mic capture, attach audio clips to notes
- **Note encryption** — AES-GCM + PBKDF2 password-based encryption
- **Kanban view** — notes displayed as cards in todo/in-progress/done columns
- **Calendar view** — notes displayed on a monthly calendar by creation date
- **View switcher** — Editor / Kanban / Calendar tabs at top
- All data in `localStorage`; no backend required

**Key files:**
- `artifacts/notes-app/src/pages/home.tsx` — main layout + view switcher
- `artifacts/notes-app/src/components/editor/note-editor.tsx` — TipTap editor + all dialogs
- `artifacts/notes-app/src/components/editor/toolbar.tsx` — formatting toolbar + AI buttons
- `artifacts/notes-app/src/components/sidebar.tsx` — note list, search, sort, folders
- `artifacts/notes-app/src/components/kanban-view.tsx` — kanban board
- `artifacts/notes-app/src/components/calendar-view.tsx` — calendar view
- `artifacts/notes-app/src/components/ai-chat-panel.tsx` — AI chat sidebar
- `artifacts/notes-app/src/components/templates-dialog.tsx` — template picker
- `artifacts/notes-app/src/components/version-history-dialog.tsx` — version restore
- `artifacts/notes-app/src/components/voice-recorder.tsx` — audio recording
- `artifacts/notes-app/src/components/note-encrypt-dialog.tsx` — encryption dialog
- `artifacts/notes-app/src/components/editor/wiki-link-extension.ts` — TipTap wiki link decoration
- `artifacts/notes-app/src/lib/app-state.tsx` — global state (notes, folders, versions, search, sort, view)
- `artifacts/notes-app/src/lib/ai.ts` — summarize, suggestTags, chatWithNote
- `artifacts/notes-app/src/lib/crypto.ts` — AES-GCM + PBKDF2 encryption
- `artifacts/notes-app/src/lib/types.ts` — Note, Folder, VersionSnapshot, AudioClip, NoteStatus
- `artifacts/notes-app/src/lib/i18n.ts` — TR/EN translations
- `artifacts/notes-app/src/index.css` — all styles including new feature CSS

**TypeScript notes:**
- Tiptap v3: use `editor.getAttributes('paragraph').textAlign` instead of `isActive({ textAlign })`
- `editor.storage` is Browser Storage — use `useRef` for custom per-editor state
- React 19: `useRef<T>()` returns `RefObject<T | null>`; component props must accept `T | null`
- `useEffect` callbacks with conditional early returns need explicit `return undefined` on all paths
