import "../css/GameEffects.css";
import "../css/UnitSlot.css";
import type { FieldUnit } from "@card-game/shared";
import { type MouseEvent, type DragEvent, useState, useEffect, forwardRef, type CSSProperties } from "react";
import { useUnitEffects } from "../hooks/useUnitEffects";
import { UnitTooltip } from "./UnitTooltip";
import { Card } from "./Card";

interface UnitSlotProps {
  unit: FieldUnit | null;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  isSelected?: boolean;
  isMergeTarget?: boolean;
  onDrop?: (e: DragEvent) => void;
  draggable?: boolean;
  onDragStart?: (e: DragEvent<HTMLDivElement>) => void;
}

export const UnitSlot = forwardRef<HTMLDivElement, UnitSlotProps>(({ unit, onClick, isSelected, isMergeTarget, onDrop, draggable, onDragStart }, ref) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { damageText, isShaking, isLevelUp, floatingTexts } = useUnitEffects(unit);

  // 유닛 정보가 바뀌면(라운드 전환 등) 툴팁 닫기
  useEffect(() => {
    setShowTooltip(false);
  }, [unit]);

  return (
    <div 
      ref={ref} 
      className={`field-slot ${unit ? "occupied-wrapper" : "empty"} ${isMergeTarget ? "merge-target" : ""}`} 
      onClick={onClick} 
      style={{ position: 'relative' }}
      onDrop={onDrop}
      onDragOver={(e) => {
        e.preventDefault();
        if (isMergeTarget) {
          e.dataTransfer.dropEffect = "move";
        } else {
          e.dataTransfer.dropEffect = "none";
        }
      }}
    >
       {/* 데미지 텍스트 (유닛 유무와 상관없이 슬롯 위에 표시) */}
       {damageText && <div key={damageText.id} className="floating-damage">{damageText.text}</div>}

       {/* 스탯 증가 플로팅 텍스트 */}
       {floatingTexts.map(ft => (
         <div 
           key={ft.id} 
           className="floating-stat" 
           style={{ color: ft.color } as CSSProperties}
         >
           {ft.text}
         </div>
       ))}

       {/* 레벨업 이펙트 */}
       {isLevelUp && (
         <div className="level-up-container">
           <div className="level-up-ring"></div>
           <div className="level-up-particles">
             {[...Array(12)].map((_, i) => (
               <div key={i} className="particle-spark" style={{ '--i': i } as CSSProperties} />
             ))}
           </div>
           <div className="level-up-text">LEVEL UP!</div>
         </div>
       )}

       {unit && (
       <Card 
         card={unit}
         variant="field"
         isSelected={isSelected}
         isExhausted={unit.hasAttacked}
         isShaking={isShaking}
         onMouseEnter={() => setShowTooltip(true)}
         onMouseLeave={() => setShowTooltip(false)}
         draggable={draggable}
         onDragStart={onDragStart}
       >
          {/* 스택 배지 (카드 위에 표시) */}
          {unit.cardStack > 1 && (
            <div key={unit.cardStack} className="stack-badge">x{unit.cardStack}</div>
          )}

          {/* 툴팁: 마우스 오버 시 상세 정보 표시 */}
          {showTooltip && <UnitTooltip unit={unit} />}
       </Card>
       )}
    </div>
  );
});

UnitSlot.displayName = "UnitSlot";