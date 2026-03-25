// ============================================
// HEALTH CHECK ROUTES
// ============================================
// These routes provide health and status information for the API.
// Useful for monitoring services, load balancers, and debugging.

import { Router } from "express";
import { healthController } from "../controllers/health.controller.js";

// ============================================
// CREATE ROUTER
// ============================================
const healthRouter = Router();

// ============================================
// ROUTE DEFINITIONS
// ============================================

// GET /health - Basic health check
// Returns: API status and server timestamp
healthRouter.get("/", healthController.getHealth);

// GET /health/db - Database connection check
// Returns: Database connectivity status
healthRouter.get("/db", healthController.getDbHealth);

// ============================================
// EXPORT ROUTER
// ============================================
export { healthRouter };
