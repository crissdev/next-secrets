import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export function setPrismaClient(client: PrismaClient) {
  globalForPrisma.prisma = client;
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma ??= new PrismaClient();

export function getPrismaClient() {
  return globalForPrisma.prisma || new PrismaClient();
}
