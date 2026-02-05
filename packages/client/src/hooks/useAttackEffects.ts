import { useEffect, useRef } from "react";
import { TargetSource, type GameState } from "@card-game/shared";
import "../css/AttackEffects.css";

export const useAttackEffects = (
  gameState: GameState | null,
  getUnitCenter: (id: string) => { x: number; y: number } | null,
  getUnitElement: (id: string) => HTMLElement | null
) => {
  const lastKnownPositions = useRef<Map<string, {x: number, y: number}>>(new Map());
  const processedLogCount = useRef<number>(0);

  const playerField = gameState?.playerField;
  const enemyField = gameState?.enemyField;
  const attackLogs = gameState?.attackLogs;

  // 유닛 위치 캐싱 (유닛이 죽어서 사라져도 마지막 위치를 기억하기 위함)
  useEffect(() => {
    if (!playerField || !enemyField) {
      return;
    }

    const cachePosition = (id: string) => {
      const pos = getUnitCenter(id);
      if (pos) {
        lastKnownPositions.current.set(id, pos);
      }
    };

    // 플레이어 유닛, 적 유닛, 플레이어 본체 위치 저장
    playerField.forEach(u => u && cachePosition(u.id));
    enemyField.forEach(u => u && cachePosition(u.id));
    cachePosition(TargetSource.PLAYER);
  }, [playerField, enemyField, getUnitCenter]);

  // 공격 애니메이션 처리 (attackLogs 기반)
  useEffect(() => {
    if (!attackLogs) {
      return;
    }

    // 턴이 바뀌거나 로그가 초기화된 경우 카운트 리셋
    if (attackLogs.length < processedLogCount.current) {
      processedLogCount.current = 0;
    }

    // 새로운 로그만 처리
    const newLogs = attackLogs.slice(processedLogCount.current);
    
    if (newLogs.length > 0) {
      newLogs.forEach((log, index) => {
        setTimeout(() => {
          triggerAttackAnimation(log.attackerId, log.targetId);
        }, index * 600); // 애니메이션 전체 시간(600ms)에 맞춰 순차 재생
      });
      processedLogCount.current = attackLogs.length;
    }
  }, [attackLogs]);

  const triggerAttackAnimation = (attackerId: string, targetId: string) => {
    // 현재 위치를 가져오거나, 없으면 캐시된 마지막 위치 사용
    const start = getUnitCenter(attackerId) || lastKnownPositions.current.get(attackerId);
    const end = getUnitCenter(targetId) || lastKnownPositions.current.get(targetId);
    const attackerEl = getUnitElement(attackerId);

    if (start && end && attackerEl) {
      const dx = end.x - start.x;
      const dy = end.y - start.y;

      // CSS 변수로 이동 거리 전달 및 클래스 적용
      attackerEl.style.setProperty('--attack-dx', `${dx}px`);
      attackerEl.style.setProperty('--attack-dy', `${dy}px`);
      attackerEl.classList.add('attacking-unit');

      // 원위치로 복귀
      setTimeout(() => {
        attackerEl.classList.add('returning');
        
        setTimeout(() => {
          attackerEl.classList.remove('attacking-unit', 'returning');
          attackerEl.style.removeProperty('--attack-dx');
          attackerEl.style.removeProperty('--attack-dy');
        }, 400);
      }, 200);
    } 
  };
};