import type { GameState } from "./gameState";

export interface ClientToServerEvents {
  joinGame: (deck: string[]) => void;
  playCard: (cardIndex: number) => void;
  endTurn: () => void;
  attack: (attackerId: string, targetId: string) => void;
}

export interface ServerToClientEvents {
  gameStateUpdate: (state: GameState) => void;
  error: (message: string) => void;
  gameLog: (message: string) => void;
}
