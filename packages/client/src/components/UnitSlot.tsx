import type { FieldUnit } from "@card-game/shared";
import type { MouseEvent } from "react";

interface UnitSlotProps {
  unit: FieldUnit | null;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  isSelected?: boolean;
}

export const UnitSlot = ({ unit, onClick, isSelected }: UnitSlotProps) => {
  if (!unit) return <div className="field-slot empty"></div>;

  return (
    <div className={`field-slot occupied ${isSelected ? 'selected' : ''} ${unit.hasAttacked ? 'exhausted' : ''}`} onClick={onClick}>
      <div className="unit-stats">
        <span className="unit-atk">⚔️{unit.attackPower}</span>
        <span className="unit-name">{unit.name}</span>
        <span className="unit-hp">❤️{unit.currentHp}</span>
      </div>
    </div>
  );
};