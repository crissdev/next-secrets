import { execSync } from 'node:child_process';

import { PrismaClient } from '@prisma/client';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';

import { setPrismaClient } from '@/lib/db/prisma';

jest.mock('next/cache');
jest.mock('next/navigation');

let container: StartedPostgreSqlContainer;

beforeEach(async () => {
  container = await new PostgreSqlContainer('postgres:16').start();
  const client = new PrismaClient({ datasourceUrl: container.getConnectionUri() });
  setPrismaClient(client);

  // Set the DATABASE_URL environment variable for Prisma CLI
  const databaseUrl = container.getConnectionUri();

  // Apply migrations using Prisma CLI
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });

  // Seed the database using Prisma CLI
  execSync('npx prisma db seed', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
});

afterEach(async () => {
  await container.stop();
});
