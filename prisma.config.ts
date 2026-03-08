import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadEnvConfig } from '@next/env';
import { defineConfig, env } from 'prisma/config';

const { loadedEnvFiles } = loadEnvConfig(process.cwd(), process.env.NODE_ENV === 'development');
console.info(
  `[${path.basename(fileURLToPath(import.meta.url))}] Environments:`,
  loadedEnvFiles.map((f) => f.path).join(', '),
);

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.mts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
