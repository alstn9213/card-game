import { type FieldUnit, createError, ErrorCode, type GameError } from "@card-game/shared";
import { useState } from "react";

export const useGameInteraction = (
  isPlayerTurn: boolean,
  attack: (attackerId: string, targetId: string) => void
) => {
  const [selectedAttackerId, setSelectedAttackerId] = useState<string | null>(null);
  const [error, setError] = useState<GameError | null>(null);

  const handlePlayerUnitClick = (unit: FieldUnit) => {
    if (!isPlayerTurn) {
      setError(createError(ErrorCode.NOT_YOUR_TURN));
      return;
    }

    if (unit.hasAttacked) {
      setError(createError(ErrorCode.ALREADY_ATTACKED));
      return;
    }

    if (selectedAttackerId === unit.id) {
      setSelectedAttackerId(null);
    } 
    else {
      setSelectedAttackerId(unit.id);
    }
  };

  const handleEnemyClick = (targetId: string) => {
    if (selectedAttackerId) {
      attack(selectedAttackerId, targetId);
      setSelectedAttackerId(null);
    }
  };

  // 모든 상호작용 취소 (빈 공간 클릭 시)
  const cancelInteraction = () => {
    setSelectedAttackerId(null);
  };

  const clearError = () => setError(null);

  return { 
    selectedAttackerId,
    handlePlayerUnitClick,
    handleEnemyClick, 
    cancelInteraction,
    error,
    clearError
  };
};