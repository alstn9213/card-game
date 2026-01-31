import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { GameStatus, type GameState } from "@card-game/shared";

export const useGameEffects = (
  gameState: GameState | null,
  getUnitCenter: (id: string) => { x: number; y: number } | null,
  getUnitElement: (id: string) => HTMLElement | null
) => {
  // 1. 라운드 승리 감지 상태
  const [showRoundVictory, setShowRoundVictory] = useState(false);
  const prevStatusRef = useRef<GameStatus | null>(null);
  const lastVictoryRoundRef = useRef<number>(-1);

  // 2. 턴 시작 알림 상태
  const [showTurnNotification, setShowTurnNotification] = useState(false);
  const lastNotifiedTurnRef = useRef<number>(-1);

  const lastKnownPositions = useRef<Map<string, {x: number, y: number}>>(new Map());
  const processedLogCount = useRef<number>(0);

  

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

  // 유닛 위치 캐싱 (유닛이 죽어서 사라져도 마지막 위치를 기억하기 위함)
  useEffect(() => {
    if (!gameState) return;

    const cachePosition = (id: string) => {
      const pos = getUnitCenter(id);
      if (pos) {
        lastKnownPositions.current.set(id, pos);
      }
    };

    // 플레이어, 적 유닛, 플레이어 본체 위치 저장
    gameState.playerField.forEach(u => u && cachePosition(u.id));
    gameState.enemyField.forEach(u => u && cachePosition(u.id));
    cachePosition("player");
  }, [gameState, getUnitCenter]);

  // 공격 애니메이션 처리 (attackLogs 기반)
  useEffect(() => {
    if (!gameState) return;

    // 턴이 바뀌거나 로그가 초기화된 경우 카운트 리셋
    if (gameState.attackLogs.length < processedLogCount.current) {
      processedLogCount.current = 0;
    }

    // 새로운 로그만 처리
    const newLogs = gameState.attackLogs.slice(processedLogCount.current);
    
    if (newLogs.length > 0) {
      newLogs.forEach((log, index) => {
        setTimeout(() => {
          triggerAttackAnimation(log.attackerId, log.targetId);
        }, index * 200); // 동시 다발적 공격 시 순차 재생
      });
      processedLogCount.current = gameState.attackLogs.length;
    }
  }, [gameState]);

  const triggerAttackAnimation = (attackerId: string, targetId: string) => {
    // 현재 위치를 가져오거나, 없으면 캐시된 마지막 위치 사용
    const start = getUnitCenter(attackerId) || lastKnownPositions.current.get(attackerId);
    const end = getUnitCenter(targetId) || lastKnownPositions.current.get(targetId);
    const attackerEl = getUnitElement(attackerId);

    if (start && end && attackerEl) {
      const dx = end.x - start.x;
      const dy = end.y - start.y;

      // 1. 목표지점으로 돌진
      attackerEl.style.transition = "transform 0.2s cubic-bezier(0.2, 0, 0.6, 1)";
      attackerEl.style.zIndex = "100";
      attackerEl.style.transform = `translate(${dx}px, ${dy}px)`;

      // 2. 원위치로 복귀
      setTimeout(() => {
        attackerEl.style.transition = "transform 0.4s ease-out";
        attackerEl.style.transform = "translate(0px, 0px)";
        
        setTimeout(() => {
          attackerEl.style.zIndex = "";
          attackerEl.style.transition = "";
        }, 400);
      }, 200);
    } 
  };

  return {
    showRoundVictory,
    showTurnNotification,
    handleVictoryConfirm
  };
};