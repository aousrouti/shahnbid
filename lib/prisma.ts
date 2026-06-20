// Prisma client singleton. Reused across HMR in dev so we don't exhaust
// connections. Imported by the data-access layer (lib/server/*-repo.ts) once the
// repos are swapped from the in-memory maps to the database.
import { PrismaClient } from '@prisma/client';

const g = globalThis as unknown as { __shahnbidPrisma?: PrismaClient };

export const prisma: PrismaClient = g.__shahnbidPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') g.__shahnbidPrisma = prisma;
