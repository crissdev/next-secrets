import { PrismaClient } from '@prisma/client';

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
    globalForPrisma.prisma ??= new PrismaClient();
    return globalForPrisma.prisma;
  } else {
    return new PrismaClient();
  }
}
