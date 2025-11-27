import React from "react";
import { useDrag } from "react-dnd";
import type { Unit } from "../types";
import { DRAG_TYPE } from "../constants";

interface Props {
  unit: Unit;
  isTurn: boolean;
  isAttacking: boolean;
  isHit: boolean; // <--- New Prop
}

export const DraggableUnit: React.FC<Props> = ({
  unit,
  isTurn,
  isAttacking,
  isHit,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: DRAG_TYPE,
    item: { id: unit.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const bgColor = unit.type === "PLAYER" ? "bg-blue-500" : "bg-red-500";
  const border = isTurn
    ? "border-4 border-yellow-400"
    : "border-2 border-white";

  const transformValue =
    unit.type === "PLAYER"
      ? "translateX(50px) scale(1.1)"
      : "translateX(-50px) scale(1.1)";
  const transformStyle = isAttacking
    ? { transform: transformValue }
    : { transform: "translateX(0) scale(1)" };

  // Hit Animation Class
  const hitClass = isHit ? "animate-bounce-hit" : "";
  return (
    <div
      ref={unit.type === "PLAYER" ? (drag as any) : null}
      style={{ ...transformStyle }}
      className={`
        ${bgColor} ${border} ${hitClass} rounded-full w-12 h-12 flex items-center justify-center text-white font-bold shadow-lg
        transition-all duration-300 ease-in-out cursor-pointer relative z-10
        ${isDragging ? "opacity-50" : "opacity-100"}
      `}
    >
      {unit.type === "PLAYER" ? "P" : "E"}
      <div className="absolute -bottom-6 text-xs text-black font-mono w-max bg-white/80 px-1 rounded">
        HP: {unit.hp}
      </div>
    </div>
  );
};
