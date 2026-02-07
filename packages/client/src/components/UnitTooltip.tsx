import type { FieldUnit } from "@card-game/shared";
import { useLayoutEffect, useRef, useState } from "react";

interface UnitTooltipProps {
  unit: FieldUnit;
}

export const UnitTooltip = ({ unit }: UnitTooltipProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    const el = tooltipRef.current;
    
    if (!el) {
      return;
    }

    const rect = el.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    
    const updates: React.CSSProperties = {};

    // 오른쪽 화면 밖으로 나가는 경우
    if (rect.right > viewportWidth) {
      const overflow = rect.right - viewportWidth + 10; // 10px 여유
      updates.transform = `translateX(calc(-50% - ${overflow}px))`;
    }
    // 왼쪽 화면 밖으로 나가는 경우
    else if (rect.left < 0) {
      const overflow = Math.abs(rect.left) + 10;
      updates.transform = `translateX(calc(-50% + ${overflow}px))`;
    }

    // 위쪽 화면 밖으로 나가는 경우 (기본이 위쪽 표시이므로 top < 0 체크)
    if (rect.top < 0) {
      updates.bottom = "auto";
      updates.top = "120%"; // 아래쪽으로 표시 변경
    }

    setStyle(updates);
  }, []);

  return (
    <div className="unit-tooltip" ref={tooltipRef} style={style}>
      <div className="tooltip-title">{unit.name}</div>
      <div className="tooltip-desc">{unit.description}</div>
    </div>
  );
};