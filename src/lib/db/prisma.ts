import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
let prisma: PrismaClient;

export function setPrismaClient(client: PrismaClient) {
  prisma = client;
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }
}

export function getPrismaClient() {
  if (process.env.NODE_ENV !== 'production') {
    setPrismaClient(globalForPrisma.prisma ?? new PrismaClient());
  } else if (!prisma) {
    setPrismaClient(new PrismaClient());
  }
  return prisma!;
}
