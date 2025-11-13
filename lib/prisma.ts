// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Only log warnings, errors, and info — remove "query"
    log: ["warn", "error", "info"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
