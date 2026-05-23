import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadEnvConfig } from '@next/env';
import { defineConfig, env } from 'prisma/config';

type DatabaseProvider = 'postgresql' | 'sqlite';

const { loadedEnvFiles } = loadEnvConfig(process.cwd(), process.env.NODE_ENV === 'development');
console.info(
  `[${path.basename(fileURLToPath(import.meta.url))}] Environments:`,
  loadedEnvFiles.map((f) => f.path).join(', '),
);

const databaseProvider = getDatabaseProvider();

export default defineConfig({
  schema: databaseProvider === 'sqlite' ? 'prisma/schema.sqlite.prisma' : 'prisma/schema.prisma',
  migrations: {
    path: databaseProvider === 'sqlite' ? 'prisma/migrations-sqlite' : 'prisma/migrations',
    seed: 'tsx prisma/seed.mts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});

function getDatabaseProvider(): DatabaseProvider {
  const explicitProvider = process.env.DATABASE_PROVIDER?.trim().toLowerCase();
  if (explicitProvider) {
    if (explicitProvider === 'postgres') return 'postgresql';
    if (explicitProvider === 'postgresql' || explicitProvider === 'sqlite') return explicitProvider;
    throw new Error('DATABASE_PROVIDER must be "postgresql" or "sqlite".');
  }

  return process.env.DATABASE_URL?.startsWith('file:') ? 'sqlite' : 'postgresql';
}
