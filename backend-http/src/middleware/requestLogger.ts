// ============================================
// REQUEST LOGGER MIDDLEWARE
// ============================================
// Logs all incoming HTTP requests with timing information.
// This is useful for debugging, monitoring, and analytics.

import type { Request, Response, NextFunction } from "express";

// Extend the Request type to include the start time property
declare global {
  namespace Express {
    interface Request {
      startTime?: number;
    }
  }
}

// ============================================
// REQUEST LOGGER FUNCTION
// ============================================
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Record the start time before processing the request
  const startTime = Date.now();
  req.startTime = startTime;

  // Extract relevant request information
  const { method, originalUrl, ip } = req;
  const userAgent = req.get("user-agent") ?? "Unknown";

  // Log when the request starts
  console.log(
    `[${new Date().toISOString()}] → ${method} ${originalUrl} - ${ip} - ${userAgent}`
  );

  // Listen for the 'finish' event to log when the response is sent
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;

    // Color code the status code for better readability
    const statusColor =
      statusCode >= 500 ? "\x1b[31m" : // Red for server errors
      statusCode >= 400 ? "\x1b[33m" : // Yellow for client errors
      statusCode >= 300 ? "\x1b[36m" : // Cyan for redirects
      statusCode >= 200 ? "\x1b[32m" : // Green for success
      "\x1b[0m"; // Reset color

    console.log(
      `[${new Date().toISOString()}] ← ${method} ${originalUrl} ${statusColor}${statusCode}\x1b[0m - ${duration}ms`
    );
  });

  // Pass control to the next middleware/route handler
  next();
}
