// ============================================
// GAME CONTROLLER
// ============================================
// Controller functions for game routes.
// These functions handle HTTP requests/responses and delegate
// business logic to the game service.

import type { Request, Response } from "express";
import { gameService } from "../services/game.service.js";
import type { CreateGameDto, MakeMoveDto } from "../types/index.js";

// ============================================
// CONTROLLER OBJECT
// ============================================
export const gameController = {
  // ============================================
  // GET ALL GAMES
  // ============================================
  // Retrieves a list of all games, optionally filtered by status
  getAllGames: async (req: Request, res: Response): Promise<void> => {
    // Extract status filter from query parameters
    const status = req.query.status as string | undefined;

    // Call service layer to get games
    const games = await gameService.getAllGames(status);

    res.json({
      success: true,
      data: games,
      count: games.length,
    });
  },

  // ============================================
  // GET GAME BY ID
  // ============================================
  // Retrieves a single game with all its details
  getGameById: async (req: Request, res: Response): Promise<void> => {
    // Extract game ID from URL parameters
    const gameId = parseInt(req.params.id, 10);

    // Call service layer to get the game
    const game = await gameService.getGameById(gameId);

    res.json({
      success: true,
      data: game,
    });
  },

  // ============================================
  // CREATE NEW GAME
  // ============================================
  // Creates a new game and adds the first player
  createGame: async (req: Request, res: Response): Promise<void> => {
    // Extract user ID and preferred color from request body
    const { userId, color = "white" } = req.body as CreateGameDto & {
      userId: number;
      color?: "white" | "black";
    };

    // Validate required fields
    if (!userId) {
      res.status(400).json({
        error: "Bad Request",
        message: "userId is required",
      });
      return;
    }

    // Call service layer to create the game
    const game = await gameService.createGame(userId, color);

    res.status(201).json({
      success: true,
      data: game,
      message: "Game created successfully",
    });
  },

  // ============================================
  // JOIN EXISTING GAME
  // ============================================
  // Adds a second player to an existing game
  joinGame: async (req: Request, res: Response): Promise<void> => {
    const gameId = parseInt(req.params.id, 10);
    const { userId } = req.body as { userId: number };

    if (!userId) {
      res.status(400).json({
        error: "Bad Request",
        message: "userId is required",
      });
      return;
    }

    const game = await gameService.joinGame(gameId, userId);

    res.json({
      success: true,
      data: game,
      message: "Joined game successfully",
    });
  },

  // ============================================
  // MAKE A MOVE
  // ============================================
  // Records a move in a game and updates the game state
  makeMove: async (req: Request, res: Response): Promise<void> => {
    const gameId = parseInt(req.params.id, 10);
    const { userId, from, to, piece, fen } = req.body as MakeMoveDto & {
      userId: number;
    };

    // Validate required fields
    if (!userId || !from || !to || !piece || !fen) {
      res.status(400).json({
        error: "Bad Request",
        message: "userId, from, to, piece, and fen are required",
      });
      return;
    }

    // Call service layer to process the move
    const game = await gameService.makeMove(gameId, userId, {
      from,
      to,
      piece,
      fen,
    });

    res.json({
      success: true,
      data: game,
      message: "Move recorded successfully",
    });
  },

  // ============================================
  // DELETE GAME
  // ============================================
  // Deletes a game (only works for waiting/finished games)
  deleteGame: async (req: Request, res: Response): Promise<void> => {
    const gameId = parseInt(req.params.id, 10);

    await gameService.deleteGame(gameId);

    res.json({
      success: true,
      message: "Game deleted successfully",
    });
  },
};
