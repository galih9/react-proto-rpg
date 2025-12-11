import React from "react";
import { useDrag } from "react-dnd";
import type { ActiveUnit } from "../types";
import { DRAG_TYPE } from "../constants";
import { HealthBar } from "./HealthBar";

interface Props {
  unit: ActiveUnit;
  isTurn: boolean;
  isAttacking: boolean;
  isHit: boolean;
  isTargetable: boolean;
  onClick?: () => void;
}

const getUnitDisplayInfo = (unit: ActiveUnit) => {
  // Use first letter of Name
  if (unit.name === "Wall") return { char: 'W' };
  if (unit.name === "Jailankung") return { char: 'J' };

  switch (unit.id) {
    case 'p1': return { char: 'M' };
    case 'p2': return { char: 'P' };
    case 'e1': return { char: 'P' };
    case 'e2': return { char: 'P' };
    default: return { char: unit.displayName.charAt(0).toUpperCase() };
  }
};

const isDeployable = (unit: ActiveUnit) => {
    return unit.name === "Wall" || unit.name === "Jailankung";
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
    canDrag: unit.type === "PLAYER" && !isDeployable(unit), // Deployables not draggable? Assuming they are static.
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const isMicroUnit = isDeployable(unit);

  let bgColor = "";
  let borderColor = "";
  let shapeClass = "rounded-md"; // Default rounded rect

  if (isMicroUnit) {
      shapeClass = "rounded-full";
      bgColor = "bg-white"; // Placeholder? User said "blue border for friendly... red border for enemy"
      // Wait, user said "circle, blue border for friendly... red border for enemy".
      // Let's use neutral bg or maybe slight tint?
      bgColor = unit.type === "PLAYER" ? "bg-blue-100" : "bg-red-100";
      borderColor = unit.type === "PLAYER" ? "border-4 border-blue-500" : "border-4 border-red-500";
  } else {
      bgColor = unit.type === "PLAYER" ? "bg-blue-500" : "bg-red-500";
      borderColor = isTurn ? "border-4 border-yellow-400" : "border-2 border-white";
  }

  const scale = isTurn || isAttacking ? 1.1 : 1;
  const translateX = isAttacking ? (unit.type === "ENEMY" ? -50 : 50) : 0;

  const transformStyle = {
      transform: `translateX(${translateX}px) scale(${scale})`
  };

  const hitClass = isHit ? "animate-bounce-hit" : "";
  const cursorClass = isTargetable ? "cursor-crosshair hover:ring-4 hover:ring-red-400" : "cursor-pointer";

  const { char } = getUnitDisplayInfo(unit);

  // If Micro Unit, text color should be dark
  const textColor = isMicroUnit ? "text-gray-800" : "text-white";

  return (
    <div
      ref={unit.type === "PLAYER" && !isMicroUnit ? (drag as unknown as React.Ref<HTMLDivElement>) : null}
      onClick={onClick}
      style={{ ...transformStyle }}
      className={`
        ${bgColor} ${borderColor} ${hitClass} ${cursorClass} ${shapeClass} w-12 h-12 flex items-center justify-center ${textColor} font-bold shadow-lg
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
        {unit.floatingTextEvents.map((event) => {
            let colorClass = "";
            switch (event.type) {
                case 'DAMAGE': colorClass = "text-red-500"; break;
                case 'HEAL': colorClass = "text-green-500"; break;
                case 'WEAK': colorClass = "text-yellow-400"; break;
                case 'RESIST': colorClass = "text-blue-400"; break;
                case 'NULL': colorClass = "text-gray-400"; break;
                case 'DRAIN': colorClass = "text-purple-400"; break;
                case 'DEFLECT': colorClass = "text-slate-200"; break;
                default: colorClass = "text-white";
            }
            // Add bold and shadow for affinity text
            const extraStyle = (event.type !== 'DAMAGE' && event.type !== 'HEAL')
                ? { textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }
                : {};

            return (
              <div
                key={event.id}
                style={extraStyle}
                className={`
                  animate-float-up font-bold text-lg
                  ${colorClass}
                `}
              >
                {event.text}
              </div>
            );
        })}
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

          {/* SP Bar */}
          {!isMicroUnit && (
             <div className="h-1 bg-gray-300 rounded overflow-hidden border border-gray-400 w-full">
                <div
                   className="h-full bg-blue-500 transition-all duration-300 ease-out"
                   style={{ width: `${Math.max(0, Math.min(100, (unit.sp / unit.maxSp) * 100))}%` }}
                />
             </div>
          )}

          {/* Status Effects List */}
          <div className="flex flex-col gap-0.5">
            {unit.isChanneling && (
                <div className="text-[10px] font-bold text-amber-500 text-center animate-pulse leading-none">
                Channeling...
                </div>
            )}
            {unit.statusEffects.map((effect) => {
              let colorClass = "text-slate-600";
              if (effect.type === 'ATTACK_UP') colorClass = "text-blue-600";
              if (effect.type === 'ATTACK_DOWN' || effect.type === 'DEFENSE_DOWN') colorClass = "text-red-600";
              if (effect.type === 'POISON') colorClass = "text-purple-600";

              return (
                <div key={effect.id} className={`text-[9px] font-bold text-center leading-none ${colorClass}`}>
                  {effect.name} ({effect.duration})
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
