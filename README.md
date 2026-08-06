# PocketBase Next.js Template

A minimal Next.js + React app that talks to PocketBase on your server, with a CRUD playground page to verify create / read / update / delete.

## Prerequisites

1. A running PocketBase instance (see your `pocketbase-new-project-checklist.md` for brown-server / Coolify setup).
2. Node.js 20+.

## Quick start

```bash
cp .env.example .env.local
# Edit NEXT_PUBLIC_POCKETBASE_URL to your instance, e.g. http://10.0.0.222:8091

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## PocketBase collection

In the admin UI (`http://<host>:<port>/_/`), create a collection named `items` (or change `NEXT_PUBLIC_POCKETBASE_COLLECTION`) with:

| Field   | Type | Notes        |
| ------- | ---- | ------------ |
| `title` | text | required     |
| `notes` | text | optional     |
| `done`  | bool | default false |

For local testing, set list / view / create / update / delete API rules to empty (public), or whatever auth model you want to validate next.

If the browser blocks requests, add `http://localhost:3000` under **Settings → Application → CORS**.

## Project layout

- `src/lib/pocketbase.ts` — PocketBase SDK client + collection name
- `src/components/CrudPlayground.tsx` — CRUD UI against the configured collection
- `src/app/page.tsx` — home page hosting the playground

## Scripts

| Command         | Description          |
| --------------- | -------------------- |
| `npm run dev`   | Start Next.js (dev)  |
| `npm run build` | Production build     |
| `npm run start` | Run production build |
| `npm run lint`  | ESLint               |
