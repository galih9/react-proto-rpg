import React from 'react';
import type { Unit, Element } from '../types';

interface Props {
  currentActor: Unit;
  enemies: Unit[];
  onAttack: (targetId: string, element: Element) => void;
}

export const ActionPanel: React.FC<Props> = ({ currentActor, enemies, onAttack }) => {
  return (
    <div className="bg-slate-700 p-4 rounded w-full max-w-2xl mb-4 flex gap-4 items-start">
      <div className="w-1/3">
        <h3 className="font-bold text-blue-300 mb-2">Current: {currentActor.id}</h3>
        <p className="text-xs mb-2">Element: {currentActor.element}</p>
      </div>

      <div className="w-2/3">
        <h3 className="font-bold mb-2">Select Target & Skill:</h3>
        <div className="flex flex-col gap-2">
          {enemies.map(enemy => (
            <div key={enemy.id} className="flex items-center justify-between bg-slate-800 p-2 rounded">
              <span>{enemy.id} (HP: {enemy.hp}) <span className="text-xs text-gray-400">Weak: {enemy.weakness}</span></span>
              <div className="flex gap-2">
                <button 
                  onClick={() => onAttack(enemy.id, 'FIRE')}
                  className="bg-orange-600 text-xs px-2 py-1 rounded hover:bg-orange-500"
                >
                  Fire (2pt)
                </button>
                <button 
                  onClick={() => onAttack(enemy.id, 'PHYSICAL')}
                  className="bg-gray-500 text-xs px-2 py-1 rounded hover:bg-gray-400"
                >
                  Punch (2pt)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};