import type { FieldUnit } from "@card-game/shared";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import "./GameBoard.css"; // 스타일 적용을 위해 확인

interface UnitSlotProps {
  unit: FieldUnit | null;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  isSelected?: boolean;
  onActivateAbility?: (abilityIndex: number) => void;
}

export const UnitSlot = ({ unit, onClick, isSelected, onActivateAbility }: UnitSlotProps) => {
  const [damageText, setDamageText] = useState<{ id: number; text: string } | null>(null);
  const prevUnitRef = useRef<FieldUnit | null>(unit);

  useEffect(() => {
    const prevUnit = prevUnitRef.current;
    
    // 1. 유닛이 있고 체력이 감소한 경우
    if (unit && prevUnit && unit.id === prevUnit.id && unit.currentHp < prevUnit.currentHp) {
      const damage = prevUnit.currentHp - unit.currentHp;
      triggerDamageEffect(damage);
    }
    // 2. 유닛이 파괴된 경우 (이전에는 있었는데 지금은 null)
    else if (!unit && prevUnit) {
      // 죽기 직전 체력만큼 데미지를 입었다고 가정하고 표시
      triggerDamageEffect(prevUnit.currentHp);
    }

    prevUnitRef.current = unit;
  }, [unit]);

  const triggerDamageEffect = (amount: number) => {
    setDamageText({ id: Date.now(), text: `-${amount}` });
    // 애니메이션 시간(1s) 후 상태 초기화 (선택 사항, 키값 변경으로 재실행됨)
    setTimeout(() => setDamageText(null), 1000);
  };

  return (
    <div className={`field-slot ${unit ? "occupied-wrapper" : "empty"}`} onClick={onClick} style={{ position: 'relative' }}>
       {/* 데미지 텍스트 (유닛 유무와 상관없이 슬롯 위에 표시) */}
       {damageText && <div key={damageText.id} className="floating-damage">{damageText.text}</div>}

       {unit && (
       <div className={`field-unit ${isSelected ? "selected" : ""} ${unit.hasAttacked ? "exhausted" : ""}`}>
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
};