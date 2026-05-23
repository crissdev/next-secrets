import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';

import { type DatabaseEnv, getDatabaseConfig } from './database-provider';
import { PrismaClient as PostgresPrismaClient } from './prisma-client/postgresql/client';
import { PrismaClient as SqlitePrismaClient } from './prisma-client/sqlite/client';

export type PrismaClient = PostgresPrismaClient;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export let prisma: PrismaClient = getPrismaClient();

export function setPrismaClient(client: PrismaClient) {
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }
  prisma = client;
}

export function createPrismaClient(env: DatabaseEnv = process.env as DatabaseEnv): PrismaClient {
  const { provider, url } = getDatabaseConfig(env);

  if (provider === 'sqlite') {
    return new SqlitePrismaClient({
      adapter: new PrismaBetterSqlite3({ url }),
    }) as unknown as PrismaClient;
  }

  return new PostgresPrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });
}

function getPrismaClient() {
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma ??= createPrismaClient();
    return globalForPrisma.prisma;
  } else {
    return createPrismaClient();
  }
}
