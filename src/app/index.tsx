import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createGrid } from "./constants";
import { useGameLogic } from "./hooks/useGameLogic";

// Components
import { GameTile } from "./components/GameTile";
import { DraggableUnit } from "./components/DraggableUnit";
import { ActionPanel } from "./components/ActionPanel";
import { BattleLog } from "./components/BattleLog"; // <--- Now importing the real component

export default function App() {
  const [tiles] = useState(createGrid());

  const {
    phase,
    units,
    turnPoints,
    currentActor,
    enemies,
    attackingUnitId,
    logs,
    moveUnit,
    initializeGame,
    startBattle,
    handleAttack,
  } = useGameLogic();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-slate-800 text-white p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4">React RPG Prototype</h1>

        {/* ... (Header, Board, Staging Area, ActionPanel code remains the same) ... */}

        {/* --- HEADER --- */}
        <div className="w-full max-w-4xl flex justify-between mb-4 bg-slate-700 p-4 rounded">
          <div>
            <p className="font-bold">
              Phase: <span className="text-yellow-400">{phase}</span>
            </p>
            {phase === "PLAYER_TURN" && (
              <p>
                Turn Points: <span className="text-cyan-400">{turnPoints}</span>
              </p>
            )}
          </div>
          <div>
            {phase === "START" && (
              <button
                onClick={initializeGame}
                className="bg-green-500 px-6 py-2 rounded font-bold"
              >
                START GAME
              </button>
            )}
            {phase === "SETUP" && (
              <button
                onClick={startBattle}
                className="bg-red-500 px-6 py-2 rounded font-bold"
              >
                ENTER BATTLE
              </button>
            )}
          </div>
        </div>

        {/* --- BOARD --- */}
        <div
          className="grid grid-cols-5 gap-2 bg-slate-900 p-4 rounded shadow-2xl mb-4"
          style={{ width: "600px" }}
        >
          {tiles.map((tile, i) => {
            const unitOnTile = units.find(
              (u) => u.x === tile.x && u.y === tile.y && !u.isDead
            );
            return (
              <GameTile key={i} tile={tile} moveUnit={moveUnit} phase={phase}>
                {unitOnTile && (
                  <DraggableUnit
                    unit={unitOnTile}
                    isTurn={
                      phase === "PLAYER_TURN" &&
                      currentActor?.id === unitOnTile.id
                    }
                    isAttacking={attackingUnitId === unitOnTile.id}
                  />
                )}
              </GameTile>
            );
          })}
        </div>

        {/* --- STAGING AREA --- */}
        {phase === "SETUP" && (
          <div className="bg-slate-700 p-4 rounded w-full max-w-2xl mb-4 flex gap-4">
            {units
              .filter((u) => u.type === "PLAYER" && u.x === null)
              .map((u) => (
                <DraggableUnit
                  key={u.id}
                  unit={u}
                  isTurn={false}
                  isAttacking={false}
                />
              ))}
          </div>
        )}

        {/* --- ACTIONS --- */}
        {phase === "PLAYER_TURN" && currentActor && (
          <ActionPanel
            currentActor={currentActor}
            enemies={enemies}
            onAttack={handleAttack}
          />
        )}

        {/* --- LOGS (Replaced inline component with the new file) --- */}
        <BattleLog logs={logs} />
      </div>
    </DndProvider>
  );
}
