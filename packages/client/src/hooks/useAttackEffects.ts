import { useEffect, useRef } from "react";
import { TargetSource, type GameState } from "@card-game/shared";
import "../css/AttackEffects.css";

export const useAttackEffects = (
  gameState: GameState | null,
  getUnitCenter: (id: string) => { x: number; y: number } | null,
  getUnitElement: (id: string) => HTMLElement | null,
  onAttackImpact?: (log: { attackerId: string; targetId: string; damage: number }) => void
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
          triggerAttackAnimation(log);
        }, index * 600);
      });
      processedLogCount.current = attackLogs.length;
    }
  }, [attackLogs, onAttackImpact]);

  const triggerAttackAnimation = (log: { attackerId: string; targetId: string; damage: number }) => {
    const { attackerId, targetId } = log;
    // 현재 위치를 가져오거나, 없으면 캐시된 마지막 위치 사용
    const start = getUnitCenter(attackerId) || lastKnownPositions.current.get(attackerId);
    const end = getUnitCenter(targetId) || lastKnownPositions.current.get(targetId);
    const attackerEl = getUnitElement(attackerId);

    if (start && end && attackerEl) {
      const dx = end.x - start.x;
      const dy = end.y - start.y;

      attackerEl.style.setProperty('--attack-dx', `${dx}px`);
      attackerEl.style.setProperty('--attack-dy', `${dy}px`);
      attackerEl.classList.add('attacking-unit');

      const handleImpact = (e: TransitionEvent) => {
        // transform 속성의 변화가 끝났을 때만 트리거 (다른 속성 변화 무시)
        if (e.target !== attackerEl) return;
        if (e.propertyName !== 'transform' && e.propertyName !== 'left' && e.propertyName !== 'top') return;
        
        attackerEl.removeEventListener('transitionend', handleImpact);

        // 충돌 시점 로직 실행 (데미지 적용, 사운드 등)
        if (onAttackImpact) {
          onAttackImpact(log);
        }

        // 원위치로 복귀 애니메이션 시작
        attackerEl.classList.add('returning');
        
        setTimeout(() => {
          attackerEl.classList.remove('attacking-unit', 'returning');
          attackerEl.style.removeProperty('--attack-dx');
          attackerEl.style.removeProperty('--attack-dy');
        }, 400);
      };

      attackerEl.addEventListener('transitionend', handleImpact);
    } 
  };
};