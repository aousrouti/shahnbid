# ShahnBid — Freight Marketplace

Dual-inventory freight brokerage for Morocco & international. Clients (individuals **or**
businesses) post cargo jobs and carriers bid; carriers also post empty **return trips**
that clients can book. Includes carrier approval, an admin-set commission/pricing module,
a shipment lifecycle, and multi-channel notifications (in-app, email, WhatsApp).

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · **SQL Server via Prisma** ·
Leaflet/OSM · Web Push (VAPID) · adapters for email (Brevo/SMTP) & WhatsApp (Twilio).

> **Status:** functional MVP on a real database. Persistence, hashed-password auth, the bid
> and returns marketplaces, lifecycle, commission capture, and notifications all work.
> Remaining for production: a managed DB (e.g. Azure SQL), a real identity provider, a
> payment gateway, and verified email/WhatsApp senders — see [docs/BACKEND-INTEGRATION.md](docs/BACKEND-INTEGRATION.md).

## Architecture

- **Data-access layer** (`lib/server/*-repo.ts`, `lib/demo-data/accounts.ts`,
  `lib/pricing/store.ts`, notification/push stores) — all DB access goes through here,
  so routes/UI are decoupled from Prisma.
- **Swappable adapters** (`lib/email`, `lib/whatsapp`, `lib/payments`, `lib/storage`) —
  each picks an implementation from env (console/stub default → real provider), so moving
  to production is config, not code.
- **Validation** — Zod schemas in `lib/validations.ts` on every input.
- **Notifications** — `notifyUser()` fans out to in-app + email + WhatsApp, respecting
  each user's saved channel preferences (WhatsApp opt-in / consent-ready).

## Local setup

Requires Node 20 and a reachable **SQL Server** instance (TCP enabled).

```bash
npm install
cp .env.example .env            # Prisma reads .env; set DATABASE_URL (see below)
npx prisma db push              # create tables in your database
npx tsx prisma/seed.ts          # seed demo accounts, jobs, bids, returns
npm run dev                     # http://localhost:3000
```

`DATABASE_URL` (SQL Server, Windows auth example):
```
sqlserver://localhost:1433;database=ShahnBidDB;integratedSecurity=true;trustServerCertificate=true
```

> Both `.env` (Prisma CLI) and `.env.local` (Next.js runtime) are gitignored. Keep
> `DATABASE_URL` in sync between them, or use `.env` for both.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `start` | Production build / serve |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (unit + DB-backed integration) |
| `npm run db:studio` | Prisma Studio |
| `npx prisma db push` | Sync schema → DB |

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Chargeur (client) | `chargeur@shahnbid.ma` | `Chargeur2026` |
| Transporteur (carrier, approved) | `transporteur@shahnbid.ma` | `Transporteur2026` |
| Admin | `admin@shahnbid.ma` | `Admin2026` |

Passwords are stored hashed (scrypt). Portals (`/client`, `/carrier`, `/admin`) are
role-guarded by middleware.

## Optional providers (free tiers)

All default to a safe local stub; set env vars to go live:

| Channel | Env | Default |
|---|---|---|
| Email | `RESEND_API_KEY` **or** `SMTP_*` (priority: SMTP > Resend > console) | console (logs) |
| WhatsApp | `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_WHATSAPP_FROM` | console (logs) |
| Payments | `STRIPE_SECRET_KEY` | stub (simulated) |
| Push | `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` (`npx web-push generate-vapid-keys`) | — |

Admin dashboard has **"Tester l'email"** and **"Tester WhatsApp"** panels for on-demand checks.

## Testing & CI

`npm test` runs Vitest. DB-backed integration tests self-skip when `DATABASE_URL` is unset
(so CI runs the pure unit tests). [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
runs lint → typecheck → test → build on push/PR.

## Security notes

- Passwords hashed with scrypt; sessions are HMAC-signed cookies (set a strong `SESSION_SECRET`).
- Rate limiting on login/registration (`lib/server/rate-limit.ts`).
- Role-based authorization enforced in middleware and every mutating route.
- Prisma parameterizes all queries (no string-built SQL).
- WhatsApp is opt-in; CGU acceptance is required at registration (timestamp stored).
- **Known:** Next.js 14.2.x has framework advisories fixed in a later major — a planned,
  tested upgrade (don't `audit fix --force` blindly).

## Production path

Provision a managed DB (Azure SQL keeps the schema; or Postgres — schema is the portable
subset), set `DATABASE_URL` + provider keys on the host, add `postinstall: prisma generate`,
and use migrations. Full steps in [docs/BACKEND-INTEGRATION.md](docs/BACKEND-INTEGRATION.md).
App map: [docs/app-map.html](docs/app-map.html).
