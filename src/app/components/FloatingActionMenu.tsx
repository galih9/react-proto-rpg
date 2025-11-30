import React from 'react';
import type { InteractionState, Unit, Element } from '../types';

interface Props {
  currentActor: Unit;
  interactionState: InteractionState;
  turnPoints: number;
  onGuard: () => void;
  onWait: () => void;
  onMove: () => void;
  onOpenSkills: () => void;
  onSelectSkill: (skill: Element) => void;
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
      <div className="absolute top-0 -right-4 translate-x-full z-20 w-40 bg-gray-50/90 backdrop-blur p-2 rounded shadow-xl border border-gray-300">
        <div className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wide">Select Skill</div>
        {currentActor.skills.map((skill) => (
          <button
            key={skill}
            onClick={() => onSelectSkill(skill)}
            disabled={turnPoints < 2} // All skills now cost 2 base points
            className={btnClass}
          >
            {skill === 'PHYSICAL' ? 'Basic Attack' : skill} (2p)
          </button>
        ))}
      </div>
    );
  }

  if (interactionState.mode === 'TARGETING') {
      return (
        <div className="absolute top-0 -right-4 translate-x-full z-20 w-32 bg-yellow-100/90 backdrop-blur p-2 rounded shadow-xl border border-yellow-300 text-center">
            <span className="text-xs font-bold text-yellow-800">Select Target</span>
        </div>
      );
  }

  if (interactionState.mode === 'MOVING') {
      return (
        <div className="absolute top-0 -right-4 translate-x-full z-20 w-32 bg-green-100/90 backdrop-blur p-2 rounded shadow-xl border border-green-300 text-center">
            <span className="text-xs font-bold text-green-800">Select Tile</span>
        </div>
      );
  }

  return null;
};
