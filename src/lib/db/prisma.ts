import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/lib/db/prisma-client/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export let prisma: PrismaClient = getPrismaClient();

export function setPrismaClient(client: PrismaClient) {
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }
  prisma = client;
}

function getPrismaClient() {
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma ??= new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
    });
    return globalForPrisma.prisma;
  } else {
    return new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
    });
  }
}
