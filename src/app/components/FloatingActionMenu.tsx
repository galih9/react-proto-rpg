import React from 'react';
import type { InteractionState, ActiveUnit, ISkillType } from '../types';

interface Props {
  currentActor: ActiveUnit;
  interactionState: InteractionState;
  turnPoints: number;
  onGuard: () => void;
  onWait: () => void;
  onMove: () => void;
  onRegularAttack: () => void;
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
  onRegularAttack,
  onOpenSkills,
  onSelectSkill,
}) => {
  // Common button style
  // Changed: Removed font-sans (to use Excalifont), added text-black
  const btnClass = "block w-full text-left bg-white border border-gray-300 px-3 py-1 text-sm text-black hover:bg-gray-100 rounded mb-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";

  if (interactionState.mode === 'EXECUTING') {
    return null;
  }

  if (interactionState.mode === 'MENU') {
    return (
      <div className="absolute top-0 -right-4 translate-x-full z-20 w-32 bg-gray-50/90 backdrop-blur p-2 rounded shadow-xl border border-gray-300">
        <button onClick={onRegularAttack} disabled={turnPoints < 2} className={btnClass}>Attack (0sp)</button>
        <button onClick={onOpenSkills} className={btnClass}>Skills</button>
        <button onClick={onGuard} className={btnClass}>Guard</button>
        <button onClick={onWait} className={btnClass}>Wait</button>
        <button onClick={onMove} disabled={turnPoints < 1} className={btnClass}>Move (1p)</button>
      </div>
    );
  }

  if (interactionState.mode === 'SKILLS') {
    return (
      <div className="absolute top-0 -right-4 translate-x-full z-20 w-48 bg-gray-50/90 backdrop-blur p-2 rounded shadow-xl border border-gray-300">
        {/* Changed: text-gray-500 -> text-black for header */}
        <div className="text-xs text-black mb-2 font-bold uppercase tracking-wide">Select Skill</div>
        {currentActor.skills.map((skill) => (
          <button
            key={skill.id}
            onClick={() => onSelectSkill(skill)}
            disabled={turnPoints < skill.pointCost || currentActor.sp < skill.spCost}
            className={btnClass}
            title={skill.description}
          >
            <div className="flex justify-between items-center">
                {/* Skill Name in Black */}
                <span className="text-black font-bold">{skill.name}</span>
                <div className="flex gap-1">
                  {/* Costs in Darker Colors */}
                  <span className="text-xs bg-gray-200 px-1 rounded text-gray-900 font-bold">{skill.pointCost}p</span>
                  <span className="text-xs bg-blue-100 px-1 rounded text-blue-900 font-bold">{skill.spCost}sp</span>
                </div>
            </div>
            {/* Element in Dark Gray */}
            <div className="text-[10px] text-gray-800">{skill.element}</div>
          </button>
        ))}
      </div>
    );
  }

  if (interactionState.mode === 'TARGETING') {
      return (
        <div className="absolute top-0 -right-4 translate-x-full z-20 w-32 bg-yellow-100/90 backdrop-blur p-2 rounded shadow-xl border border-yellow-300 text-center pointer-events-none">
            <span className="text-xs font-bold text-yellow-900">Select Target</span>
        </div>
      );
  }

  if (interactionState.mode === 'DEPLOYING') {
      return (
        <div className="absolute top-0 -right-4 translate-x-full z-20 w-32 bg-blue-100/90 backdrop-blur p-2 rounded shadow-xl border border-blue-300 text-center pointer-events-none">
            <span className="text-xs font-bold text-blue-900">Select Tile</span>
        </div>
      );
  }

  if (interactionState.mode === 'MOVING') {
      return (
        <div className="absolute top-0 -right-4 translate-x-full z-20 w-32 bg-green-100/90 backdrop-blur p-2 rounded shadow-xl border border-green-300 text-center pointer-events-none">
            <span className="text-xs font-bold text-green-900">Select Tile</span>
        </div>
      );
  }

  return null;
};
