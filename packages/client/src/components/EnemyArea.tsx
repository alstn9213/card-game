import { UnitSlot } from "./UnitSlot";
import type { FieldUnit } from "@card-game/shared";

interface EnemyAreaProps {
  enemyField: (FieldUnit | null)[];
  onEnemyClick: (id: string) => void;
  setUnitRef: (id: string, el: HTMLDivElement | null) => void;
}

export const EnemyArea = ({ enemyField, onEnemyClick, setUnitRef }: EnemyAreaProps) => {
  return (
    <div className="enemy-area" onClick={(e) => {
      e.stopPropagation();
      onEnemyClick("enemy");
    }}>
      {/* 적 필드 */}
      <div className="field-row enemy-field">
        {enemyField && enemyField.map((unit, i) => (
          <UnitSlot 
            key={i} 
            unit={unit} 
            ref={(el) => {
              if (unit) setUnitRef(unit.id, el);
            }}
            onClick={(e) => {
              e?.stopPropagation(); 
              if (unit) onEnemyClick(unit.id);
            }}
          />
        ))}
      </div>
    </div>
  );
};
