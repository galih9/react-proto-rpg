import React from "react";
import { useDrag } from "react-dnd";
import type { Unit } from "../types";
import { DRAG_TYPE } from "../constants";
import { HealthBar } from "./HealthBar";

interface Props {
  unit: Unit;
  isTurn: boolean;
  isAttacking: boolean;
  isHit: boolean;
  isTargetable: boolean;
  onClick?: () => void;
}

const getUnitDisplayInfo = (id: string) => {
  switch (id) {
    case 'p1': return { char: 'M' };
    case 'p2': return { char: 'P' };
    case 'e1': return { char: 'P' };
    case 'e2': return { char: 'P' };
    default: return { char: id.charAt(0).toUpperCase() };
  }
};

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
    canDrag: unit.type === "PLAYER",
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const bgColor = unit.type === "PLAYER" ? "bg-blue-500" : "bg-red-500";
  const border = isTurn
    ? "border-4 border-yellow-400"
    : "border-2 border-white";

  const transformStyle = isAttacking
    ? { transform: `translateX(${unit.type === "ENEMY" ? -50 : 50}px) scale(1.1)` }
    : { transform: "translateX(0) scale(1)" };

  const hitClass = isHit ? "animate-bounce-hit" : "";
  const cursorClass = isTargetable ? "cursor-crosshair hover:ring-4 hover:ring-red-400" : "cursor-pointer";

  const { char } = getUnitDisplayInfo(unit.id);

  return (
    <div
      ref={unit.type === "PLAYER" ? (drag as unknown as React.Ref<HTMLDivElement>) : null}
      onClick={onClick}
      style={{ ...transformStyle }}
      className={`
        ${bgColor} ${border} ${hitClass} ${cursorClass} rounded-full w-12 h-12 flex items-center justify-center text-white font-bold shadow-lg
        transition-all duration-300 ease-in-out relative z-10
        ${isDragging ? "opacity-50" : "opacity-100"}
      `}
    >
      {/* Target Indicator */}
      {isTargetable && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-red-500 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      )}

      {/* Floating Combat Text Container */}
      <div className="absolute bottom-0 mb-[-30px] ml-16 -translate-x-1/2 flex flex-col items-center pointer-events-none z-50">
        {unit.floatingTextEvents.map((event) => (
          <div
            key={event.id}
            className={`
              animate-float-up font-bold text-lg
              ${event.type === 'DAMAGE' ? 'text-red-500' : 'text-green-500'}
            `}
          >
            {event.value > 0 && event.type === 'HEAL' ? '+' : ''}
            {event.value}
          </div>
        ))}
      </div>

      {/* Character Letter */}
      {char}

      {/* Name and Health Bar Container */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-20 w-28 pointer-events-none">
        <div className="bg-white/80 border border-slate-300 rounded-lg p-1 shadow-sm flex flex-col gap-1 backdrop-blur-sm">
          <div className="text-[10px] font-bold text-slate-800 leading-none text-left px-0.5">
            {unit.displayName}
          </div>
          <HealthBar current={unit.hp} max={unit.maxHp} width="w-full" />
        </div>
      </div>
    </div>
  );
};
