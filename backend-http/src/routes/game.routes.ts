// ============================================
// GAME ROUTES
// ============================================
// These routes handle all game-related operations:
// - Creating new games
// - Getting game information
// - Making moves
// - Listing games

import { Router } from "express";
import { gameController } from "../controllers/game.controller.js";

// ============================================
// CREATE ROUTER
// ============================================
const gameRouter = Router();

// ============================================
// ROUTE DEFINITIONS
// ============================================

// GET /api/games - List all games
// Query params: ?status=ongoing (optional filter)
// Returns: Array of games
gameRouter.get("/", gameController.getAllGames);

// GET /api/games/:id - Get a specific game by ID
// Returns: Single game with players and recent moves
gameRouter.get("/:id", gameController.getGameById);

// POST /api/games - Create a new game
// Body: { userId: number, color: "white" | "black" }
// Returns: Newly created game
gameRouter.post("/", gameController.createGame);

// POST /api/games/:id/join - Join an existing game
// Body: { userId: number }
// Returns: Updated game with both players
gameRouter.post("/:id/join", gameController.joinGame);

// POST /api/games/:id/move - Make a move in a game
// Body: { userId: number, from: string, to: string, piece: string, fen: string }
// Returns: Updated game state
gameRouter.post("/:id/move", gameController.makeMove);

// DELETE /api/games/:id - Delete/abandon a game
// Returns: Success message
gameRouter.delete("/:id", gameController.deleteGame);

// ============================================
// EXPORT ROUTER
// ============================================
export { gameRouter };
