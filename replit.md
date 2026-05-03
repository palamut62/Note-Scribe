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
- **Word-like formatting**: subscript, superscript, indent/outdent (up to 8 levels), line spacing (1.0–3.0), clear formatting
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
- **Multi-select notes** — checkbox select mode in sidebar; bulk delete, move to folder, add tag
- **Note color labels** — 9 preset color indicators (colored left border) on note cards, set per note
- **TOC panel** — heading-based table of contents panel toggled from toolbar (BookOpen button)
- **Markdown shortcuts** — `==text==` → highlighted text (InputRule)
- **Callout blocks** — Info/Warning/Success/Danger styled blocks via Tiptap Node extension
- **JSON export/import** — full backup (`nootle-backup.json`) & restore from the "..." menu → Yedek
- **Base64 image embedding** — inline images via FloatingImage (data URI, works in JSON export)
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
- `artifacts/notes-app/src/lib/i18n.ts` — TR/EN translations (all feature strings, 200+ keys)
- `artifacts/notes-app/src/lib/use-t.ts` — `useT()` hook for language-aware translation
- `artifacts/notes-app/src/components/editor/indent-extension.ts` — custom TipTap indent/outdent extension
- `artifacts/notes-app/src/components/editor/line-height-extension.ts` — custom TipTap line-spacing extension
- `artifacts/notes-app/src/components/editor/callout-extension.ts` — Tiptap Node for info/warning/success/danger callout blocks
- `artifacts/notes-app/src/components/editor/markdown-shortcuts-extension.ts` — InputRule for ==highlight==
- `artifacts/notes-app/src/components/editor/toc-panel.tsx` — table of contents side panel (live heading tracking)
- `artifacts/notes-app/src/lib/app-state.tsx` — global state + `importNotes` for JSON restore
- `artifacts/notes-app/src/index.css` — all styles including new feature CSS (callout, TOC panel)

**i18n notes:**
- All newly added components use `useT()` for TR/EN language switching: templates-dialog, version-history-dialog, ai-chat-panel, kanban-view, calendar-view, voice-recorder, note-encrypt-dialog
- Templates provide bilingual HTML content via `getContent(lang)` functions
- `kanban-view` uses `DictKey` for column label keys so COLUMNS can be purely static config
- `calendar-view` switches date-fns locale between `dateFnsTr` and `dateFnsEn` based on `settings.language`

**TypeScript notes:**
- Tiptap v3: use `editor.getAttributes('paragraph').textAlign` instead of `isActive({ textAlign })`
- `editor.storage` is Browser Storage — use `useRef` for custom per-editor state
- React 19: `useRef<T>()` returns `RefObject<T | null>`; component props must accept `T | null`
- `useEffect` callbacks with conditional early returns need explicit `return undefined` on all paths
