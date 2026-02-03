import { useState, useEffect, useCallback, type ReactNode } from "react";
import {
  type GameState,
  type GameError,
  ClientEvents,
} from "@card-game/shared";
import { GameContext } from "./GameContext";
import { useGameSocket } from "./useGameSocket";

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<GameError | null>(null);

  const socket = useGameSocket(setGameState, setError, setIsConnected);

  // 에러 발생 시 3초 후 자동 소멸 (Toast 효과)
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const startGame = useCallback((deck: string[]) => {
    if (socket) {
      socket.emit(ClientEvents.JOIN_GAME, deck);
    }
  }, [socket]);

  const playCard = useCallback((cardIndex: number, targetId?: string) => {
    socket?.emit(ClientEvents.PLAY_CARD, cardIndex, targetId);
  }, [socket]);

  const endTurn = useCallback(() => {
    socket?.emit(ClientEvents.END_TURN);
  }, [socket]);

  const attack = useCallback((attackerId: string, targetId: string) => {
    socket?.emit(ClientEvents.ATTACK, attackerId, targetId);
  }, [socket]);

  

  const resetGame = useCallback(() => {
    setGameState(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <GameContext.Provider
      value={{ 
        socket, 
        gameState, 
        isConnected, 
        error, 
        startGame, 
        playCard, 
        endTurn, 
        attack, 
        resetGame, 
        clearError 
      }}
    >
      {children}
    </GameContext.Provider>
  );
};