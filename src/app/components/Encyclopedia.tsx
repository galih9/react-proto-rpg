import { useState } from "react";
import { UNITS, SENTRY } from "../data/units";
import type { IUnit, ISkillType } from "../types";

interface EncyclopediaProps {
  onClose: () => void;
}

export function Encyclopedia({ onClose }: EncyclopediaProps) {
  // Cast SENTRY to IUnit[] to satisfy TypeScript since it's an empty array in the source
  const allUnits: IUnit[] = [...UNITS, ...(SENTRY as unknown as IUnit[])];

  // Default to first unit if available, or undefined. Handle empty list case gracefully.
  const [selectedUnit, setSelectedUnit] = useState<IUnit | null>(allUnits.length > 0 ? allUnits[0] : null);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
      <div className="bg-slate-800 text-white rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden border border-slate-600">

        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
          <h2 className="text-2xl font-bold tracking-wider text-yellow-500">ENCYCLOPEDIA</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Unit List */}
          <div className="w-1/3 border-r border-slate-700 overflow-y-auto bg-slate-800/50">
            {allUnits.map((unit) => (
              <button
                key={unit.id}
                onClick={() => setSelectedUnit(unit)}
                className={`w-full text-left p-4 border-b border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-3 ${
                  selectedUnit?.id === unit.id ? "bg-slate-700 border-l-4 border-l-yellow-500" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center font-bold text-lg">
                    {unit.name.charAt(0)}
                </div>
                <div>
                    <div className="font-bold text-lg">{unit.name}</div>
                    <div className="text-xs text-slate-400 truncate w-40">{unit.shortDescription}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Right Panel: Details */}
          <div className="w-2/3 p-8 overflow-y-auto bg-slate-900/50">
            {selectedUnit ? (
              <div className="space-y-6">

                {/* Header Info */}
                <div className="flex items-start justify-between border-b border-slate-700 pb-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">{selectedUnit.name}</h1>
                        <p className="text-slate-400 italic text-lg">{selectedUnit.lore}</p>
                    </div>
                    <div className="bg-slate-800 px-4 py-2 rounded text-center min-w-[100px]">
                        <div className="text-xs text-slate-500 uppercase font-bold">Base HP</div>
                        <div className="text-2xl font-bold text-green-400">{selectedUnit.baseHp}</div>
                    </div>
                </div>

                {/* Skills */}
                <div>
                    <h3 className="text-xl font-bold text-yellow-500 mb-4 border-b border-slate-700 pb-2 inline-block">Skills</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {selectedUnit.skills.length === 0 && (
                            <p className="text-slate-500 italic">No active skills.</p>
                        )}
                        {selectedUnit.skills.map((skill: ISkillType) => (
                            <div key={skill.id} className="bg-slate-800 p-4 rounded border border-slate-700">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="font-bold text-lg text-cyan-400">{skill.name}</div>
                                    <div className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-400">Cost: {skill.pointCost} TP</div>
                                </div>
                                <div className="text-sm text-slate-300 mb-2">{skill.description}</div>
                                <div className="flex gap-2 text-xs">
                                    <span className="bg-slate-700 px-2 py-1 rounded text-slate-400">Element: {skill.element}</span>
                                    <span className="bg-slate-700 px-2 py-1 rounded text-slate-400">Target: {skill.targetType}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Passive Skills (if any) */}
                    {selectedUnit.passiveSkill && selectedUnit.passiveSkill.length > 0 && (
                         <div className="mt-4">
                            <h4 className="text-lg font-bold text-slate-400 mb-2">Passive Skills</h4>
                            <div className="grid grid-cols-1 gap-4">
                                {selectedUnit.passiveSkill.map((skill: ISkillType) => (
                                    <div key={skill.id} className="bg-slate-800/50 p-3 rounded border border-slate-700/50">
                                        <div className="font-bold text-cyan-400/80">{skill.name}</div>
                                        <div className="text-sm text-slate-400">{skill.description}</div>
                                    </div>
                                ))}
                            </div>
                         </div>
                    )}
                </div>

                {/* Status Affinities */}
                <div>
                    <h3 className="text-xl font-bold text-yellow-500 mb-4 border-b border-slate-700 pb-2 inline-block">Elemental Affinity</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {Object.entries(selectedUnit.status).map(([element, affinity]) => (
                            <div key={element} className="flex justify-between bg-slate-800 p-2 rounded px-3 border border-slate-700">
                                <span className="font-bold text-slate-300 capitalize text-sm">{element.replace('_', ' ')}</span>
                                <span className={`font-bold text-sm ${getAffinityColor(affinity as string)}`}>{affinity}</span>
                            </div>
                        ))}
                    </div>
                </div>

              </div>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                    Select a unit to view details
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getAffinityColor(affinity: string) {
    switch (affinity) {
        case "WEAK": return "text-red-500";
        case "RESIST": return "text-blue-400";
        case "NULL": return "text-gray-400";
        case "DRAIN": return "text-purple-400";
        case "DEFLECT": return "text-yellow-400";
        default: return "text-slate-500";
    }
}
