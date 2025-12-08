import React from 'react';
import type { InteractionState, ActiveUnit, ISkillType } from '../types';

interface Props {
  currentActor: ActiveUnit;
  interactionState: InteractionState;
  turnPoints: number;
  onGuard: () => void;
  onWait: () => void;
  onMove: () => void;
  onOpenSkills: () => void;
  onSelectSkill: (skill: ISkillType) => void;
}

export const FloatingActionMenu: React.FC<Props> = ({
  currentActor,
  interactionState,
  turnPoints,
  onGuard,
  onWait,
  onMove,
  onOpenSkills,
  onSelectSkill,
}) => {
  // Common button style
  const btnClass = "block w-full text-left bg-white border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 rounded mb-1 shadow-sm font-sans disabled:opacity-50 disabled:cursor-not-allowed";

  if (interactionState.mode === 'EXECUTING') {
    return null;
  }

  if (interactionState.mode === 'MENU') {
    return (
      <div className="absolute top-0 -right-4 translate-x-full z-20 w-32 bg-gray-50/90 backdrop-blur p-2 rounded shadow-xl border border-gray-300">
        <button onClick={onOpenSkills} className={btnClass}>Attack</button>
        <button onClick={onGuard} className={btnClass}>Guard</button>
        <button onClick={onWait} className={btnClass}>Wait</button>
        <button onClick={onMove} disabled={turnPoints < 1} className={btnClass}>Move (1p)</button>
      </div>
    );
  }

  if (interactionState.mode === 'SKILLS') {
    return (
      <div className="absolute top-0 -right-4 translate-x-full z-20 w-48 bg-gray-50/90 backdrop-blur p-2 rounded shadow-xl border border-gray-300">
        <div className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wide">Select Skill</div>
        {currentActor.skills.map((skill) => (
          <button
            key={skill.id}
            onClick={() => onSelectSkill(skill)}
            disabled={turnPoints < skill.pointCost}
            className={btnClass}
            title={skill.description}
          >
            <div className="flex justify-between items-center">
                <span>{skill.name}</span>
                <span className="text-xs bg-gray-200 px-1 rounded text-gray-700">{skill.pointCost}p</span>
            </div>
            <div className="text-[10px] text-gray-500">{skill.element}</div>
          </button>
        ))}
      </div>
    );
  }

  if (interactionState.mode === 'TARGETING') {
      return (
        <div className="absolute top-0 -right-4 translate-x-full z-20 w-32 bg-yellow-100/90 backdrop-blur p-2 rounded shadow-xl border border-yellow-300 text-center pointer-events-none">
            <span className="text-xs font-bold text-yellow-800">Select Target</span>
        </div>
      );
  }

  if (interactionState.mode === 'DEPLOYING') {
      return (
        <div className="absolute top-0 -right-4 translate-x-full z-20 w-32 bg-blue-100/90 backdrop-blur p-2 rounded shadow-xl border border-blue-300 text-center pointer-events-none">
            <span className="text-xs font-bold text-blue-800">Select Tile</span>
        </div>
      );
  }

  if (interactionState.mode === 'MOVING') {
      return (
        <div className="absolute top-0 -right-4 translate-x-full z-20 w-32 bg-green-100/90 backdrop-blur p-2 rounded shadow-xl border border-green-300 text-center pointer-events-none">
            <span className="text-xs font-bold text-green-800">Select Tile</span>
        </div>
      );
  }

  return null;
};
