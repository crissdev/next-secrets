import { execSync } from 'node:child_process';

import { PrismaPg } from '@prisma/adapter-pg';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { afterEach, beforeEach, vi } from 'vitest';

import { setPrismaClient } from '@/lib/db/prisma';
import { PrismaClient } from '@/lib/db/prisma-client/client';

vi.mock('server-only', () => ({}));
vi.mock('client-only', () => ({}));
vi.mock('next/cache');
vi.mock('next/headers');
vi.mock('next/navigation');
vi.mock('next/server');

let container: StartedPostgreSqlContainer;
const PG_VERSION = '16-alpine';
const containerImage = `postgres:${PG_VERSION}`;
const TEST_USER_ID = 'test-user-id';

beforeEach(async () => {
  try {
    container = await new PostgreSqlContainer(containerImage).start();
    const connectionString = container.getConnectionUri();
    const prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });

    setPrismaClient(prisma);

    initDatabase(connectionString);
    await seedTestUser(prisma);
  } catch (err) {
    console.error('Is Docker running?');
    throw err;
  }
}, 30_000);

afterEach(async () => {
  await container?.stop();
});

function initDatabase(databaseUrl: string) {
  applyMigrations(databaseUrl);
  seedDatabase(databaseUrl);
}

function applyMigrations(databaseUrl: string) {
  execSync('npx --no prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}

function seedDatabase(databaseUrl: string) {
  execSync('npx --no prisma db seed', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}

async function seedTestUser(prisma: PrismaClient) {
  await prisma.user.upsert({
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
