# Backend integration guide

The app is functionally complete on an in-memory data layer. The pieces below need
an external resource (a database, OAuth secrets, payment keys, email/storage
credentials) that must be provisioned before they can be switched on. Each section
is written so it's a contained, low-risk change.

---

## 1. Persistence — Prisma + Postgres  ⭐ highest leverage

**Why it's not done:** needs a provisioned Postgres database (`DATABASE_URL`).

**Seam:** every read/write already goes through `lib/server/*-repo.ts`
(`jobs-repo`, `bids-repo`, `returns-repo`) and `lib/demo-data/accounts.ts`,
`lib/pricing/store.ts`, the notification stores. The API routes and UI never touch
the store directly — so swapping is internal to those files.

**Steps:**
1. Provision Postgres (Vercel Postgres / Neon / Supabase). Set `DATABASE_URL`
   locally (`.env.local`) and on Vercel.
2. `npm install` (pulls in `prisma` + `@prisma/client`, already in `package.json`).
3. `npx prisma migrate dev --name init` — creates the tables from
   `prisma/schema.prisma` (already authored, matches the in-memory models).
4. Add a client singleton at `lib/prisma.ts`:
   ```ts
   import { PrismaClient } from '@prisma/client';
   const g = globalThis as unknown as { prisma?: PrismaClient };
   export const prisma = g.prisma ?? (g.prisma = new PrismaClient());
   ```
5. Reimplement the repo function bodies against `prisma.*` (e.g. `listJobs` →
   `prisma.job.findMany`). Keep the **signatures identical** — nothing else changes.
   Wrap `acceptBid` in `prisma.$transaction` (it mutates a bid + sibling bids + the job).
6. Add `"postinstall": "prisma generate"` to `package.json` scripts so Vercel
   generates the client during install. (Don't add this before step 2 — generating a
   client nobody imports just adds build time.)
7. Seed the demo accounts/jobs with a `prisma/seed.ts` if you want the same demo data.

After this, all "resets on restart / not shared across instances" caveats disappear.

---

## 2. Real authentication (identity provider)

**Done already:** passwords are hashed with scrypt (`lib/auth/password.ts`); the
account store verifies hashes, never plaintext.

**Why the rest isn't done:** a real IdP needs your OAuth secrets. Env placeholders
exist for Microsoft Entra External ID (`ENTRA_*`).

**Steps:** wire NextAuth (or Entra MSAL) as the session provider, replacing the demo
HMAC cookie in `lib/auth/session.ts`. Keep `getCurrentUser()` returning the same
shape so downstream code is unaffected. Move account creation to the IdP callback.

---

## 3. Job lifecycle  ✅ done

Implemented: `ACCEPTED → PICKED_UP → IN_TRANSIT → DELIVERED → COMPLETED`
(`lib/server/jobs-repo.ts` `advanceJobStatus`), role-gated API at
`app/api/jobs/[id]/status`, UI tracker `components/jobs/JobStatusActions.tsx`,
carrier notification on completion. Covered by `tests/marketplace.test.ts`.

---

## 4. Payments & commission capture

**Done already:** the commission **rate is snapshotted at acceptance**
(`commissionRateSnap`) and **commission is captured at completion**
(`commissionCapturedMAD`) using the snapshot — later pricing changes never rewrite
history. The admin commission journal reports per-job snapshot rates.

**Why the rest isn't done:** moving actual money needs a payment provider (Stripe /
CMI / a local PSP) with your API keys.

**Steps:** on bid acceptance create a payment intent for the agreed price; on
`COMPLETED` capture it and trigger carrier payout of `agreedPrice − totalFee`. The
fee math is already in `lib/pricing/store.ts` (`commissionBreakdown`).

---

## 5. Email & file uploads

**Why not done:** needs your service credentials (env placeholders already present).

- **Email** (`AZURE_COMM_CONNECTION_STRING` or `SES_*`): send on registration,
  carrier approval/rejection, bid accepted, status changes. Hook into the existing
  notification stores so in-app + email fire together.
- **File uploads** (`AZURE_STORAGE_*`): cargo photos. `Job.photoUrls` already exists
  in the schema and the type; wire an upload endpoint + the post-job form field.

---

## 6. Tests & hardening  ◑ started

**Done:** Vitest suite (`npm test`) covering password hashing, commission math, bid
acceptance, the lifecycle state machine, and return-trip booking (`tests/`).

**Remaining:** API-route/integration tests, rate-limiting on auth + mutation routes,
and input hardening before a public launch with real users.
