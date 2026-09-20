import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient; prismaDbUrl?: string };

const currentDbUrl = process.env.DATABASE_URL;

if (globalForPrisma.prisma && globalForPrisma.prismaDbUrl !== currentDbUrl) {
  try {
    globalForPrisma.prisma.$disconnect();
  } catch {}
  delete globalForPrisma.prisma;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: currentDbUrl ? { db: { url: currentDbUrl } } : undefined,
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaDbUrl = currentDbUrl;
}

export default prisma;
