import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { afterEach, beforeEach, vi } from 'vitest';

vi.hoisted(() => {
  const env = process.env as Record<string, string | undefined>;
  env.DATABASE_PROVIDER ??= 'postgresql';
  env.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5432/postgres';
});

import { setPrismaClient } from '@/lib/db/prisma';
import { PrismaClient } from '@/lib/db/prisma-client/postgresql/client';
import { PrismaClient as SqlitePrismaClient } from '@/lib/db/prisma-client/sqlite/client';
import { DEFAULT_ENVIRONMENTS } from '@/lib/definitions';

vi.mock('server-only', () => ({}));
vi.mock('client-only', () => ({}));
vi.mock('next/cache');
vi.mock('next/headers');
vi.mock('next/navigation');
vi.mock('next/server');

let container: StartedPostgreSqlContainer | undefined;
let sqliteTestDir: string | undefined;
let prisma: PrismaClient | undefined;
const PG_VERSION = '16-alpine';
const containerImage = `postgres:${PG_VERSION}`;
const TEST_USER_ID = 'test-user-id';

beforeEach(async () => {
  if (process.env.TEST_DATABASE_PROVIDER === 'sqlite') {
    await setupSqliteDatabase();
    return;
  }

  try {
    container = await new PostgreSqlContainer(containerImage).start();
  } catch (err) {
    if (process.env.TEST_DATABASE_PROVIDER === 'postgresql') {
      console.error('Is Docker running?');
      throw err;
    }

    await setupSqliteDatabase();
    return;
  }

  const connectionString = container.getConnectionUri();
  prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  setPrismaClient(prisma);

  applyMigrations(connectionString, 'postgresql');
  await seedDefaultEnvironments(prisma);
  await seedTestUser(prisma);
}, 30_000);

afterEach(async () => {
  await prisma?.$disconnect();
  await container?.stop();
  if (sqliteTestDir) fs.rmSync(sqliteTestDir, { force: true, recursive: true });

  container = undefined;
  sqliteTestDir = undefined;
  prisma = undefined;
});

function applyMigrations(databaseUrl: string, databaseProvider: 'postgresql' | 'sqlite') {
  execSync('npx --no prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_PROVIDER: databaseProvider, DATABASE_URL: databaseUrl },
  });
}

async function setupSqliteDatabase() {
  sqliteTestDir = fs.mkdtempSync(path.join(os.tmpdir(), 'next-secrets-integration-'));
  const sqlitePath = path.join(sqliteTestDir, 'test.db');
  fs.closeSync(fs.openSync(sqlitePath, 'w'));
  const databaseUrl = `file:${sqlitePath}`;

  prisma = new SqlitePrismaClient({
    adapter: new PrismaBetterSqlite3({ url: databaseUrl }),
  }) as unknown as PrismaClient;

  setPrismaClient(prisma);
  applyMigrations(databaseUrl, 'sqlite');
  await seedDefaultEnvironments(prisma);
  await seedTestUser(prisma);
}

async function seedDefaultEnvironments(client: PrismaClient) {
  for (const env of DEFAULT_ENVIRONMENTS) {
    await client.environment.upsert({
      where: { id: env.id },
      update: {},
      create: {
        id: env.id,
        name: env.name,
        description: '',
      },
    });
  }
}

async function seedTestUser(client: PrismaClient) {
  await client.user.upsert({
    where: { id: TEST_USER_ID },
    update: {},
    create: {
      id: TEST_USER_ID,
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}
