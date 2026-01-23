import { GameState } from "./gameState";

export interface ClientToServerEvents {
  joinGame: () => void;
  playCard: (cardIndex: number) => void;
  endTurn: () => void;
}

export interface ServerToClientEvents {
  gameStateUpdate: (state: GameState) => void;
  error: (message: string) => void;
  gameLog: (message: string) => void;
}