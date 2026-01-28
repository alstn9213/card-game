import type { FieldUnit } from "@card-game/shared";

interface UnitTooltipProps {
  unit: FieldUnit;
}

export const UnitTooltip = ({ unit }: UnitTooltipProps) => {
  return (
    <div className="unit-tooltip">
      <div className="tooltip-title">{unit.name}</div>
      <div className="tooltip-desc">{unit.description}</div>
      {unit.abilities && unit.abilities.length > 0 && (
        <div className="tooltip-abilities">
          {unit.abilities.map((ab, i) => (
            <div key={i} className="tooltip-ability-item">
              <span className="tooltip-ability-type">[{ab.type}]</span> {ab.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};