import { useState, useEffect, useRef } from "react";
import { GameStatus, type GameState } from "@card-game/shared";

export const useGameEffects = (
  gameState: GameState | null
) => {
  const [showTurnNotification, setShowTurnNotification] = useState(false);
  const lastNotifiedTurnRef = useRef<number>(-1);

  const isPlayerTurn = gameState?.gameStatus === GameStatus.PLAYER_TURN;
  const turn = gameState?.turn;

  // 턴 시작 알림 효과
  useEffect(() => {
    if (isPlayerTurn && turn !== undefined) {
      if (turn !== lastNotifiedTurnRef.current) {
        setShowTurnNotification(true);
        lastNotifiedTurnRef.current = turn;
        const timer = setTimeout(() => setShowTurnNotification(false), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isPlayerTurn, turn]);

  return {
    showTurnNotification
  };
};