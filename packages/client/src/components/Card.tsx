import { CardType, type CardData, type FieldUnit } from "@card-game/shared";
import { type MouseEvent, type ReactNode, type DragEvent } from "react";
import "../css/Card.css";
import "../css/UnitSlot.css";

interface CardProps {
  card: CardData | FieldUnit;
  variant: "hand" | "field";
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isSelected?: boolean;
  isExhausted?: boolean;
  isShaking?: boolean;
  children?: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  draggable?: boolean;
  onDragStart?: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: DragEvent<HTMLDivElement>) => void;
}

export const Card = ({
  card,
  variant,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isSelected,
  isExhausted,
  isShaking,
  children,
  style,
  className = "",
  draggable,
  onDragStart,
  onDragEnd,
}: CardProps) => {
  const isHand = variant === "hand";
  const isField = variant === "field";
  const unit = card as FieldUnit;

  const classes = [
    "card",
    isField && "field",
    isSelected && "selected",
    isExhausted && "exhausted",
    isShaking && "shake-effect",
    isHand && "draw-effect",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={style}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {/* 카드가 패에 있을 경우 코스트를 보여준다. */}
      {!isField && <div className="card-cost">💰 {card.cost}</div>}
      <div className="card-content">
        <div className="card-name">{card.name}</div>
      </div>

      {/* 유닛 카드는 체력과 공격력을 보여준다. */}
      {card.type === CardType.UNIT && (
        <>
          <div className="stat-badge atk">
            ⚔️ {(card as FieldUnit).attackPower}
          </div>
          <div className="stat-badge hp">
            ❤️ {isField ? `${unit.currentHp}/${unit.maxHp}` : (card as FieldUnit).maxHp}
          </div>
        </>
      )}
      {children}
    </div>
  );
};