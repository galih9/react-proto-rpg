import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createGrid } from "./constants";
import { useGameLogic } from "./hooks/useGameLogic";

// Components
import { GameTile } from "./components/GameTile";
import { DraggableUnit } from "./components/DraggableUnit";
import { BattleLog } from "./components/BattleLog";
import { FloatingActionMenu } from "./components/FloatingActionMenu"; // <--- New Import
import { Popup } from "./components/Popup";

export default function App() {
  const [tiles] = useState(createGrid());

  const {
    phase,
    units,
    turnPoints,
    currentActor,
    // enemies, // Not needed directly anymore in App, managed by logic/components
    attackingUnitId,
    hitTargetId,
    logs,
    interactionState, // <--- New State
    moveUnit,
    initializeGame,
    startBattle,
    // handleAttack, // Replaced by flow
    handleGuard,
    handleWait,
    openSkillsMenu,
    enterTargetingMode,
    cancelInteraction,
    handleUnitClick
  } = useGameLogic();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-white text-gray-800 p-8 flex flex-col items-center relative">
        {phase === "START" && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <button
              onClick={initializeGame}
              className="bg-green-500 text-white px-8 py-4 rounded-lg font-bold text-2xl shadow-lg"
            >
              START GAME
            </button>
          </div>
        )}

        {/* --- HEADER --- */}
        {phase !== "START" && (
          <div className="w-full max-w-4xl flex justify-between mb-4 p-2 rounded">
            <div>
              <p className="font-bold text-lg">
                Phase: <span className="text-yellow-600">{phase}</span>
              </p>
              {(phase === "PLAYER_TURN" || phase === "ENEMY_TURN") && (
                <p>
                  Turn Points:{" "}
                  <span
                    className={
                      phase === "PLAYER_TURN" ? "text-cyan-600" : "text-red-600"
                    }
                  >
                    {turnPoints}
                  </span>
                </p>
              )}
            </div>
            {phase === "SETUP" && (
              <button
                onClick={startBattle}
                className="bg-red-500 text-white px-6 py-2 rounded font-bold"
              >
                ENTER BATTLE
              </button>
            )}
          </div>
        )}

        {/* --- BOARD --- */}
        <div
          className="grid grid-cols-5 gap-2 bg-slate-900 p-4 rounded shadow-2xl mb-4 relative" // Added relative for positioning if needed
          style={{ width: "600px" }}
        >
          {tiles.map((tile, i) => {
            const unitOnTile = units.find(
              (u) => u.x === tile.x && u.y === tile.y && !u.isDead
            );

            // Check if this unit is the current actor to show the menu
            const isCurrentActor = phase === "PLAYER_TURN" && currentActor?.id === unitOnTile?.id;

            // Check if this unit is a valid target in targeting mode
            const isTargetable =
                interactionState.mode === "TARGETING" &&
                unitOnTile?.type === "ENEMY";

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
                    isHit={hitTargetId === unitOnTile.id}
                    isTargetable={!!isTargetable} // <--- Pass targetable state
                    onClick={() => handleUnitClick(unitOnTile.id)} // <--- Pass click handler
                  />
                )}

                {/* --- FLOATING MENU --- */}
                {isCurrentActor && (
                  <FloatingActionMenu
                    currentActor={currentActor}
                    interactionState={interactionState}
                    turnPoints={turnPoints}
                    onGuard={handleGuard}
                    onWait={handleWait}
                    onOpenSkills={openSkillsMenu}
                    onSelectSkill={enterTargetingMode}
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
                  isHit={false}
                  isTargetable={false}
                />
              ))}
          </div>
        )}

        {/* --- CANCEL BUTTON (Floating Bottom Right) --- */}
        {interactionState.mode !== "MENU" && phase === "PLAYER_TURN" && (
            <div className="fixed bottom-8 right-8 z-50">
                <button
                    onClick={cancelInteraction}
                    className="bg-red-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    CANCEL
                </button>
            </div>
        )}

        {/* --- ENEMY TURN MESSAGE --- */}
        {phase === "ENEMY_TURN" && (
          <div className="bg-red-900/50 p-4 rounded w-full max-w-2xl mb-4 text-center border border-red-500 animate-pulse">
            Enemy is thinking...
          </div>
        )}

        {/* --- LOGS --- */}
        <BattleLog logs={logs} />

        {/* --- POPUPS --- */}
        {phase === "VICTORY" && (
          <Popup
            title="Victory!"
            message="You have defeated all enemies."
            onRestart={initializeGame}
          />
        )}
        {phase === "DEFEAT" && (
          <Popup
            title="Defeat!"
            message="All your units have been defeated."
            onRestart={initializeGame}
          />
        )}
      </div>
    </DndProvider>
  );
}
