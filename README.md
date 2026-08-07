# PocketBase Next.js Template

A minimal Next.js + React app that talks to PocketBase on your server, with email/password auth and a CRUD playground to verify create / read / update / delete.

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

## Authentication

The app uses PocketBase’s default auth collection (`users` unless you override `NEXT_PUBLIC_POCKETBASE_AUTH_COLLECTION`):

| Action | PocketBase API |
| ------ | -------------- |
| Sign up | `collection("users").create({ email, password, passwordConfirm })` then `authWithPassword` |
| Sign in | `authWithPassword(email, password)` |
| Forgot password | `requestPasswordReset(email)` |
| Reset password | `/reset-password?token=…` → `confirmPasswordReset(token, password, passwordConfirm)` |
| Session | `pb.authStore` (persisted in the browser) + `authRefresh` on load |

### PocketBase auth setup

1. Open the `users` auth collection in admin (`/_/`).
2. Ensure password auth is enabled.
3. For self-serve sign-up, allow create for guests (or create users only in admin).
4. Configure **Settings → Mail settings** (SMTP) so password-reset emails can send.
5. In the `users` collection mail templates, point the password-reset link at your app, e.g.  
   `http://localhost:3000/reset-password?token={TOKEN}`
6. Add your Next.js origin under **Settings → Application → CORS** (e.g. `http://localhost:3000`).

## PocketBase `items` collection

Create a collection named `items` (or change `NEXT_PUBLIC_POCKETBASE_COLLECTION`) with:

| Field          | Type | Notes                         |
| -------------- | ---- | ----------------------------- |
| `title`        | text | required                      |
| `notes`        | text | optional                      |
| `done`         | bool | default false                 |
| `displayimage` | file | optional; single image upload |

Prefer authenticated API rules for list / view / create / update / delete:

```txt
@request.auth.id != ""
```

## Project layout

- `src/lib/pocketbase.ts` — PocketBase SDK client + collection names
- `src/components/AuthProvider.tsx` — auth session + sign-in/up/reset helpers
- `src/components/AuthForms.tsx` — sign-in, sign-up, forgot password UI
- `src/components/CrudPlayground.tsx` — CRUD UI (shown after sign-in)
- `src/app/reset-password/page.tsx` — password reset confirmation
- `src/app/page.tsx` — home shell that gates the playground on auth

## Scripts

| Command         | Description          |
| --------------- | -------------------- |
| `npm run dev`   | Start Next.js (dev)  |
| `npm run build` | Production build     |
| `npm run start` | Run production build |
| `npm run lint`  | ESLint               |
