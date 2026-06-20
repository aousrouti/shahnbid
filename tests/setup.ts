// Load .env into process.env for the Vitest process so Prisma picks up DATABASE_URL.
import { readFileSync } from 'node:fs';

try {
  const env = readFileSync('.env', 'utf8');
  for (const line of env.split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim().replace(/^"(.*)"$/, '$1');
    if (key && process.env[key] === undefined) process.env[key] = val;
  }
} catch {
  // no .env — DB-backed tests will self-skip
}
