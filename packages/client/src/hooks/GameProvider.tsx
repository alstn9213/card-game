import { useState, useEffect, useCallback, type ReactNode } from "react";
import { type GameState, type GameError } from "@card-game/shared";
import { GameContext } from "./GameContext";
import { useGameSocket } from "./useGameSocket";
import { useGameActions } from "./useGameActions";
import { useTimeoutManager } from "./useTimeoutManager";

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<GameError | null>(null);

  const socket = useGameSocket(setGameState, setError, setIsConnected);
  const gameActions = useGameActions(socket, setError);
  const { addTimeout, removeTimeout } = useTimeoutManager();

  // 에러 발생 시 3초 후 자동 소멸 (Toast 효과)
  useEffect(() => {
    if (error) {
      const id = addTimeout(() => {
        setError(null);
      }, 3000);
      return () => removeTimeout(id);
    }
  }, [error, addTimeout, removeTimeout]);

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
        setGameState,
        isConnected, 
        error, 
        ...gameActions,
        resetGame, 
        clearError
      }}
    >
      {children}
    </GameContext.Provider>
  );
};