import { useState, useEffect, useRef } from "react";
import { GameStatus, type GameState } from "@card-game/shared";

export const useGameEffects = (
  gameState: GameState | null,
  getUnitCenter: (id: string) => { x: number; y: number } | null,
  getUnitElement: (id: string) => HTMLElement | null
) => {
  // 1. 라운드 승리 감지 상태
  const [showRoundVictory, setShowRoundVictory] = useState(false);
  const prevStatusRef = useRef<GameStatus | null>(null);

  // 2. 턴 시작 알림 상태
  const [showTurnNotification, setShowTurnNotification] = useState(false);
  const lastNotifiedTurnRef = useRef<number>(-1);

  // 3. 적 공격 화살표 상태
  const [enemyAttackArrow, setEnemyAttackArrow] = useState<{ start: {x: number, y: number}, end: {x: number, y: number} } | null>(null);
  const prevGameStateRef = useRef<GameState | null>(null);

  // 라운드 승리 효과
  useEffect(() => {
    if (gameState) {
      if (prevStatusRef.current !== null && prevStatusRef.current !== GameStatus.SHOP && gameState.gameStatus === GameStatus.SHOP) {
        setShowRoundVictory(true);
        const timer = setTimeout(() => setShowRoundVictory(false), 2000);
        return () => clearTimeout(timer);
      }
      prevStatusRef.current = gameState.gameStatus;
    }
  }, [gameState]);

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

  // 적 공격 감지 및 화살표 표시 효과
  useEffect(() => {
    const triggerAttackAnimation = (attackerId: string, targetId: string) => {
      setTimeout(() => {
        const start = getUnitCenter(attackerId);
        const end = getUnitCenter(targetId);
        const attackerEl = getUnitElement(attackerId);

        if (start && end && attackerEl) {
          // 돌진 애니메이션 계산
          const dx = end.x - start.x;
          const dy = end.y - start.y;

          // 1. 목표지점으로 돌진
          attackerEl.style.transition = "transform 0.2s cubic-bezier(0.2, 0, 0.6, 1)";
          attackerEl.style.zIndex = "100"; // 다른 카드 위로 올라오게 설정
          attackerEl.style.transform = `translate(${dx}px, ${dy}px)`;

          // 2. 원위치로 복귀
          setTimeout(() => {
            attackerEl.style.transition = "transform 0.4s ease-out";
            attackerEl.style.transform = "translate(0px, 0px)";
            
            // 3. 스타일 정리
            setTimeout(() => {
              attackerEl.style.zIndex = "";
              attackerEl.style.transition = "";
            }, 400);
          }, 200);
        } else if (start && end) {
          // 엘리먼트를 찾지 못한 경우 기존 화살표 표시 (Fallback)
          setEnemyAttackArrow({ start, end });
          setTimeout(() => setEnemyAttackArrow(null), 800);
        }
      }, 50);
    };

    if (gameState && prevGameStateRef.current) {
      const prev = prevGameStateRef.current;
      const curr = gameState;

      if (curr.gameStatus === GameStatus.PLAYING) {
        let attackerId: string | null = null;
        let targetId: string | null = null;

        // 1. 적 턴: 적 공격 감지
        if (!curr.isPlayerTurn) {
          // A. 서버에서 전달된 공격 로그가 있는 경우 (정확한 타겟팅)
          if (curr.attackLogs && curr.attackLogs.length > 0) {
            // 새로운 로그가 들어왔을 때만 실행 (단, 배열 참조가 바뀌므로 항상 실행되지만 턴 전환 시 초기화됨)
            if (curr.attackLogs !== prev.attackLogs) {
              curr.attackLogs.forEach((log, index) => {
                setTimeout(() => {
                  triggerAttackAnimation(log.attackerId, log.targetId);
                }, index * 200);
              });
            }
          } 
          // B. 로그가 없는 경우 (기존 추론 로직 Fallback)
          else {
            const attackers = curr.enemyField.filter((unit) => {
              if (!unit) return false;
              const prevUnit = prev.enemyField.find(u => u?.id === unit.id);
              return prevUnit && !prevUnit.hasAttacked && unit.hasAttacked;
            });

            attackers.forEach((attacker, index) => {
              setTimeout(() => {
                let targetId: string | null = null;
                // 타겟 추정
                if (curr.player.currentHp < prev.player.currentHp) {
                  targetId = "player";
                } else {
                  const damagedUnit = curr.playerField.find((unit) => {
                    if (!unit) return false;
                    const prevUnit = prev.playerField.find(u => u?.id === unit.id);
                    return prevUnit && unit.currentHp < prevUnit.currentHp;
                  });
                  if (damagedUnit) targetId = damagedUnit.id;
                }

                if (targetId) triggerAttackAnimation(attacker!.id, targetId);
              }, index * 200);
            });
          }
        } 
        // 2. 플레이어 턴: 아군 공격 감지
        else {
          const attacker = curr.playerField.find((unit) => {
            if (!unit) return false;
            const prevUnit = prev.playerField.find(u => u?.id === unit.id);
            return prevUnit && !prevUnit.hasAttacked && unit.hasAttacked;
          });

          if (attacker) {
            attackerId = attacker.id;
            const damagedEnemy = curr.enemyField.find((unit) => {
              if (!unit) return false;
              const prevUnit = prev.enemyField.find(u => u?.id === unit.id);
              return prevUnit && unit.currentHp < prevUnit.currentHp;
            });
            if (damagedEnemy) targetId = damagedEnemy.id;
          }
        }

        if (attackerId && targetId) {
          triggerAttackAnimation(attackerId, targetId);
        }
      }
    }
    prevGameStateRef.current = gameState;
  }, [gameState, getUnitCenter, getUnitElement]);

  return {
    showRoundVictory,
    showTurnNotification,
    enemyAttackArrow
  };
};