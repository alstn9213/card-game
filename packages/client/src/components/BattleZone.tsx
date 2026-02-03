import { UnitSlot } from "./UnitSlot";
import type { FieldUnit, CardData } from "@card-game/shared";
import type { DragEvent } from "react";

interface BattleZoneProps {
  playerField: (FieldUnit | null)[];
  selectedAttackerId: string | null;
  setUnitRef: (id: string, el: HTMLDivElement | null) => void;
  onUnitClick: (unit: FieldUnit, clientX: number, clientY: number) => void;
  onDrop?: (e: DragEvent) => void;
  onDragOver?: (e: DragEvent) => void;
  onUnitDrop?: (e: DragEvent, unitId: string) => void;
  onUnitDragStart?: (e: DragEvent, unit: FieldUnit) => void;
  draggedCard?: CardData | null;
  isDragging?: boolean;
}

export const BattleZone = ({ 
  playerField, 
  selectedAttackerId, 
  setUnitRef, 
  onUnitClick,
  onDrop,
  onDragOver,
  onUnitDrop,
  onUnitDragStart,
  draggedCard,
  isDragging
}: BattleZoneProps) => {
  return (
    <div 
      className={`battle-zone ${isDragging ? "drag-active" : ""}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <div className="field-row">
        {playerField && playerField.map((unit, i) => (
          <UnitSlot 
            key={i} 
            unit={unit} 
            isSelected={unit?.id === selectedAttackerId}
            isMergeTarget={!!(unit && draggedCard && unit.cardId === draggedCard.cardId)}
            ref={(el) => {
              if (unit) setUnitRef(unit.id, el);
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (unit) onUnitClick(unit, e.clientX, e.clientY);
            }}
            onDrop={(e) => {
              if (unit && onUnitDrop) {
                onUnitDrop(e, unit.id);
              }
            }}
            draggable={!!unit}
            onDragStart={(e) => {
              if (unit && onUnitDragStart) onUnitDragStart(e, unit);
            }}
          />
        ))}
      </div>
    </div>
  );
};
