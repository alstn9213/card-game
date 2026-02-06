import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";
import {
  type GameState,
  type GameError,
  type ClientToServerEvents,
  type ServerToClientEvents
} from "@card-game/shared";

export interface GameContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  gameState: GameState | null;
  isConnected: boolean;
  error: GameError | null;
  startGame: (deck: string[]) => void;
  playCard: (cardIndex: number, targetId?: string) => void;
  endTurn: () => void;
  attack: (attackerId: string, targetId: string) => void;
  buyCard: (index: number) => void;
  continueRound: () => void;
  mergeFieldUnits: (sourceId: string, targetId: string) => void;
  enterShop: () => void;
  resetGame: () => void;
  clearError: () => void;
  registerUnit: (id: string, element: HTMLElement | null) => void;
}

export const GameContext = createContext<GameContextType | null>(null);

export const useGameState = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameState must be used within a GameProvider");
  }
  return context;
};