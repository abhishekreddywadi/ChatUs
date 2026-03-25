// ============================================
// HEALTH CHECK CONTROLLER
// ============================================
// Controller functions for health check routes.
// These functions handle the business logic for health endpoints.

import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";

// ============================================
// CONTROLLER OBJECT
// ============================================
// Groups all health-related controller functions together
export const healthController = {
  // ============================================
  // BASIC HEALTH CHECK
  // ============================================
  // Returns the API status and current server time
  // This is the simplest health check - verifies the server is running
  getHealth: async (_req: Request, res: Response): Promise<void> => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV ?? "development",
    });
  },

  // ============================================
  // DATABASE HEALTH CHECK
  // ============================================
  // Verifies the database connection is working
  // This is important for monitoring - alerts if DB is down
  getDbHealth: async (_req: Request, res: Response): Promise<void> => {
    try {
      // Try to execute a simple query to verify DB connection
      await prisma.$queryRaw`SELECT 1`;

      res.json({
        status: "healthy",
        database: "connected",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // If the query fails, the database is unreachable
      res.status(503).json({
        status: "unhealthy",
        database: "disconnected",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
