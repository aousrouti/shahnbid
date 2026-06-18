# ShahnBid — Freight Marketplace · MVP Copilot Spec
## Version 3.0 · June 2026 · Azure / AWS Stack · UX-First Scaffolding

> **How to use this file with Copilot**
> Drop this file at the root of your project. In every VS Code Copilot Chat session,
> start with: `#file:shahnbid_mvp_copilot_spec_v3.md`
> Each section ends with a `<!-- COPILOT TASK -->` comment.
> Trigger it: *"Using section 3, generate prisma/schema.prisma"*

---

## 0. Session Starter Prompts

Copy and paste one of these at the start of every Copilot Chat session.

### UX scaffolding phase (Phases 1–4)
```
#file:shahnbid_mvp_copilot_spec_v3.md

Project: ShahnBid — dual-inventory freight marketplace for Morocco.
Stack: Next.js 14 App Router · TypeScript · Tailwind CSS · shadcn/ui
Cloud: Azure (App Service · PostgreSQL Flexible · Blob Storage · Entra External ID · Communication Services)

UX SCAFFOLDING PHASE — rules for this phase:
- No API calls. No database queries. No auth checks.
- All data comes from mock fixture files in /lib/mock-data/
- Every page imports from mock-data and renders it directly
- Navigation links work. Role-based layouts render without real auth.
- Goal: every screen works in the browser so UX can be reviewed and signed off.

File I need now: [REPLACE THIS LINE]
Use types from section 4. Use component specs from section 10.
Tailwind classes only — no inline styles.
```

### Backend phase (Phase 5 onward)
```
#file:shahnbid_mvp_copilot_spec_v3.md

UX SCAFFOLDING IS COMPLETE. All screens signed off. Switching to backend phase.
Stack:
- Database: Azure Database for PostgreSQL Flexible Server
- ORM: Prisma 5
- Auth: Microsoft Entra External ID (@azure/msal-node, MSAL React)
- Storage: Azure Blob Storage (@azure/storage-blob, SAS tokens)
- Email: Azure Communication Services (@azure/communication-email)
- Deployment: Azure App Service (Node 20 LTS)

Rules:
- Generate Prisma schema first, then Azure helpers, then replace mock data one page at a time.
- Never change component or layout files — only swap the data source.
- Always validate request bodies with Zod before hitting Prisma.
- Always check the user role from the Entra JWT before any DB write.

File I need now: [REPLACE THIS LINE]
```

---

## 1. Project Context

**Platform:** ShahnBid — freight brokerage marketplace, Morocco.
**Two-sided model:** carriers are always professional businesses (B2B supply);
clients can be **businesses (B2B)** shipping commercial cargo **or individuals (B2C)**
shipping personal goods. The `Job`/`Bid`/commission plumbing is identical for both
client types — only the client profile (company fields vs. none) and display name differ.
**Commission:** Platform earns 10% on every completed job.
**Two inventory sources (dual-inventory model):**
- **Path A** — Client posts a cargo job → carriers bid competitively → client accepts best offer.
- **Path B** — Carrier posts an empty return trip at a fixed price → client books directly.

Both paths converge to the same `Job` lifecycle after booking. The completion, status update, and commission logic is shared — Path B is three new screens on top of proven Path A plumbing.

**Three portals:** Client · Carrier · Admin — each with its own route namespace.
**Language:** French (fr) for MVP. Arabic + English in V2.

### What is IN scope for MVP
- Client (individual **or** business): register, post a job, view bids, accept a bid, browse return trips, book a return trip, confirm delivery
- Carrier: register, wait for admin approval, browse job board, bid on jobs, post return trips, update job status
- Admin: approve carriers, view all jobs, view commission log
- Transactional email on 4 key events
- Manual status updates (no real-time GPS)
- French only

### What is OUT of scope (V2)
- Escrow / automated payments
- Real-time GPS tracking
- In-app messaging
- Dispute resolution flow
- Carrier ratings and reviews
- Fleet management module
- Arabic / English i18n
- Analytics dashboard
- SMS notifications

---

## 2. Technology Stack

<!-- COPILOT TASK: When I ask "install dependencies", run the commands in section 13. -->

| Layer | Technology | Azure / AWS service |
|---|---|---|
| Framework | Next.js 14 (App Router) | — |
| Language | TypeScript 5 (strict mode) | — |
| Styling | Tailwind CSS 3 + custom theme | — |
| Components | shadcn/ui + Radix UI | — |
| Forms | react-hook-form + Zod | — |
| Database | PostgreSQL + Prisma 5 | Azure Database for PostgreSQL Flexible Server |
| Auth | MSAL React + @azure/msal-node | Microsoft Entra External ID |
| File storage | @azure/storage-blob (SAS tokens) | Azure Blob Storage |
| Email | @azure/communication-email | Azure Communication Services |
| CI / CD | GitHub Actions | Azure DevOps Pipelines |
| Hosting | Node 20 LTS | Azure App Service |
| Alt. email | aws-sdk/client-ses | Amazon SES (fallback option) |

### Tailwind theme

```ts
// tailwind.config.ts
extend: {
  colors: {
    brand: {
      primary:  '#1A56A3',
      mid:      '#3B7DD8',
      light:    '#E8F0FB',
      navy:     '#1C2B4A',
      bg:       '#F5F8FE',
      border:   '#D0DCF0',
    },
    status: {
      success:  '#0F6E56',
      warning:  '#BA7517',
      danger:   '#A32D2D',
      grey:     '#6B7280',
    }
  },
  fontFamily: { sans: ['Inter', 'sans-serif'] },
  borderRadius: {
    badge: '4px', input: '8px', card: '12px', modal: '16px',
  }
}
```

---

## 3. Database Schema (Prisma)

<!-- COPILOT TASK: When I ask "generate Prisma schema", create prisma/schema.prisma with all models below. Use Azure PostgreSQL connection string from env. -->

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── Enums ──────────────────────────────────────────

enum UserRole {
  CLIENT
  CARRIER
  ADMIN
}

enum ClientType {
  INDIVIDUAL   // B2C — individual consumer shipping personal goods
  BUSINESS     // B2B — company shipping commercial cargo
}

enum CarrierStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
}

enum JobStatus {
  DRAFT
  PUBLISHED
  ACCEPTED
  PICKED_UP
  IN_TRANSIT
  DELIVERED
  COMPLETED
  CANCELLED
}

enum JobSource {
  CLIENT_POSTED   // Path A
  RETURN_TRIP     // Path B
}

enum CargoType {
  GENERAL
  REFRIGERATED
  HAZMAT
  FRAGILE
  OVERSIZED
  LIVESTOCK
}

enum BidStatus {
  PENDING
  ACCEPTED
  REJECTED
  WITHDRAWN
}

enum AvailabilityStatus {
  OPEN
  BOOKED
  EXPIRED
  CANCELLED
}

// ── Models ─────────────────────────────────────────

model Profile {
  id            String   @id @default(uuid())
  entraOid      String   @unique  // Microsoft Entra object ID
  email         String   @unique
  fullName      String
  phone         String
  role          UserRole
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  clientProfile  ClientProfile?
  carrierProfile CarrierProfile?

  @@map("profiles")
}

model ClientProfile {
  id          String     @id @default(uuid())
  profileId   String     @unique
  clientType  ClientType @default(BUSINESS)
  companyName String?    // BUSINESS only
  ice         String?    // BUSINESS only — Moroccan company tax ID (15 digits)
  address     String?    // BUSINESS only
  city        String
  profile     Profile    @relation(fields: [profileId], references: [id])
  jobs        Job[]

  @@map("client_profiles")
}

model CarrierProfile {
  id              String        @id @default(uuid())
  profileId       String        @unique
  companyName     String
  city            String
  licenseNumber   String
  licenseDocUrl   String        // Azure Blob Storage URL
  insuranceDocUrl String        // Azure Blob Storage URL
  insuranceExpiry DateTime
  status          CarrierStatus @default(PENDING)
  approvedAt      DateTime?
  profile         Profile       @relation(fields: [profileId], references: [id])
  bids            Bid[]
  availability    CarrierAvailability[]

  @@map("carrier_profiles")
}

model Job {
  id               String     @id @default(uuid())
  clientProfileId  String
  source           JobSource  @default(CLIENT_POSTED)
  status           JobStatus  @default(DRAFT)
  cargoType        CargoType
  description      String
  weightKg         Float
  fragile          Boolean    @default(false)
  hazmat           Boolean    @default(false)
  originCity       String
  originAddress    String
  originLat        Float?
  originLng        Float?
  destCity         String
  destAddress      String
  destLat          Float?
  destLng          Float?
  pickupDateFrom   DateTime
  pickupDateTo     DateTime
  deliveryDate     DateTime
  notes            String?
  photoUrls        String[]   // Azure Blob Storage URLs
  acceptedBidId    String?    @unique
  carrierProfileId String?    // set directly for RETURN_TRIP (no bid)
  agreedPriceMAD   Float?     // set on booking (both paths)
  commissionMAD    Float?     // 10% of agreedPriceMAD, set on completion
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt

  client           ClientProfile        @relation(fields: [clientProfileId], references: [id])
  bids             Bid[]
  statusHistory    JobStatusHistory[]
  returnTrip       CarrierAvailability? @relation("AvailabilityJob")

  @@map("jobs")
}

model Bid {
  id               String    @id @default(uuid())
  jobId            String
  carrierProfileId String
  priceMAD         Float
  etaDays          Int
  vehicleType      String
  notes            String?
  status           BidStatus @default(PENDING)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  job              Job            @relation(fields: [jobId], references: [id])
  carrier          CarrierProfile @relation(fields: [carrierProfileId], references: [id])

  @@unique([jobId, carrierProfileId])
  @@map("bids")
}

model CarrierAvailability {
  id               String             @id @default(uuid())
  carrierProfileId String
  originCity       String
  destCity         String
  availableDate    DateTime
  capacityKg       Float
  vehicleType      String
  listedPriceMAD   Float
  notes            String?
  status           AvailabilityStatus @default(OPEN)
  bookedJobId      String?            @unique
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt

  carrier          CarrierProfile @relation(fields: [carrierProfileId], references: [id])
  job              Job?           @relation("AvailabilityJob", fields: [bookedJobId], references: [id])

  @@map("carrier_availability")
}

model JobStatusHistory {
  id        String    @id @default(uuid())
  jobId     String
  status    JobStatus
  note      String?
  createdAt DateTime  @default(now())

  job       Job @relation(fields: [jobId], references: [id])

  @@map("job_status_history")
}
```

---

## 4. TypeScript Types

<!-- COPILOT TASK: When I ask "generate types", create lib/types.ts with all interfaces below. -->

```ts
// lib/types.ts

export type UserRole          = 'CLIENT' | 'CARRIER' | 'ADMIN';
export type ClientType        = 'INDIVIDUAL' | 'BUSINESS';   // B2C vs B2B client
export type JobStatus         = 'DRAFT' | 'PUBLISHED' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
export type BidStatus         = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
export type CargoType         = 'GENERAL' | 'REFRIGERATED' | 'HAZMAT' | 'FRAGILE' | 'OVERSIZED' | 'LIVESTOCK';
export type CarrierStatus     = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type JobSource         = 'CLIENT_POSTED' | 'RETURN_TRIP';
export type AvailabilityStatus = 'OPEN' | 'BOOKED' | 'EXPIRED' | 'CANCELLED';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface JobSummary {
  id: string;
  source: JobSource;
  status: JobStatus;
  cargoType: CargoType;
  weightKg: number;
  originCity: string;
  destCity: string;
  pickupDateFrom: string;
  deliveryDate: string;
  bidCount: number;
  agreedPriceMAD?: number;
  createdAt: string;
}

export interface JobDetail extends JobSummary {
  description: string;
  fragile: boolean;
  hazmat: boolean;
  originAddress: string;
  destAddress: string;
  notes?: string;
  photoUrls: string[];
  bids: BidWithCarrier[];
  acceptedBidId?: string;
  client: { clientType: ClientType; companyName?: string; fullName: string; phone: string };
}

export interface ClientProfile {
  id: string;
  profileId: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'CLIENT';
  clientType: ClientType;
  companyName?: string;   // BUSINESS only
  ice?: string;           // BUSINESS only — Moroccan company tax ID (15 digits)
  address?: string;       // BUSINESS only
  city: string;
  createdAt: string;
}

export interface BidWithCarrier {
  id: string;
  priceMAD: number;
  etaDays: number;
  vehicleType: string;
  notes?: string;
  status: BidStatus;
  carrier: { id: string; companyName: string; city: string; phone: string };
  createdAt: string;
}

export interface ReturnTrip {
  id: string;
  carrierId: string;
  carrierName: string;
  carrierCity: string;
  originCity: string;
  destCity: string;
  availableDate: string;
  capacityKg: number;
  vehicleType: string;
  listedPriceMAD: number;
  notes?: string;
  status: AvailabilityStatus;
}

export interface PostJobPayload {
  cargoType: CargoType;
  description: string;
  weightKg: number;
  fragile: boolean;
  hazmat: boolean;
  originCity: string;
  originAddress: string;
  destCity: string;
  destAddress: string;
  pickupDateFrom: string;
  pickupDateTo: string;
  deliveryDate: string;
  notes?: string;
}

export interface SubmitBidPayload {
  jobId: string;
  priceMAD: number;
  etaDays: number;
  vehicleType: string;
  notes?: string;
}

export interface PostReturnTripPayload {
  originCity: string;
  destCity: string;
  availableDate: string;
  capacityKg: number;
  vehicleType: string;
  listedPriceMAD: number;
  notes?: string;
}

export interface RegisterClientPayload {
  clientType: ClientType;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  city: string;
  companyName?: string;   // BUSINESS only
  ice?: string;           // BUSINESS only
  address?: string;       // BUSINESS only
}

export interface RegisterCarrierPayload {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  companyName: string;
  city: string;
  licenseNumber: string;
  insuranceExpiry: string;
}
```

---

## 5. Folder Structure

<!-- COPILOT TASK: When I ask "scaffold project structure", create all folders and index files. -->

```
shahnbid/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                      # Landing page
│   │   ├── login/page.tsx
│   │   └── register/
│   │       ├── client/page.tsx
│   │       └── carrier/page.tsx
│   ├── client/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── jobs/
│   │   │   ├── page.tsx                  # My jobs
│   │   │   ├── new/page.tsx              # Post a job
│   │   │   └── [id]/page.tsx             # Job detail + bids
│   │   ├── returns/page.tsx              # Browse return trips (Path B)
│   │   └── settings/page.tsx
│   ├── carrier/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── jobs/
│   │   │   ├── page.tsx                  # Job board
│   │   │   └── [id]/page.tsx             # Job detail + bid form
│   │   ├── bids/page.tsx
│   │   ├── returns/
│   │   │   ├── page.tsx                  # My return trips
│   │   │   └── new/page.tsx              # Post return trip (Path B)
│   │   └── settings/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── users/page.tsx
│   │   ├── jobs/page.tsx
│   │   └── commission/page.tsx
│   └── api/
│       ├── jobs/
│       │   ├── route.ts                  # GET list / POST create
│       │   └── [id]/
│       │       ├── route.ts              # GET detail / PATCH status
│       │       ├── bids/route.ts         # GET / POST bids
│       │       ├── accept/route.ts       # POST accept bid
│       │       └── complete/route.ts     # POST confirm delivery
│       ├── returns/
│       │   ├── route.ts                  # GET list / POST create
│       │   └── [id]/book/route.ts        # POST book a return trip
│       └── admin/
│           ├── carriers/[id]/approve/route.ts
│           └── commission/route.ts
├── components/
│   ├── ui/                               # shadcn/ui base
│   ├── layout/
│   │   ├── ClientSidebar.tsx
│   │   ├── CarrierSidebar.tsx
│   │   ├── AdminSidebar.tsx
│   │   └── TopBar.tsx
│   ├── jobs/
│   │   ├── JobCard.tsx
│   │   ├── JobTable.tsx
│   │   ├── PostJobForm.tsx
│   │   └── StatusBadge.tsx
│   ├── bids/
│   │   ├── BidCard.tsx
│   │   └── BidForm.tsx
│   ├── returns/
│   │   ├── ReturnTripCard.tsx
│   │   └── PostReturnTripForm.tsx
│   └── shared/
│       ├── DataTable.tsx
│       ├── EmptyState.tsx
│       ├── KpiCard.tsx
│       └── PageHeader.tsx
├── lib/
│   ├── types.ts
│   ├── validations.ts
│   ├── constants.ts
│   ├── utils.ts
│   ├── prisma.ts                         # Prisma singleton (backend phase)
│   ├── mock-data/                        # UX scaffolding phase only
│   │   ├── jobs.ts
│   │   ├── bids.ts
│   │   ├── returns.ts
│   │   └── users.ts
│   └── azure/                            # Backend phase
│       ├── auth.ts                       # Entra External ID helpers
│       ├── storage.ts                    # Blob Storage + SAS tokens
│       └── email.ts                      # Communication Services
├── middleware.ts                         # Route protection (backend phase)
├── prisma/
│   └── schema.prisma
└── .env.local
```

---

## 6. Mock Data (UX Scaffolding Phase)

<!-- COPILOT TASK: When I ask "generate mock data", create all four files in lib/mock-data/ using the types from section 4. -->

### lib/mock-data/jobs.ts
```ts
// 6 mock jobs covering all statuses: PUBLISHED, ACCEPTED, IN_TRANSIT,
// DELIVERED, COMPLETED, CANCELLED.
// Use Moroccan cities from section 11.
// Include realistic cargo descriptions in French.
// Include bidCount: 3 on PUBLISHED jobs, 1 on others.
// One job should have source: 'RETURN_TRIP' with agreedPriceMAD set.
```

### lib/mock-data/bids.ts
```ts
// 3 mock BidWithCarrier objects all linked to job id 'job-001'.
// Statuses: PENDING, ACCEPTED, REJECTED.
// Different carrier names, prices, ETAs.
```

### lib/mock-data/returns.ts
```ts
// 4 mock ReturnTrip objects.
// All status: OPEN.
// Different routes, dates within next 2 weeks, realistic prices.
// Carrier names should sound like Moroccan transport companies.
```

### lib/mock-data/users.ts
```ts
// 1 mock ClientProfile: Casablanca-based company (clientType BUSINESS, with ICE).
// 1 mock ClientProfile: an individual (clientType INDIVIDUAL, no company fields).
// 1 mock CarrierProfile: Casablanca carrier, status APPROVED.
// 1 mock CarrierProfile: Marrakech carrier, status PENDING.
```

---

## 7. Zod Validation Schemas

<!-- COPILOT TASK: When I ask "generate validations", create lib/validations.ts with all schemas below. -->

```ts
// lib/validations.ts
import { z } from 'zod';

// Dual-mode: INDIVIDUAL (B2C) needs no company fields; BUSINESS (B2B) does.
// Kept as a flat object + superRefine so react-hook-form typing stays simple.
export const registerClientSchema = z.object({
  clientType:  z.enum(['INDIVIDUAL', 'BUSINESS']),
  email:       z.string().email('Email invalide'),
  password:    z.string().min(8, 'Minimum 8 caractères'),
  fullName:    z.string().min(2, 'Nom requis'),
  phone:       z.string().regex(/^(\+212|0)[567]\d{8}$/, 'Numéro marocain invalide'),
  city:        z.string().min(2, 'Ville requise'),
  companyName: z.string().optional(),   // BUSINESS only
  ice:         z.string().optional(),   // BUSINESS only
  address:     z.string().optional(),   // BUSINESS only
}).superRefine((d, ctx) => {
  if (d.clientType === 'BUSINESS') {
    if (!d.companyName || d.companyName.trim().length < 2)
      ctx.addIssue({ code: 'custom', path: ['companyName'], message: 'Raison sociale requise' });
    if (!d.ice || !/^\d{15}$/.test(d.ice))
      ctx.addIssue({ code: 'custom', path: ['ice'], message: 'ICE invalide (15 chiffres)' });
    if (!d.address || d.address.trim().length < 5)
      ctx.addIssue({ code: 'custom', path: ['address'], message: 'Adresse requise' });
  }
});

export const registerCarrierSchema = z.object({
  email:           z.string().email('Email invalide'),
  password:        z.string().min(8, 'Minimum 8 caractères'),
  fullName:        z.string().min(2, 'Nom requis'),
  phone:           z.string().regex(/^(\+212|0)[567]\d{8}$/, 'Numéro marocain invalide'),
  companyName:     z.string().min(2, 'Raison sociale requise'),
  city:            z.string().min(2, 'Ville requise'),
  licenseNumber:   z.string().min(3, 'Numéro de licence requis'),
  insuranceExpiry: z.string().refine(
    (d) => new Date(d) > new Date(),
    "L'assurance doit être en cours de validité"
  ),
});

export const postJobSchema = z.object({
  cargoType:      z.enum(['GENERAL','REFRIGERATED','HAZMAT','FRAGILE','OVERSIZED','LIVESTOCK']),
  description:    z.string().min(10).max(500),
  weightKg:       z.number().min(1).max(50000),
  fragile:        z.boolean(),
  hazmat:         z.boolean(),
  originCity:     z.string().min(2),
  originAddress:  z.string().min(5),
  destCity:       z.string().min(2),
  destAddress:    z.string().min(5),
  pickupDateFrom: z.string().refine((d) => new Date(d) >= new Date(), 'Date passée'),
  pickupDateTo:   z.string(),
  deliveryDate:   z.string(),
  notes:          z.string().max(300).optional(),
}).refine(
  (d) => new Date(d.pickupDateTo) >= new Date(d.pickupDateFrom),
  { message: 'Date de fin avant date de début', path: ['pickupDateTo'] }
);

export const submitBidSchema = z.object({
  priceMAD:    z.number().min(100, 'Prix minimum 100 MAD'),
  etaDays:     z.number().int().min(1).max(30),
  vehicleType: z.string().min(2),
  notes:       z.string().max(300).optional(),
});

export const postReturnTripSchema = z.object({
  originCity:      z.string().min(2),
  destCity:        z.string().min(2),
  availableDate:   z.string().refine((d) => new Date(d) >= new Date(), 'Date passée'),
  capacityKg:      z.number().min(100).max(50000),
  vehicleType:     z.string().min(2),
  listedPriceMAD:  z.number().min(100, 'Prix minimum 100 MAD'),
  notes:           z.string().max(300).optional(),
}).refine(
  (d) => d.originCity !== d.destCity,
  { message: 'Origine et destination identiques', path: ['destCity'] }
);

export type RegisterClientInput   = z.infer<typeof registerClientSchema>;
export type RegisterCarrierInput  = z.infer<typeof registerCarrierSchema>;
export type PostJobInput           = z.infer<typeof postJobSchema>;
export type SubmitBidInput         = z.infer<typeof submitBidSchema>;
export type PostReturnTripInput    = z.infer<typeof postReturnTripSchema>;
```

---

## 8. Azure Helper Modules (Backend Phase)

<!-- COPILOT TASK: When I ask "generate Azure helpers", create the three files in lib/azure/. -->

### lib/azure/auth.ts — Entra External ID
```ts
// Responsibilities:
// - getTokenFromRequest(req): extract and validate Entra JWT from Authorization header
//   using @azure/msal-node jwks validation
// - getUserRole(token): return the 'extension_UserRole' custom claim ('CLIENT'|'CARRIER'|'ADMIN')
// - requireRole(req, role): throw 401/403 if token missing or wrong role
// - getUserOid(token): return the 'oid' claim (Entra object ID, matches Profile.entraOid)
//
// Env vars needed:
// ENTRA_TENANT_ID, ENTRA_CLIENT_ID, ENTRA_AUTHORITY
```

### lib/azure/storage.ts — Blob Storage
```ts
// Responsibilities:
// - uploadFile(containerName, blobName, buffer, contentType): upload to Azure Blob, return URL
// - generateSasUrl(containerName, blobName, expiryMinutes): return time-limited read URL
// - deleteBlob(containerName, blobName): delete a blob
//
// Containers: 'job-photos' (job cargo images), 'carrier-docs' (license + insurance)
// Use @azure/storage-blob BlobServiceClient with DefaultAzureCredential
//
// Env vars needed:
// AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY
```

### lib/azure/email.ts — Communication Services
```ts
// Four transactional email functions:

// 1. notifyCarriersNewJob(job, carrierEmails[])
//    Subject: "Nouvelle expédition — {originCity} → {destCity}"
//    Body: cargo, weight, pickup date, link to job board

// 2. notifyClientNewBid(job, bid, carrier, clientEmail)
//    Subject: "Nouvelle offre pour expédition #{jobId}"
//    Body: carrier name, price MAD, ETA, link to job detail

// 3. notifyBidAccepted(job, bid, client, carrier)
//    Send to both parties. Subject: "Confirmation expédition #{jobId}"
//    Body: job details + counterparty phone number

// 4. notifyAdminNewCarrier(carrier, adminEmail)
//    Subject: "Nouveau transporteur en attente d'approbation"
//    Body: company name, city, license number, link to admin users

// Use @azure/communication-email EmailClient
// Env vars needed:
// AZURE_COMM_CONNECTION_STRING, EMAIL_FROM (e.g. noreply@shahnbid.ma)
```

---

## 9. API Routes (Backend Phase)

<!-- COPILOT TASK: When I ask "generate API route [name]", use this table and the pattern below. -->

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register/client | Public | Create Entra user + ClientProfile in DB |
| POST | /api/auth/register/carrier | Public | Create Entra user + CarrierProfile (PENDING) |
| GET | /api/jobs | CARRIER / ADMIN | List PUBLISHED jobs (job board) |
| GET | /api/jobs?clientId=me | CLIENT | List client's own jobs |
| POST | /api/jobs | CLIENT | Create and publish a job |
| GET | /api/jobs/[id] | Any auth | Full job detail with bids |
| PATCH | /api/jobs/[id] | CARRIER | Update status (PICKED_UP / IN_TRANSIT / DELIVERED) |
| POST | /api/jobs/[id]/bids | CARRIER | Submit a bid |
| POST | /api/jobs/[id]/accept | CLIENT | Accept a bid (atomic transaction) |
| POST | /api/jobs/[id]/complete | CLIENT | Confirm delivery, record commission |
| GET | /api/returns | CLIENT / ADMIN | List OPEN return trips |
| POST | /api/returns | CARRIER | Post a new return trip |
| POST | /api/returns/[id]/book | CLIENT | Book a return trip → creates Job |
| GET | /api/admin/carriers | ADMIN | List carriers with status |
| POST | /api/admin/carriers/[id]/approve | ADMIN | Approve carrier |
| GET | /api/admin/commission | ADMIN | Commission log |
| POST | /api/push/subscribe | CARRIER | Register/remove a browser push subscription (Web Push / VAPID) |
| POST | /api/push/send | System | Send a push to matching carriers (triggered on new matching job) |

### Critical transactions

**Accept bid** (`POST /api/jobs/[id]/accept`) must use `prisma.$transaction`:
1. Set winning bid → ACCEPTED
2. Set all other bids on this job → REJECTED
3. Set job.acceptedBidId, job.status → ACCEPTED, job.agreedPriceMAD
4. Write to job_status_history
5. Call notifyBidAccepted email

**Book return trip** (`POST /api/returns/[id]/book`) must use `prisma.$transaction`:
1. Validate availability status === OPEN
2. Create a new Job with source: RETURN_TRIP, status: ACCEPTED, carrierProfileId, agreedPriceMAD
3. Set availability.status → BOOKED, availability.bookedJobId
4. Write to job_status_history
5. Call notifyBidAccepted email (same template, both paths)

**Complete job** (`POST /api/jobs/[id]/complete`):
1. Validate job.status === DELIVERED
2. Calculate commissionMAD = agreedPriceMAD × 0.10
3. Set job.status → COMPLETED, job.commissionMAD
4. Write to job_status_history

---

## 10. Component Specifications

### StatusBadge

```tsx
const STATUS_STYLES: Record<JobStatus, { bg: string; text: string; label: string }> = {
  DRAFT:       { bg: 'bg-gray-100',    text: 'text-gray-600',           label: 'Brouillon' },
  PUBLISHED:   { bg: 'bg-blue-50',     text: 'text-brand-primary',      label: 'Ouvert aux offres' },
  ACCEPTED:    { bg: 'bg-blue-100',    text: 'text-blue-800',           label: 'Transporteur assigné' },
  PICKED_UP:   { bg: 'bg-amber-50',    text: 'text-amber-700',          label: 'Collecté' },
  IN_TRANSIT:  { bg: 'bg-amber-100',   text: 'text-amber-800',          label: 'En transit' },
  DELIVERED:   { bg: 'bg-green-100',   text: 'text-green-800',          label: 'Livré' },
  COMPLETED:   { bg: 'bg-emerald-100', text: 'text-emerald-900',        label: 'Terminé' },
  CANCELLED:   { bg: 'bg-gray-200',    text: 'text-gray-700',           label: 'Annulé' },
};
```

### JobCard
```tsx
interface JobCardProps {
  job: JobSummary;
  variant: 'client' | 'carrier';  // client shows status; carrier shows bid count + time
}
// Show a source badge if job.source === 'RETURN_TRIP': "Retour disponible" in teal
```

### ReturnTripCard (Path B)
```tsx
interface ReturnTripCardProps {
  trip: ReturnTrip;
  onBook: (tripId: string) => void;
  canBook: boolean;
}
// Layout: originCity → destCity (arrow), date, capacity, vehicle type
// Right side: large listedPriceMAD, "Réserver" primary button
// Carrier name + city shown as subtext
```

### BidCard
```tsx
interface BidCardProps {
  bid: BidWithCarrier;
  isAccepted: boolean;
  onAccept: (bidId: string) => void;
  canAccept: boolean;
}
```

### PostReturnTripForm
```tsx
// Fields: originCity (Select), destCity (Select), availableDate (Date),
//         capacityKg (Number), vehicleType (Text), listedPriceMAD (Number), notes (Textarea)
// Validation: postReturnTripSchema
// UX phase: onSubmit logs to console
// Backend phase: calls POST /api/returns
```

### KpiCard
```tsx
interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: number;
  deltaPositive?: boolean;
  icon: React.ComponentType;
}
```

### DataTable
```tsx
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;       // skeleton rows, not spinner
  emptyTitle?: string;
  emptyBody?: string;
  emptyAction?: React.ReactNode;
  selectable?: boolean;
  pageSize?: 10 | 25 | 50;
}
```

---

## 11. Constants

<!-- COPILOT TASK: When I ask "generate constants", create lib/constants.ts. -->

```ts
// lib/constants.ts

export const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir',
  'Meknès', 'Oujda', 'Kénitra', 'Tétouan', 'Safi', 'El Jadida',
  'Nador', 'Béni Mellal', 'Mohammadia', 'Khouribga', 'Settat',
  'Laâyoune', 'Dakhla', 'Taza',
] as const;

export const CARGO_TYPE_LABELS: Record<string, string> = {
  GENERAL:      'Général',
  REFRIGERATED: 'Réfrigéré',
  HAZMAT:       'Matières dangereuses',
  FRAGILE:      'Fragile',
  OVERSIZED:    'Hors gabarit',
  LIVESTOCK:    'Bétail',
};

export const CLIENT_TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL: 'Particulier',
  BUSINESS:   'Entreprise',
};

export const VEHICLE_TYPES = [
  'Camion 3.5T', 'Camion 7.5T', 'Camion 12T', 'Camion 19T',
  'Semi-remorque 26T', 'Camion frigorifique', 'Plateau',
] as const;

export const COMMISSION_RATE = 0.10;
```

---

## 12. Environment Variables

<!-- COPILOT TASK: When I ask "create env file", generate .env.local with these keys. -->

```bash
# .env.local

# Database — Azure PostgreSQL Flexible Server
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/shahnbid?sslmode=require"

# Microsoft Entra External ID
ENTRA_TENANT_ID=
ENTRA_CLIENT_ID=
ENTRA_CLIENT_SECRET=
ENTRA_AUTHORITY=https://login.microsoftonline.com/YOUR_TENANT_ID
NEXT_PUBLIC_ENTRA_CLIENT_ID=
NEXT_PUBLIC_ENTRA_AUTHORITY=

# Azure Blob Storage
AZURE_STORAGE_ACCOUNT_NAME=
AZURE_STORAGE_ACCOUNT_KEY=
AZURE_STORAGE_CONNECTION_STRING=

# Azure Communication Services (email)
AZURE_COMM_CONNECTION_STRING=
EMAIL_FROM=noreply@shahnbid.ma
ADMIN_EMAIL=admin@shahnbid.ma

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Web Push (VAPID) — generate with: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@shahnbid.ma

# AWS SES (alternative email — optional)
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SES_FROM_EMAIL=noreply@shahnbid.ma
```

---

## 13. Quick-start Commands

<!-- COPILOT TASK: When I ask "show quick start", print these commands. -->

```bash
# 1. Create project
npx create-next-app@latest shahnbid \
  --typescript --tailwind --app --eslint --src-dir=false
cd shahnbid

# 2. Install dependencies
npm install \
  prisma @prisma/client \
  react-hook-form zod @hookform/resolvers \
  @azure/msal-node @azure/msal-browser \
  @azure/storage-blob \
  @azure/communication-email \
  class-variance-authority clsx tailwind-merge \
  @tanstack/react-query zustand

# 3. Optional: AWS SES instead of Azure Communication Services
npm install @aws-sdk/client-ses

# 4. Install shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input label select textarea \
  card badge table dialog dropdown-menu

# 5. Init Prisma
npx prisma init --datasource-provider postgresql
# Paste schema from section 3 into prisma/schema.prisma
npx prisma db push
npx prisma generate

# 6. Run dev
npm run dev
```

---

## 14. UX Scaffolding — Screen Checklist

Track progress through the UX phase. All boxes must be checked before backend work starts.

### Public
- [ ] Landing page (`/`) — hero, how-it-works, trust numbers, dual CTA
- [ ] Client registration (`/register/client`)
- [ ] Carrier registration (`/register/carrier`)
- [ ] Login (`/login`)

### Client portal
- [ ] Dashboard (`/client/dashboard`) — KPI cards + recent jobs
- [ ] Post a job (`/client/jobs/new`) — 4-section form, mock submit
- [ ] My jobs (`/client/jobs`) — DataTable with filter + empty state
- [ ] Job detail (`/client/jobs/[id]`) — summary + BidCards + mock accept
- [ ] Browse return trips (`/client/returns`) — ReturnTripCards + city filter

### Carrier portal
- [ ] Dashboard (`/carrier/dashboard`) — KPI cards
- [ ] Job board (`/carrier/jobs`) — JobCards + city filter
- [ ] Job detail (`/carrier/jobs/[id]`) — detail + BidForm mock submit
- [ ] My bids (`/carrier/bids`) — DataTable
- [ ] Post return trip (`/carrier/returns/new`) — PostReturnTripForm mock submit
- [ ] My return trips (`/carrier/returns`) — list of own return trips

### Admin portal
- [ ] Dashboard (`/admin/dashboard`) — hardcoded KPIs
- [ ] Users (`/admin/users`) — carrier approval table, mock buttons
- [ ] Jobs (`/admin/jobs`) — all jobs DataTable
- [ ] Commission (`/admin/commission`) — log + running total

### Navigation
- [ ] Client sidebar all links work
- [ ] Carrier sidebar all links work
- [ ] Admin sidebar all links work
- [ ] Mobile bottom nav renders on all portals
- [ ] All layouts correct on 375px mobile viewport

---

## 15. Build Sequence — 7 Weeks

| Phase | Week | Focus | Output |
|---|---|---|---|
| UX — Design | 1 | Tokens + components + mock data | Tailwind config, all shared components, 4 mock-data files |
| UX — Screens | 1–2 | All pages with mock data | Every route renders, no errors |
| UX — Nav | 2 | Wiring + layouts | Click through entire app, all portals |
| UX — Sign-off | 2 | Review on desktop + mobile | Freeze UX, no layout changes after this point |
| Backend — DB + Auth | 3 | Prisma schema + Azure Entra | DB live, login/register working |
| Backend — Path A | 4–5 | Jobs + bids + emails + admin | Full Path A loop proven end-to-end |
| Backend — Path B + Deploy | 6–7 | Return trips + deploy to Azure | Both paths live on shahnbid.ma |

---

## 16. MVP Success Criteria

Before starting V2:

| Metric | Target |
|---|---|
| Jobs posted | ≥ 10 real client jobs |
| Active carriers | ≥ 3 approved and bidding |
| Return trips posted | ≥ 5 by real carriers |
| Jobs completed end-to-end | ≥ 2 (at least 1 via Path B) |
| Commission collected | ≥ 1 manual invoice paid |
| Time to first bid | < 24 hours after posting |

---

*End of ShahnBid MVP Copilot Spec — v3.0 · Azure / AWS · UX-First*
