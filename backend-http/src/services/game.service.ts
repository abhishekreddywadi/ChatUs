// ============================================
// GAME SERVICE
// ============================================
// Service layer for game-related business logic.
// This layer handles all database operations and game rules.
// Controllers call this layer; this layer calls Prisma.

import { prisma } from "../utils/prisma.js";
import type { GameStatus, PlayerColor } from "../types/index.js";
import { AppError } from "../types/index.js";

// ============================================
// SERVICE OBJECT
// ============================================
export const gameService = {
  // ============================================
  // GET ALL GAMES
  // ============================================
  // Retrieves all games from the database
  // Optionally filters by status (waiting, ongoing, finished, abandoned)
  async getAllGames(statusFilter?: string) {
    // Build the where clause based on the status filter
    const where = statusFilter ? { status: statusFilter as GameStatus } : {};

    // Query the database for games
    const games = await prisma.game.findMany({
      where,
      include: {
        // Include player information
        players: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        // Count the number of moves (for display)
        _count: {
          select: { moves: true },
        },
      },
      // Order by most recently created
      orderBy: {
        createdAt: "desc",
      },
    });

    return games;
  },

  // ============================================
  // GET GAME BY ID
  // ============================================
  // Retrieves a single game with all details including move history
  async getGameById(gameId: number) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        // Include all moves in chronological order
        moves: {
          orderBy: {
            moveNumber: "asc",
          },
        },
      },
    });

    // If game doesn't exist, throw a 404 error
    if (!game) {
      throw new AppError("Game not found", 404);
    }

    return game;
  },

  // ============================================
  // CREATE NEW GAME
  // ============================================
  // Creates a new game with the first player
  async createGame(userId: number, color: PlayerColor) {
    // First, verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Create the game and add the first player in a transaction
    // This ensures both operations succeed or both fail
    const game = await prisma.$transaction(async (tx) => {
      // Create the game with default starting position
      const newGame = await tx.game.create({
        data: {
          status: "waiting",
          turn: "white",
          currentFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          players: {
            create: {
              userId,
              color,
            },
          },
        },
        include: {
          players: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return newGame;
    });

    return game;
  },

  // ============================================
  // JOIN EXISTING GAME
  // ============================================
  // Adds a second player to a waiting game
  async joinGame(gameId: number, userId: number) {
    // First, verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Get the game with current players
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: true,
      },
    });

    if (!game) {
      throw new AppError("Game not found", 404);
    }

    // Check if game is already full or ongoing
    if (game.status !== "waiting") {
      throw new AppError("Cannot join a game that is not in 'waiting' status", 400);
    }

    if (game.players.length >= 2) {
      throw new AppError("Game is already full", 400);
    }

    // Determine which color the new player gets
    // (the opposite of the existing player)
    const existingPlayerColor = game.players[0]?.color as PlayerColor;
    const newPlayerColor: PlayerColor = existingPlayerColor === "white" ? "black" : "white";

    // Check if user is already in this game
    const alreadyInGame = game.players.some((p) => p.userId === userId);
    if (alreadyInGame) {
      throw new AppError("User is already in this game", 400);
    }

    // Add the player and update game status to "ongoing"
    const updatedGame = await prisma.$transaction(async (tx) => {
      // Add the second player
      await tx.gamePlayer.create({
        data: {
          gameId,
          userId,
          color: newPlayerColor,
        },
      });

      // Update game status to ongoing
      const updated = await tx.game.update({
        where: { id: gameId },
        data: {
          status: "ongoing",
        },
        include: {
          players: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return updated;
    });

    return updatedGame;
  },

  // ============================================
  // MAKE A MOVE
  // ============================================
  // Records a move and updates the game state
  async makeMove(
    gameId: number,
    userId: number,
    moveData: { from: string; to: string; piece: string; fen: string }
  ) {
    // Get the game with players and existing moves
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: true,
        moves: {
          orderBy: { moveNumber: "desc" },
          take: 1,
        },
      },
    });

    if (!game) {
      throw new AppError("Game not found", 404);
    }

    // Validate game status
    if (game.status !== "ongoing") {
      throw new AppError("Can only make moves in ongoing games", 400);
    }

    // Verify the user is a player in this game
    const player = game.players.find((p) => p.userId === userId);
    if (!player) {
      throw new AppError("User is not a player in this game", 403);
    }

    // Verify it's the correct player's turn
    if (player.color !== game.turn) {
      throw new AppError(`It's ${game.turn}'s turn, not ${player.color}'s`, 400);
    }

    // Calculate the next move number
    const nextMoveNumber = (game.moves[0]?.moveNumber ?? 0) + 1;

    // Record the move and update the game state
    const updatedGame = await prisma.$transaction(async (tx) => {
      // Create the move record
      await tx.move.create({
        data: {
          gameId,
          moveNumber: nextMoveNumber,
          from: moveData.from,
          to: moveData.to,
          piece: moveData.piece,
          fen: moveData.fen,
        },
      });

      // Update the game state
      const nextTurn: PlayerColor = game.turn === "white" ? "black" : "white";

      const updated = await tx.game.update({
        where: { id: gameId },
        data: {
          currentFen: moveData.fen,
          turn: nextTurn,
        },
        include: {
          players: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return updated;
    });

    return updatedGame;
  },

  // ============================================
  // DELETE GAME
  // ============================================
  // Deletes a game (only allowed for waiting or finished games)
  async deleteGame(gameId: number) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new AppError("Game not found", 404);
    }

    // Only allow deletion of waiting or finished games
    if (game.status === "ongoing") {
      throw new AppError("Cannot delete an ongoing game", 400);
    }

    // Delete the game (Prisma will cascade delete related records)
    await prisma.game.delete({
      where: { id: gameId },
    });

    return { success: true };
  },
};
