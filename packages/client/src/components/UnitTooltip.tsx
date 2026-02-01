import type { FieldUnit } from "@card-game/shared";

interface UnitTooltipProps {
  unit: FieldUnit;
}

export const UnitTooltip = ({ unit }: UnitTooltipProps) => {
  return (
    <div className="unit-tooltip">
      <div className="tooltip-title">{unit.name}</div>
      <div className="tooltip-desc">{unit.description}</div>
    </div>
  );
};