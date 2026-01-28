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
    <svg
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="#e74c3c" />
        </marker>
      </defs>
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="#e74c3c"
        strokeWidth="4"
        markerEnd="url(#arrowhead)"
        strokeDasharray="10, 5"
      />
    </svg>
  );
};