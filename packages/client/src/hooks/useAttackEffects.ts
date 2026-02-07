import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { TargetSource, type GameState } from "@card-game/shared";
import { applyLogToState } from "../utils/GameLogUtils";
import { useTimeoutManager } from "./useTimeoutManager";
import "../css/AttackEffects.css";

export const useAttackEffects = (
  gameState: GameState | null,
  setGameState: Dispatch<SetStateAction<GameState | null>>,
  getUnitCenter: (id: string) => { x: number; y: number } | null,
  getUnitElement: (id: string) => HTMLElement | null
) => {
  const lastKnownPositions = useRef<Map<string, {x: number, y: number}>>(new Map());
  const processedLogCount = useRef<number>(0);
  const { addTimeout } = useTimeoutManager();

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
        addTimeout(() => {
          triggerAttackAnimation(log);
        }, index * 600);
      });
      processedLogCount.current = attackLogs.length;
    }
  }, [attackLogs, addTimeout]);

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

      let isImpactHandled = false;

      const handleImpact = (e?: TransitionEvent) => {
        if (isImpactHandled) return;
        
        if (e) {
          if (e.target !== attackerEl) return;
          if (e.propertyName !== 'transform') return;
        }
        
        isImpactHandled = true;
        attackerEl.removeEventListener('transitionend', handleImpact);

        // GameLogUtils를 사용하여 상태 업데이트 (애니메이션 동기화)
        setGameState((prev) => (prev ? applyLogToState(prev, log) : null));

        // 원위치로 복귀 애니메이션 시작
        attackerEl.classList.add('returning');
        
        addTimeout(() => {
          attackerEl.classList.remove('attacking-unit', 'returning');
          attackerEl.style.removeProperty('--attack-dx');
          attackerEl.style.removeProperty('--attack-dy');
        }, 400);
      };

      attackerEl.addEventListener('transitionend', handleImpact);
      
      // 안전장치: 트랜지션 이벤트가 발생하지 않을 경우를 대비 (0.2s duration + buffer)
      addTimeout(() => handleImpact(), 300);
    } 
  };
};