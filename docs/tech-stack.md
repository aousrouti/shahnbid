# ShahnBid — Technology Stack

One-page reference of the stack powering the app. Live at `shahnbid.vercel.app`.

## Frontend
| Tech | Version | Role |
|---|---|---|
| Next.js (App Router) | 14.2.29 | Framework — Server Components, route handlers, middleware |
| React / React DOM | 18 | UI runtime |
| TypeScript | 5 | Language (strict) |
| Tailwind CSS | 3.4 | Styling (+ PostCSS, Autoprefixer) |
| react-hook-form + @hookform/resolvers | 7.53 | Forms |
| Zod | 3.23 | Schema validation (client + server) |
| Leaflet + react-leaflet | 1.9 / 4.2 | Carrier live map (OpenStreetMap) |
| lucide-react, clsx, tailwind-merge, cva | — | Icons & styling utilities |

## Backend / runtime
| Tech | Role |
|---|---|
| Next.js route handlers (Node runtime) | REST-style API under `app/api/*` |
| Zod | Validation on every endpoint |
| Node `crypto` (scrypt) | Password hashing |
| HMAC-signed cookies | Sessions (`lib/auth/session.ts`) |
| In-memory rate limiter | Auth brute-force protection |

## Database / ORM
| Tech | Version | Role |
|---|---|---|
| PostgreSQL (Neon, serverless) | 16 | Primary database |
| Prisma (`@prisma/client` + CLI) | 5.22 | ORM, schema, migrations |

Datasource uses a **pooled** `url` (runtime) + **direct** `directUrl` (migrations).
Data access is isolated in `lib/server/*-repo.ts` + the account/pricing/notification stores.

## Integrations (swappable adapters — env-selected)
| Concern | Provider | Library | Fallback |
|---|---|---|---|
| Email | Brevo (SMTP) | nodemailer 9.0 | Resend / console |
| WhatsApp | Twilio | fetch | console |
| Web Push | VAPID | web-push 3.6 | — |
| Payments | (Stripe-ready) | — | stub |
| File storage | (Azure Blob-ready) | — | local disk |

## Tooling & quality
| Tech | Role |
|---|---|
| ESLint (eslint-config-next) | Linting |
| TypeScript `tsc --noEmit` | Type checking |
| Vitest 2.1 | Unit + DB-integration tests |
| tsx | Run TS scripts (DB seed) |
| GitHub Actions | CI: lint → typecheck → test → build |

## Hosting & infrastructure
| Tech | Role |
|---|---|
| Vercel | Hosting (serverless, auto-deploy from `main`) |
| Neon | Managed PostgreSQL |
| GitHub (`aousrouti/shahnbid`) | Source control + CI |
| Node | 20.x |

## Architecture patterns
- **Repository / data-access layer** — routes & UI never touch Prisma directly.
- **Provider adapters** — email / WhatsApp / payments / storage chosen at runtime via env, so prod swaps are config not code.
- **Role-based auth** — middleware guards `/client`, `/carrier`, `/admin`; per-route ownership checks.
- **Unified notifications** — one `notifyUser()` fans out to in-app + email + WhatsApp, honoring per-user channel preferences (consent-ready).
- **Commission integrity** — rate snapshotted at bid acceptance, captured at completion.

See also: [app-map.html](app-map.html) (swim lanes) · [BACKEND-INTEGRATION.md](BACKEND-INTEGRATION.md) · [flow-map.html](flow-map.html).
