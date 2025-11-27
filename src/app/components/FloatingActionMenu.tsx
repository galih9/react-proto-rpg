import React from 'react';
import type { InteractionState, Unit, Element } from '../types';

interface Props {
  currentActor: Unit;
  interactionState: InteractionState;
  onGuard: () => void;
  onWait: () => void;
  onOpenSkills: () => void;
  onSelectSkill: (skill: Element) => void;
}

export const FloatingActionMenu: React.FC<Props> = ({
  currentActor,
  interactionState,
  onGuard,
  onWait,
  onOpenSkills,
  onSelectSkill,
}) => {
  // Common button style
  const btnClass = "block w-full text-left bg-white border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 rounded mb-1 shadow-sm font-sans";

  if (interactionState.mode === 'MENU') {
    return (
      <div className="absolute top-0 -right-4 translate-x-full z-20 w-32 bg-gray-50/90 backdrop-blur p-2 rounded shadow-xl border border-gray-300">
        <button onClick={onOpenSkills} className={btnClass}>Attack</button>
        <button onClick={onGuard} className={btnClass}>Guard</button>
        <button onClick={onWait} className={btnClass}>Wait</button>
      </div>
    );
  }

  if (interactionState.mode === 'SKILLS') {
    return (
      <div className="absolute top-0 -right-4 translate-x-full z-20 w-40 bg-gray-50/90 backdrop-blur p-2 rounded shadow-xl border border-gray-300">
        <div className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wide">Select Skill</div>
        <button
            onClick={() => onSelectSkill('PHYSICAL')}
            className={btnClass}
        >
            Basic Attack (1p)
        </button>
        <button
            onClick={() => onSelectSkill(currentActor.element)}
            className={btnClass}
        >
            {currentActor.element} (2p)
        </button>
      </div>
    );
  }

  // In TARGETING mode, the menu might be hidden or show instructions.
  // The user asked for "Attack -> Skills -> Target".
  // Usually when targeting, the menu disappears or shows "Select Target".
  // Based on the request, the interaction moves to the board.
  // We can render a small tooltip or nothing here.
  if (interactionState.mode === 'TARGETING') {
      return (
        <div className="absolute top-0 -right-4 translate-x-full z-20 w-32 bg-yellow-100/90 backdrop-blur p-2 rounded shadow-xl border border-yellow-300 text-center">
            <span className="text-xs font-bold text-yellow-800">Select Target</span>
        </div>
      );
  }

  return null;
};
