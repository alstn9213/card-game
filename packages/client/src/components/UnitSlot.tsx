import type { FieldUnit } from "@card-game/shared";
import type { MouseEvent } from "react";
import './GameBoard.css'; // 스타일 적용을 위해 확인

interface UnitSlotProps {
  unit: FieldUnit | null;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  isSelected?: boolean;
}

export const UnitSlot = ({ unit, onClick, isSelected }: UnitSlotProps) => {
  // 유닛이 없을 때: 빈 슬롯 표시
  if (!unit) {
    return <div className="field-slot empty"></div>;
  }

  // 유닛이 있을 때: 필드 유닛(토큰) 스타일 적용
  return (
    <div className="field-slot occupied-wrapper" onClick={onClick}>
       <div className={`field-unit ${isSelected ? 'selected' : ''} ${unit.hasAttacked ? 'exhausted' : ''}`}>
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
       </div>
    </div>
  );
};