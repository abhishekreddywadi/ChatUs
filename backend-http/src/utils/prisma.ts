// ============================================
// PRISMA CLIENT SINGLETON
// ============================================
// This file creates and exports a single instance of the Prisma Client.
// Using a singleton pattern prevents creating multiple database connections
// which can cause issues in development with hot-reloading.

import { PrismaClient } from "../generated/prisma/index.js";

// ============================================
// SINGLETON PATTERN
// ============================================
// In development, hot-reloading can create multiple Prisma Client instances.
// This pattern reuses the existing instance if it already exists.
// Reference: https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create or reuse the Prisma Client instance
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Log queries in development for debugging
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// In development, attach the client to the global object
// so it persists across hot-reloads
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ============================================
// DISCONNECT HELPER
// ============================================
// Gracefully disconnect from the database
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
