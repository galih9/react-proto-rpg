import React from "react";
import { useDrag } from "react-dnd";
import type { Unit } from "../types";
import { DRAG_TYPE } from "../constants";

interface Props {
  unit: Unit;
  isTurn: boolean;
  isAttacking: boolean;
  isHit: boolean;
  isTargetable: boolean; // <--- New Prop: Valid target in targeting mode
  onClick?: () => void;  // <--- New Prop: Click handler
}

export const DraggableUnit: React.FC<Props> = ({
  unit,
  isTurn,
  isAttacking,
  isHit,
  isTargetable,
  onClick
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: DRAG_TYPE,
    item: { id: unit.id },
    canDrag: unit.type === "PLAYER", // Only players are draggable (setup phase usually)
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const bgColor = unit.type === "PLAYER" ? "bg-blue-500" : "bg-red-500";
  const border = isTurn
    ? "border-4 border-yellow-400"
    : "border-2 border-white";

  const transformStyle = isAttacking
    ? { transform: "translateX(50px) scale(1.1)" }
    : { transform: "translateX(0) scale(1)" };

  // Hit Animation Class
  const hitClass = isHit ? "animate-bounce-hit" : "";

  // Targetable Cursor
  const cursorClass = isTargetable ? "cursor-crosshair hover:ring-4 hover:ring-red-400" : "cursor-pointer";

  return (
    <div
      ref={unit.type === "PLAYER" ? (drag as any) : null}
      onClick={onClick}
      style={{ ...transformStyle }}
      className={`
        ${bgColor} ${border} ${hitClass} ${cursorClass} rounded-full w-12 h-12 flex items-center justify-center text-white font-bold shadow-lg
        transition-all duration-300 ease-in-out relative z-10
        ${isDragging ? "opacity-50" : "opacity-100"}
      `}
    >
      {/* Target Indicator Arrow */}
      {isTargetable && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-red-500 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      )}

      {unit.type === "PLAYER" ? "P" : "E"}

      {/* HP Bar / Text */}
      <div className="absolute -bottom-6 text-xs text-black font-mono w-max bg-white/80 px-1 rounded">
        HP: {unit.hp}
      </div>
    </div>
  );
};
