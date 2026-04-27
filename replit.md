# Workspace

## Overview

pnpm workspace monorepo hosting **KawaiiGPT** — a web port of the KawaiiGPT anime-girl-themed AI chat (https://github.com/MrSanZz/KawaiiGPT).

## Artifacts

- `artifacts/api-server` (Express 5) — backend serving `/api/healthz`, `/api/models`, `/api/chat/messages` (SSE), `/api/image/generate`. Talks to the OpenAI-compatible Replit AI proxy via `AI_INTEGRATIONS_OPENAI_BASE_URL` + `AI_INTEGRATIONS_OPENAI_API_KEY`.
- `artifacts/kawaiigpt` (React + Vite) — chat UI, model + persona pickers, image-generation mode, gallery (localStorage), about page. Streams chat via custom SSE parser. Uses `react-markdown` + `rehype-highlight` for rich rendering.
- `artifacts/mockup-sandbox` (Vite) — design subagent preview server.

## KawaiiGPT model + persona presets

Defined in `artifacts/api-server/src/lib/personas.ts`:
- Chat models map cute names → upstream OpenAI models: `kawaii-saka-28b`/`kawaii-coder` → `gpt-5.4`, `kawaii-mini` → `gpt-5-mini`, `kawaii-nano` → `gpt-5-nano`, `kawaii-thinker` → `o4-mini`. Reasoning models (`o*` / `*-nano`) get a 32k token budget (their reasoning tokens count toward the budget); others get 8k.
- Image model `kawaii-canvas` → `gpt-image-1`.
- Personas: default kawaii, tsundere, yandere, coding-senpai, roleplay. Each ships a tailored system prompt.

## SSE streaming gotcha

In `routes/chat.ts` we listen on `res.on("close")` (not `req.on("close")`). `req.on("close")` fires as soon as `express.json()` finishes reading the body, which would prematurely set `aborted = true` and cause the upstream stream loop to exit before any tokens arrive.

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
