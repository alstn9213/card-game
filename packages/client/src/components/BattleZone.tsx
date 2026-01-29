import { UnitSlot } from "./UnitSlot";
import type { FieldUnit, Ability } from "@card-game/shared";

interface BattleZoneProps {
  playerField: (FieldUnit | null)[];
  selectedAttackerId: string | null;
  setUnitRef: (id: string, el: HTMLDivElement | null) => void;
  onUnitClick: (unit: FieldUnit, clientX: number, clientY: number) => void;
  onActivateAbility: (unitId: string, abilityIndex: number, ability: Ability) => void;
}

export const BattleZone = ({ 
  playerField, 
  selectedAttackerId, 
  setUnitRef, 
  onUnitClick, 
  onActivateAbility 
}: BattleZoneProps) => {
  return (
    <div className="battle-zone">
      <div className="field-row player-field">
        {playerField && playerField.map((unit, i) => (
          <UnitSlot 
            key={i} 
            unit={unit} 
            isSelected={unit?.id === selectedAttackerId}
            ref={(el) => {
              if (unit) setUnitRef(unit.id, el);
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (unit) onUnitClick(unit, e.clientX, e.clientY);
            }}
            onActivateAbility={(idx) => {
              if (unit && unit.abilities) {
                onActivateAbility(unit.id, idx, unit.abilities[idx]);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};
