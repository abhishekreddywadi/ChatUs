// ============================================
// ERROR HANDLER MIDDLEWARE
// ============================================
// This middleware catches all errors thrown in the application
// and formats them into a consistent JSON response.
// It MUST be the last middleware added to the Express app.

import type { Request, Response, NextFunction } from "express";
import type { HttpError } from "../types/index.js";

// ============================================
// ERROR RESPONSE FORMAT
// ============================================
interface ErrorResponse {
  error: string;
  message: string;
  details?: unknown;
  stack?: string; // Only included in development
}

// ============================================
// ERROR HANDLER MIDDLEWARE FUNCTION
// ============================================
// Express error handlers have 4 parameters (err, req, res, next)
// The 4 parameters identify this as an error handler middleware
export function errorHandler(
  err: HttpError,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction
): void {
  // Default to 500 Internal Server Error if no status code is set
  const statusCode = err.status ?? err.statusCode ?? 500;

  // Build the error response object
  const response: ErrorResponse = {
    error: err.name ?? "Internal Server Error",
    message: err.message ?? "An unexpected error occurred.",
  };

  // Include additional details if provided
  if (err.details) {
    response.details = err.details;
  }

  // Include stack trace in development for debugging
  if (process.env.NODE_ENV === "development" && err.stack) {
    response.stack = err.stack;
  }

  // Log the error for server-side monitoring
  console.error(`[${new Date().toISOString()}] Error ${statusCode}:`, {
    error: response.error,
    message: response.message,
    path: _req.path,
    method: _req.method,
  });

  // Send the error response
  res.status(statusCode).json(response);
}

// ============================================
// ASYNC ROUTE WRAPPER
// ============================================
// Wraps async route handlers to catch errors and pass them
// to the error handler middleware. This eliminates the need
// for try-catch blocks in every async route.
//
// Usage:
//   router.get("/path", asyncHandler(async (req, res) => {
//     // Your async code here
//   }));
export function asyncHandler<T extends Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: T, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
