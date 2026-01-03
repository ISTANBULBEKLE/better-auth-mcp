import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        // In Prisma 7, we might need to pass the adapter if not using accelerate
        // But for local development, it should theoretically work if configured in prisma.config.ts
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
