import "../css/GameEffects.css";
import "../css/UnitSlot.css";
import type { FieldUnit } from "@card-game/shared";
import { type MouseEvent, useState, forwardRef } from "react";
import { useUnitEffects } from "../hooks/useUnitEffects";
import { UnitTooltip } from "./UnitTooltip";
import { Card } from "./Card";

interface UnitSlotProps {
  unit: FieldUnit | null;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  isSelected?: boolean;
  onActivateAbility?: (abilityIndex: number) => void;
}

export const UnitSlot = forwardRef<HTMLDivElement, UnitSlotProps>(({ unit, onClick, isSelected }, ref) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { damageText, isShaking } = useUnitEffects(unit);

  return (
    <div ref={ref} className={`field-slot ${unit ? "occupied-wrapper" : "empty"}`} onClick={onClick} style={{ position: 'relative' }}>
       {/* 데미지 텍스트 (유닛 유무와 상관없이 슬롯 위에 표시) */}
       {damageText && <div key={damageText.id} className="floating-damage">{damageText.text}</div>}

       {unit && (
       <Card 
         card={unit}
         variant="field"
         isSelected={isSelected}
         isExhausted={unit.hasAttacked}
         isShaking={isShaking}
         onMouseEnter={() => setShowTooltip(true)}
         onMouseLeave={() => setShowTooltip(false)}
       >

          {/* 툴팁: 마우스 오버 시 상세 정보 표시 */}
          {showTooltip && <UnitTooltip unit={unit} />}
       </Card>
       )}
    </div>
  );
});

UnitSlot.displayName = "UnitSlot";