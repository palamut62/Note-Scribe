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
A minimal Apple Notes-inspired note-taking web app.

**Features:**
- Rich text editor powered by TipTap (bold, italic, underline, font family/size, text color, lists, todo lists, text alignment)
- Notebook-style page with optional lined or grid background (28px grid aligned to text baseline)
- Floating, draggable & resizable textboxes (react-rnd) with customizable border, background, text color, font size
- AI text correction via OpenRouter or NVIDIA NIM (user's own API key, model auto-fetched from provider API)
- Save notes as `.txt` or `.md`
- All notes and settings persisted in `localStorage` (no backend needed)
- Settings panel: AI provider/key/model selection, background pattern picker

**Key files:**
- `artifacts/notes-app/src/pages/home.tsx` — main layout
- `artifacts/notes-app/src/components/editor/note-editor.tsx` — TipTap editor + textbox management
- `artifacts/notes-app/src/components/editor/toolbar.tsx` — formatting toolbar + AI fix button
- `artifacts/notes-app/src/components/floating-textbox.tsx` — draggable textbox component
- `artifacts/notes-app/src/components/settings-dialog.tsx` — settings modal
- `artifacts/notes-app/src/components/sidebar.tsx` — note list sidebar
- `artifacts/notes-app/src/lib/app-state.tsx` — global state + localStorage persistence
- `artifacts/notes-app/src/lib/ai.ts` — AI provider API calls (OpenRouter / NVIDIA NIM)
- `artifacts/notes-app/src/lib/export.ts` — .txt and .md file export
- `artifacts/notes-app/src/lib/types.ts` — TypeScript types (Note, TextBox, Settings)
- `artifacts/notes-app/src/index.css` — theme (warm paper/ink palette) + TipTap styles + notebook background patterns
