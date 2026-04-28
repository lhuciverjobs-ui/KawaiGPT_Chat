# Workspace

## Overview

pnpm workspace monorepo for **KawaiiGPT** web app.

## Packages

- `artifacts/api-server` (Express 5): `/api/healthz`, `/api/models`, `/api/chat/messages` (SSE), `/api/image/generate`
- `artifacts/kawaiigpt` (React + Vite): chat UI, model/persona picker, image mode, gallery, about page
- `artifacts/mockup-sandbox` (Vite): UI sandbox
- `lib/api-spec`, `lib/api-zod`, `lib/api-client-react`: API contract and generated client/types
- `lib/db`: database package scaffold

## Runtime config

For local API runtime, use `artifacts/api-server/.env`:

- `OPENAI_BASE_URL`
- `OPENAI_API_KEY`
- optional: `OPENROUTER_HTTP_REFERER`, `OPENROUTER_X_TITLE`
- optional: `PORT` (default `3001`)

Frontend dev server proxies `/api` to `http://localhost:3001` by default.

## Commands

- `corepack pnpm install`
- `corepack pnpm run dev`
- `corepack pnpm run dev:web`
- `corepack pnpm run dev:api`
- `corepack pnpm run typecheck`
- `corepack pnpm run build`
