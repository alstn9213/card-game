import { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { type GameState, type GameError } from "@card-game/shared";
import { GameContext } from "./GameContext";
import { useGameSocket, applyLogToState } from "./useGameSocket";
import { useGameActions } from "./useGameActions";
import { useAttackEffects } from "./useAttackEffects";

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<GameError | null>(null);
  const unitRefs = useRef<Map<string, HTMLElement>>(new Map());

  const socket = useGameSocket(setGameState, setError, setIsConnected);
  const gameActions = useGameActions(socket, setError);

  // 유닛 Ref 등록/해제
  const registerUnit = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      unitRefs.current.set(id, element);
    } else {
      unitRefs.current.delete(id);
    }
  }, []);

  const getUnitElement = useCallback((id: string) => unitRefs.current.get(id) || null, []);
  const getUnitCenter = useCallback((id: string) => {
    const el = unitRefs.current.get(id);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }, []);

  // 공격 애니메이션 및 데미지 적용 연결
  useAttackEffects(
    gameState,
    getUnitCenter,
    getUnitElement,
    (log) => {
      setGameState((prev) => (prev ? applyLogToState(prev, log) : null));
    }
  );

  // 에러 발생 시 3초 후 자동 소멸 (Toast 효과)
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
        ...gameActions,
        resetGame, 
        clearError,
        registerUnit
      }}
    >
      {children}
    </GameContext.Provider>
  );
};