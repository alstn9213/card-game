import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { GameStatus, type GameState } from "@card-game/shared";

export const useGameEffects = (
  gameState: GameState | null
) => {
  const [showRoundVictory, setShowRoundVictory] = useState(false);
  const prevStatusRef = useRef<GameStatus | null>(null);
  const lastVictoryRoundRef = useRef<number>(-1);

  const [showTurnNotification, setShowTurnNotification] = useState(false);
  const lastNotifiedTurnRef = useRef<number>(-1);

  // 라운드 승리 효과
  useLayoutEffect(() => {
    if (gameState) {
      // 새 게임 시작 시 리셋
      if (gameState.round < lastVictoryRoundRef.current) {
        lastVictoryRoundRef.current = -1;
      }

      const isShop = gameState.gameStatus === GameStatus.SHOP;
      const wasNotShop = prevStatusRef.current !== GameStatus.SHOP;
      const isTransition = prevStatusRef.current !== null && wasNotShop && isShop;
      const isNewVictory = lastVictoryRoundRef.current !== gameState.round;

      if (isTransition && isNewVictory) {
        setShowRoundVictory(true);
        lastVictoryRoundRef.current = gameState.round;
      }
      
      prevStatusRef.current = gameState.gameStatus;
    }
  }, [gameState]);

  const handleVictoryConfirm = () => {
    setShowRoundVictory(false);
  };

  // 턴 시작 알림 효과
  useEffect(() => {
    if (gameState) {
      if (gameState.isPlayerTurn && gameState.turn !== lastNotifiedTurnRef.current) {
        setShowTurnNotification(true);
        lastNotifiedTurnRef.current = gameState.turn;
        const timer = setTimeout(() => setShowTurnNotification(false), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState]);

  return {
    showRoundVictory,
    showTurnNotification,
    handleVictoryConfirm
  };
};