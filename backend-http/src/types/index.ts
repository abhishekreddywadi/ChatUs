// ============================================
// TYPES AND INTERFACES
// ============================================
// This file contains shared TypeScript types and interfaces
// used throughout the application.

// ============================================
// HTTP ERROR TYPE
// ============================================
// Used for throwing custom errors in controllers and services
// These errors are caught by the error handler middleware
export interface HttpError extends Error {
  status?: number;
  statusCode?: number;
  details?: unknown;
}

// ============================================
// API RESPONSE TYPES
// ============================================
// Standard response format for successful API calls
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

// Standard response format for paginated data
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// GAME TYPES
// ============================================
// Represents the possible states of a game
export type GameStatus = "waiting" | "ongoing" | "finished" | "abandoned";

// Represents the two players in chess
export type PlayerColor = "white" | "black";

// ============================================
// REQUEST/RESPONSE DTO TYPES
// ============================================

// Request body for creating a new game
export interface CreateGameDto {
  // No fields needed for now - game is created with default state
}

// Request body for making a move
export interface MakeMoveDto {
  from: string; // e.g., "e2"
  to: string;   // e.g., "e4"
  piece: string; // e.g., "P", "N", "B", "R", "Q", "K"
  fen: string;   // FEN string after the move
}

// Response for a single game
export interface GameResponse {
  id: number;
  status: GameStatus;
  currentFen: string;
  turn: PlayerColor;
  winnerId: number | null;
  players: Array<{
    id: number;
    color: PlayerColor;
  }>;
  moveCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// CUSTOM ERROR CLASS
// ============================================
// Helper class for throwing HTTP errors with status codes
export class AppError extends Error implements HttpError {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
