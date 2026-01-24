import type { FieldUnit } from "@card-game/shared";
import { useState } from "react";

export const useGameInteraction = (
  isPlayerTurn: boolean,
  attack: (attackerId: string, targetId: string) => void
) => {
  const [selectedAttackerId, setSelectedAttackerId] = useState<string | null>(null);

  const handlePlayerUnitClick = (unit: FieldUnit) => {
    if (!isPlayerTurn) return;
    if (unit.hasAttacked) return;
    if (selectedAttackerId === unit.id) {
      setSelectedAttackerId(null);
    } else {
      setSelectedAttackerId(unit.id);
    }
  };

  const handleEnemyClick = (targetId: string) => {
    if (selectedAttackerId) {
      attack(selectedAttackerId, targetId);
      setSelectedAttackerId(null);
    }
  };

  return { selectedAttackerId, handlePlayerUnitClick, handleEnemyClick };
};