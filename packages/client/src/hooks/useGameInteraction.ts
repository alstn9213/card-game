import { type FieldUnit, TargetType, type Ability } from "@card-game/shared";
import { useState } from "react";

export const useGameInteraction = (
  isPlayerTurn: boolean,
  attack: (attackerId: string, targetId: string) => void,
  activateAbility: (sourceId: string, index: number, targetId?: string) => void
) => {
  const [selectedAttackerId, setSelectedAttackerId] = useState<string | null>(null);
  const [pendingAbility, setPendingAbility] = useState<{ sourceId: string; abilityIndex: number; targetType: TargetType } | null>(null);

  const handlePlayerUnitClick = (unit: FieldUnit) => {
    if (!isPlayerTurn) return;
    
    // 능력 타겟팅 중이라면 아군 유닛도 타겟이 될 수 있음 (예: 힐, 버프)
    if (pendingAbility) {
      if (pendingAbility.targetType === TargetType.PLAYER_FIELD || pendingAbility.targetType === TargetType.SELF) {
        activateAbility(pendingAbility.sourceId, pendingAbility.abilityIndex, unit.id);
        setPendingAbility(null);
      }
      return;
    }

    if (unit.hasAttacked) return;
    if (selectedAttackerId === unit.id) {
      setSelectedAttackerId(null);
    } else {
      setSelectedAttackerId(unit.id);
      setPendingAbility(null); // 공격 선택 시 능력 타겟팅 취소
    }
  };

  const handleEnemyClick = (targetId: string) => {
    // 1. 능력 타겟팅 처리
    if (pendingAbility) {
      if (pendingAbility.targetType === TargetType.SINGLE_ENEMY || pendingAbility.targetType === TargetType.ALL_ENEMIES) {
        activateAbility(pendingAbility.sourceId, pendingAbility.abilityIndex, targetId);
        setPendingAbility(null);
      }
      return;
    }

    // 2. 일반 공격 처리
    if (selectedAttackerId) {
      attack(selectedAttackerId, targetId);
      setSelectedAttackerId(null);
    }
  };

  const handleAbilityClick = (unitId: string, abilityIndex: number, ability: Ability) => {
    if (!isPlayerTurn) return;

    if (ability.targetType === TargetType.NONE || ability.targetType === TargetType.SELF) {
      // 타겟팅 불필요: 즉시 발동
      activateAbility(unitId, abilityIndex);
      setPendingAbility(null);
    } else {
      // 타겟팅 필요: 모드 전환
      setPendingAbility({ sourceId: unitId, abilityIndex, targetType: ability.targetType });
      setSelectedAttackerId(null); // 능력 사용 시 공격 선택 취소
    }
  };

  // 모든 상호작용 취소 (빈 공간 클릭 시)
  const cancelInteraction = () => {
    setSelectedAttackerId(null);
    setPendingAbility(null);
  };

  return { selectedAttackerId, pendingAbility, handlePlayerUnitClick, handleEnemyClick, handleAbilityClick, cancelInteraction };
};