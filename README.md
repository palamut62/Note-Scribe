# Note-Scribe

A feature-rich, browser-based rich-text note-taking application with AI assistance, drawing canvas, voice recording, kanban/calendar views, and a Word-style print pipeline. The notes app is a Vite + React + TipTap front end backed by a small Express proxy that brokers calls to OpenRouter and NVIDIA model providers.

> Branding inside the app uses the name **nootle.io**.

---

## Features

### Editing
- **Rich text editor** built on TipTap 3 (StarterKit + extensions)
- **Tables** with header rows, column resizing, cell selection
- **Code blocks** with `lowlight` syntax highlighting
- **Math** via KaTeX (inline and display)
- **Task lists**, checklists, ordered/unordered lists
- **Text alignment**, font family, font size, color, highlight
- **Sub/superscript**, underline, strike-through
- **Custom callouts** (info / warning / success / danger)
- **Wiki-style links** (`[[Note Name]]`) for cross-note references
- **Markdown shortcuts** (`#`, `*`, `-`, `>`, etc.)
- **Auto-correct** (configurable) and find/replace
- **Custom indent** and **line height** extensions
- **Table of contents** panel auto-generated from headings
- **Undo / redo** toolbar
- **Floating images** (drag-resize, free positioning)
- **Floating text boxes** with full rich-text editing inside, free-drag mode and **text-wrap mode** with left/right float

### Document
- **Page-aware layout** with configurable size (A4/Letter/custom), orientation, and margins
- **Header & footer** with three zones (left/center/right), text and image support, and tokens (`{sayfa}`, `{tarih}`, `{başlık}`)
- **Background patterns** (lines / grid / none)
- **Print preview** that matches the editor exactly, with a clean `@media print` pipeline (browser Print → PDF works)
- **Version history** snapshots (save / restore / delete)
- **Templates** to bootstrap new notes
- **Encrypted notes** with password protection (AES-GCM via WebCrypto)

### Organization
- **Folders** and **tags** with a global tag bar and per-tag filtering
- **Sidebar** with multi-select, drag-reorder, and quick actions
- **Tabs** for multiple open notes
- **Three views**: Editor, **Kanban** (todo/in-progress/done/archived), **Calendar**
- **Clipboard history** panel

### AI (BYO-key)
You provide your own OpenRouter and/or NVIDIA API key in Settings. The browser never talks to providers directly — every call is routed through the local Express proxy (`/api/ai-proxy/*`).

- **Fix text** (grammar / spelling)
- **Translate** (any target language)
- **Summarize**
- **Tag suggestions**
- **Word-level autocorrect** (per-word AI)
- **Chat with current note** or **chat across all notes**
- **OCR** (image → text) using NVIDIA Llama 3.2 Vision
- **Voice transcription** using OpenRouter Whisper

### Other
- **Drawing canvas** (pen, eraser, shapes, undo, PNG export)
- **Voice recorder** with playback and transcription
- **Bilingual UI**: Turkish (default) and English (~660 i18n keys)
- **Themes**: light / dark, configurable typography (sans/serif/mono), color scheme
- **Settings dialog** with prompt customization for every AI feature
- **Export**: DOCX (via `docx`), PDF (via browser print), HTML, plain text
- **Import**: DOCX (via `mammoth`)
- **All data is stored in `localStorage`** — fully offline-capable. No backend database, no telemetry, no account.

---

## Architecture

This is a **pnpm workspace monorepo**.

```
Note-Scribe/
├── artifacts/
│   ├── notes-app/          # Vite + React front end (the user-facing app)
│   ├── api-server/         # Express proxy for AI providers
│   └── mockup-sandbox/     # Internal design sandbox (not required to run the app)
├── package.json            # Workspace root
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

### Front end — `artifacts/notes-app`
- **Vite 7** + **React 18** + **TypeScript**
- **TipTap 3** (rich text), **react-rnd** (free drag/resize), **react-hook-form**, **wouter** (routing)
- **TanStack Query** for the AI calls
- **shadcn/ui** + **Radix UI** + **Tailwind CSS 4** (with `@tailwindcss/vite`)
- **lucide-react** + **react-icons** for iconography
- **framer-motion** for animations
- **html2canvas**, **docx**, **mammoth**, **katex**, **lowlight**

### Back end — `artifacts/api-server`
- **Express 5** with `pino` structured logging and `cors`
- Three endpoints, all under `/api/ai-proxy`:
  - `GET  /api/ai-proxy/models?provider=openrouter|nvidia` — lists available models
  - `POST /api/ai-proxy/chat?provider=openrouter|nvidia` — forwards chat completions (forces `stream: false`)
  - `POST /api/ai-proxy/transcribe?provider=openrouter` — Whisper audio transcription
- Bearer token is forwarded as-is from the browser. **Keys are never logged** and never persisted server-side.
- Built with `esbuild` to a single ESM bundle in `dist/`.

### Why a proxy?
- Avoid baking API keys into the client bundle
- Keep request/response shape stable across providers
- Allow large image payloads (`limit: 20mb`) for OCR
- Centralize timeouts (120 s for vision chat, 90 s for audio, 30 s for model lists)

---

## Quick Start

### Prerequisites
- **Node.js 20+** (developed and tested on Node 24)
- **pnpm 10+** — `npm install -g pnpm`

> The repo enforces `pnpm` via a `preinstall` script. `npm install` will be rejected.

### 1. Clone & install

```bash
git clone https://github.com/<your-user>/Note-Scribe.git
cd Note-Scribe
pnpm install
```

The root `package.json` declares `pnpm.supportedArchitectures` covering Windows, Linux, and macOS on x64 and arm64, so platform-specific native binaries (rollup, esbuild, lightningcss, tailwindcss-oxide) install correctly on every OS.

### 2. Build & start the AI proxy (port 3000)

```bash
cd artifacts/api-server
pnpm build
PORT=3000 pnpm start
```

On Windows PowerShell:
```powershell
cd artifacts/api-server
pnpm build
$env:PORT=3000; pnpm start
```

You should see:
```
INFO: Server listening { port: 3000 }
```

### 3. Start the front end (port 5173)

In a second terminal:
```bash
cd artifacts/notes-app
pnpm dev
```

Open <http://localhost:5173>.

The Vite dev server proxies `/api/*` to `http://localhost:3000` automatically (configured in `vite.config.ts`).

### 4. Add your API key
1. Open the app
2. Click **Settings** (gear icon)
3. Pick a provider (**OpenRouter** or **NVIDIA**) and paste your API key
4. Click **Refresh models** and pick one
5. AI features (chat, fix, summarize, OCR, voice transcription, tag suggest) become available

---

## Environment Variables

### `notes-app` (Vite)
| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `PORT` | no | `5173` | Dev server port |
| `BASE_PATH` | no | `/` | Public base path for the build |
| `API_PROXY_TARGET` | no | `http://localhost:3000` | Where Vite forwards `/api/*` in dev |

### `api-server` (Express)
| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `PORT` | **yes** | — | Port to listen on. Throws if missing. |

> The server intentionally has no provider keys — those come from the browser via the `Authorization` header.

---

## Build for Production

```bash
# Workspace-wide build (typecheck + each artifact's build)
pnpm build
```

Or per-artifact:
```bash
cd artifacts/notes-app && pnpm build       # outputs to dist/public
cd artifacts/api-server && pnpm build      # outputs to dist/index.mjs
```

To preview the production front end:
```bash
cd artifacts/notes-app
PORT=5173 BASE_PATH=/ pnpm serve
```

To run the production back end:
```bash
cd artifacts/api-server
PORT=3000 pnpm start
```

In production, terminate TLS in front of both processes and have your reverse proxy route `/api/*` to the api-server, everything else to the static front end build.

---

## Deployment

The `.replit-artifact/artifact.toml` files inside each artifact configure Replit deploys, but the app runs anywhere Node runs. Common targets:

- **Vercel / Netlify**: build `notes-app` only and deploy the api-server separately as a serverless function or a small VPS process.
- **Single VPS**: run both with PM2 or systemd, fronted by Caddy or nginx.
- **Docker**: each artifact is self-contained — write a two-stage Dockerfile per service.

---

## Project Scripts

From the workspace root:
| Command | Effect |
|---------|--------|
| `pnpm install` | Install all dependencies for every workspace package |
| `pnpm build` | Type-check the workspace and run every package's `build` script |
| `pnpm typecheck` | Type-check libraries and all artifacts |

Inside `artifacts/notes-app`:
| Command | Effect |
|---------|--------|
| `pnpm dev` | Start Vite dev server with API proxy |
| `pnpm build` | Production build to `dist/public` |
| `pnpm serve` | Preview the production build |
| `pnpm typecheck` | TypeScript-only check (no emit) |

Inside `artifacts/api-server`:
| Command | Effect |
|---------|--------|
| `pnpm build` | Bundle to `dist/index.mjs` with esbuild |
| `pnpm start` | Run the production bundle |
| `pnpm typecheck` | TypeScript-only check |

---

## Data & Privacy

- All notes, folders, tags, settings, and history are stored in `localStorage`. Clearing browser data wipes the app.
- API keys are stored in `localStorage` under `notes-settings`. Treat them like any browser secret.
- Encrypted notes are encrypted client-side with AES-GCM via WebCrypto. The server never sees note plaintext.
- The api-server forwards your `Authorization` header to OpenRouter / NVIDIA. It does **not** persist requests, responses, or keys. Inspect `artifacts/api-server/src/routes/ai-proxy.ts` to verify.

---

## Tech Stack Summary

| Layer | Stack |
|-------|-------|
| Runtime | Node 20+ |
| Package manager | pnpm 10+ (workspaces) |
| Bundler | Vite 7 (front end), esbuild (back end) |
| UI | React 18, TypeScript 5.9, Tailwind CSS 4, shadcn/ui, Radix UI |
| Editor | TipTap 3 (StarterKit + 25 extensions) |
| AI | OpenRouter, NVIDIA NIM (BYO key) |
| Server | Express 5, pino |
| Storage | `localStorage` only (offline-first) |

---

## Contributing

1. Fork and clone
2. `pnpm install`
3. Make your change in the appropriate `artifacts/*` package
4. `pnpm typecheck` from the workspace root must pass
5. Open a PR

---

## License

MIT — see the `license` field in the workspace `package.json`.
