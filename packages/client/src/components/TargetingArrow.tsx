import "../css/GameEffects.css";

interface Point {
  x: number;
  y: number;
}

interface TargetingArrowProps {
  start: Point;
  end: Point;
}

export const TargetingArrow = ({ start, end }: TargetingArrowProps) => {
  return (
    <svg className="targeting-arrow-overlay">
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="#e74c3c" />
        </marker>
      </defs>
      <line
        className="targeting-line"
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        markerEnd="url(#arrowhead)"
      />
    </svg>
  );
};