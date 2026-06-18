# ShahnBid — Freight Marketplace (MVP)

Dual-inventory freight brokerage marketplace for Morocco. Clients (individuals **or**
businesses) post cargo jobs and carriers bid; carriers also post empty return trips
clients can book directly. Carriers get a live map with on-the-way job suggestions and
opt-in location + Web Push alerts.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Leaflet/OSM · Web Push (VAPID)

> **Status: UX scaffolding phase.** All screens run on **mock data** — there is no
> authentication or database yet. Anyone with the URL can open any portal. Suitable for
> demos/UX review, not for real users. Backend (Entra auth + PostgreSQL/Prisma) comes next.

## Demo accounts (flow validation)

Login authenticates against [`lib/demo-data/accounts.json`](lib/demo-data/accounts.json)
(not real auth — replaced by Entra in the backend phase). Sign in at `/login`:

| Role | Email | Password |
|---|---|---|
| Chargeur (client) | `chargeur@shahnbid.ma` | `Chargeur2026` |
| Transporteur (carrier) | `transporteur@shahnbid.ma` | `Transporteur2026` |
| Admin | `admin@shahnbid.ma` | `Admin2026` |

The portals (`/client`, `/carrier`, `/admin`) require a matching logged-in role;
visiting them while logged out redirects to `/login`.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in VAPID keys (see below)
npm run dev                  # http://localhost:3000
```

Generate Web Push keys:

```bash
npx web-push generate-vapid-keys
```

## Deploy to Vercel

1. Push this repo to GitHub (see below).
2. On [vercel.com](https://vercel.com) → **Add New → Project → Import** this repo.
   Vercel auto-detects Next.js (root directory = repo root). No extra config needed.
3. Add the environment variables below in **Project → Settings → Environment Variables**.
4. **Deploy.** You'll get an HTTPS URL like `https://shahnbid.vercel.app`.

### Required environment variables (Vercel)

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push public key (client-visible) |
| `VAPID_PRIVATE_KEY` | Web Push private key (server only) |
| `VAPID_SUBJECT` | `mailto:admin@shahnbid.ma` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL, e.g. `https://shahnbid.vercel.app` |
| `DEMO_GATE_PASSWORD` | Optional. Set a value to lock the demo behind a shared-password screen; leave unset to disable. |
| `SESSION_SECRET` | Long random string used to sign demo login sessions. Set on the host. |

The Azure/Entra/Postgres variables in `.env.example` are placeholders for the backend
phase and are **not** required for the current mock build.

### Known limitation on serverless (Vercel)

Push subscriptions are kept in an **in-memory store** (`lib/push/store.ts`). On Vercel's
serverless functions this state is **not shared across invocations**, so the
"send test push" round-trip is unreliable in production. Everything else (maps, live
location, nearest-job alerts, all screens) works. The backend phase replaces the
in-memory store with a database table, which fixes this.

## Push to GitHub

```bash
git branch -M main
git remote add origin https://github.com/<you>/shahnbid.git
git push -u origin main
```

`.env.local` is gitignored — your keys are not committed.
