// ============================================
// MAIN ENTRY POINT - Backend Server
// ============================================
// This is the main file that starts our Express server.
// It initializes the database connection, sets up middleware,
// registers routes, and begins listening for incoming requests.

import "dotenv/config";
import app from "./app.js";
import { prisma } from "./utils/prisma.js";

// ============================================
// SERVER CONFIGURATION
// ============================================
// Port is loaded from environment variable or defaults to 3000
const PORT = process.env.PORT ?? 3000;

// ============================================
// GRACEFUL SHUTDOWN HANDLER
// ============================================
// This ensures that the database connection is properly closed
// when the server receives a shutdown signal (Ctrl+C, etc.)
async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    // Disconnect from the database
    await prisma.$disconnect();
    console.log("Database connection closed.");

    // Exit the process successfully
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
}

// Register shutdown handlers for common termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// ============================================
// START SERVER
// ============================================
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Chess Game Backend Server is Running!           ║
║                                                       ║
║   📍 Server:  http://localhost:${PORT}                ║
║   🌍 Environment: ${process.env.NODE_ENV ?? "development"}            ║
║                                                       ║
║   Available Routes:                                   ║
║   ├─ GET  /health           - Health check            ║
║   ├─ GET  /api/games        - List all games          ║
║   ├─ POST /api/games        - Create new game         ║
║   ├─ GET  /api/games/:id    - Get game by ID          ║
║   └─ POST /api/games/:id/move - Make a move          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// ============================================
// ERROR HANDLING
// ============================================
// Handle server startup errors (e.g., port already in use)
server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use. Please use a different port.`);
  } else {
    console.error("❌ Server error:", error);
  }
  process.exit(1);
});
