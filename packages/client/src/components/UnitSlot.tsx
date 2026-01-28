import "../css/GameEffects.css";
import "../css/UnitSlot.css";
import type { FieldUnit } from "@card-game/shared";
import { type MouseEvent, useState, forwardRef } from "react";
import { useUnitEffects } from "../hooks/useUnitEffects";
import { UnitTooltip } from "./UnitTooltip";

interface UnitSlotProps {
  unit: FieldUnit | null;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  isSelected?: boolean;
  onActivateAbility?: (abilityIndex: number) => void;
}

export const UnitSlot = forwardRef<HTMLDivElement, UnitSlotProps>(({ unit, onClick, isSelected, onActivateAbility }, ref) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { damageText, isShaking } = useUnitEffects(unit);

  return (
    <div ref={ref} className={`field-slot ${unit ? "occupied-wrapper" : "empty"}`} onClick={onClick} style={{ position: 'relative' }}>
       {/* 데미지 텍스트 (유닛 유무와 상관없이 슬롯 위에 표시) */}
       {damageText && <div key={damageText.id} className="floating-damage">{damageText.text}</div>}

       {unit && (
       <div 
         className={`field-unit ${isSelected ? "selected" : ""} ${unit.hasAttacked ? "exhausted" : ""} ${isShaking ? "shake-effect" : ""}`}
         onMouseEnter={() => setShowTooltip(true)}
         onMouseLeave={() => setShowTooltip(false)}
       >
          {/* 공격력 버블 */}
          <div className="unit-stat atk">
            {unit.attackPower}
          </div>
          
          {/* 유닛 이름 */}
          <div className="unit-image-placeholder">
            {/* 추후 이미지가 들어갈 공간, 현재는 아이콘으로 대체 */}
            Monster
          </div>
          <div className="unit-name">{unit.name}</div>

          {/* 체력 버블 */}
          <div className="unit-stat hp">
            {unit.currentHp}
          </div>

          {/* 툴팁: 마우스 오버 시 상세 정보 표시 */}
          {showTooltip && <UnitTooltip unit={unit} />}

          {/* 능력이 있고 선택된 경우 능력 사용 버튼 오버레이 표시 */}
          {isSelected && unit.abilities && unit.abilities.length > 0 && onActivateAbility && (
            <div className="ability-overlay">
              {unit.abilities.map((ability, idx) => (
                <button 
                  key={idx} 
                  className="ability-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // 유닛 선택 해제 방지
                    onActivateAbility(idx);
                  }}
                  title={ability.description}
                >
                </button>
              ))}
            </div>
          )}
       </div>
       )}
    </div>
  );
});

UnitSlot.displayName = "UnitSlot";