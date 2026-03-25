// ============================================
// EXPRESS APP CONFIGURATION
// ============================================
// This file sets up the Express application with all middleware,
// routes, and error handlers. It's separated from index.ts
// for easier testing and modularity.

import express, { type Application, type Request, type NextFunction } from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { healthRouter } from "./routes/health.routes.js";
import { gameRouter } from "./routes/game.routes.js";

// ============================================
// CREATE EXPRESS APP
// ============================================
const app: Application = express();

// ============================================
// BUILT-IN MIDDLEWARE
// ============================================
// Parse incoming JSON request bodies
// The "limit" option prevents large payload attacks
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded data (form submissions)
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ============================================
// CUSTOM MIDDLEWARE
// ============================================

// CORS (Cross-Origin Resource Sharing)
// Allows frontend applications to communicate with this backend
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? "*", // In production, specify exact origins
  credentials: true, // Allow cookies to be sent
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Request Logger
// Logs all incoming requests for debugging and monitoring
app.use(requestLogger);

// ============================================
// ROUTES
// ============================================
// Health check route (no authentication required)
app.use("/health", healthRouter);

// API routes for game functionality
app.use("/api/games", gameRouter);

// Root route - API information
app.use("/", (_req, res) => {
  res.json({
    message: "Chess Game Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      games: "/api/games",
    },
  });
});

// ============================================
// 404 HANDLER
// ============================================
// This must be AFTER all routes but BEFORE the error handler
// It catches requests to undefined routes
app.use((_req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested resource was not found on this server.",
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
// This MUST be the LAST middleware added
// It catches all errors thrown in route handlers or middleware
app.use(errorHandler);

// ============================================
// EXPORT APP
// ============================================
// We export the app instead of listening here
// This allows for easier testing with supertest
export default app;
