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

  const gameStatus = gameState?.gameStatus;
  const round = gameState?.round;
  const isPlayerTurn = gameState?.gameStatus === GameStatus.PLAYER_TURN;
  const turn = gameState?.turn;

  // 라운드 승리 확인 핸들러
  const handleVictoryConfirm = () => {
    setShowRoundVictory(false);
  };

  // 라운드 승리 효과
  useLayoutEffect(() => {
    if (gameStatus && round !== undefined) {
      // 새 게임 시작 시 리셋
      if (round < lastVictoryRoundRef.current) {
        lastVictoryRoundRef.current = -1;
      }

      const isShop = gameStatus === GameStatus.SHOP;
      const wasNotShop = prevStatusRef.current !== GameStatus.SHOP;
      const isTransition = prevStatusRef.current !== null && wasNotShop && isShop;
      const isNewVictory = lastVictoryRoundRef.current !== round;

      if (isTransition && isNewVictory) {
        setShowRoundVictory(true);
        lastVictoryRoundRef.current = round;
      }
      
      prevStatusRef.current = gameStatus;
    }
  }, [gameStatus, round]);

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
    showRoundVictory,
    showTurnNotification,
    handleVictoryConfirm
  };
};