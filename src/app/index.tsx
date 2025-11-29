import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createGrid } from "./constants";
import { useGameLogic } from "./hooks/useGameLogic";

// Components
import { GameTile } from "./components/GameTile";
import { DraggableUnit } from "./components/DraggableUnit";
import { BattleLog } from "./components/BattleLog";
import { FloatingActionMenu } from "./components/FloatingActionMenu";
import { TurnPointBar } from "./components/TurnPointBar";
import { Popup } from "./components/Popup";

export default function App() {
  const [tiles] = useState(createGrid());

  const {
    phase,
    units,
    turnPoints,
    currentActor,
    attackingUnitId,
    hitTargetId,
    logs,
    interactionState,
    moveUnit,
    initializeGame,
    startBattle,
    handleGuard,
    handleWait,
    handleMoveInitiate, // <--- New
    handleTileClick, // <--- New
    openSkillsMenu,
    enterTargetingMode,
    cancelInteraction,
    handleUnitClick
  } = useGameLogic();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-white text-gray-800 p-8 flex flex-col items-center relative font-sans">

        {/* --- START OVERLAY --- */}
        {phase === "START" && (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-50">
            <button
              onClick={initializeGame}
              className="bg-green-500 text-white px-8 py-4 rounded-lg font-bold text-2xl shadow-lg hover:scale-105 transition-transform"
            >
              START GAME
            </button>
          </div>
        )}

        {/* --- HEADER --- */}
        {phase !== "START" && (
          <div className="w-full max-w-6xl flex justify-between mb-8 p-2 border-b">
             <h1 className="text-2xl font-bold text-slate-800">Tactics Game</h1>
             <div className="flex gap-4">
                <p className="font-bold text-lg">
                  Phase: <span className="text-yellow-600">{phase}</span>
                </p>
             </div>
          </div>
        )}

        {/* --- MAIN LAYOUT --- */}
        <div className="flex gap-8 items-start w-full max-w-6xl justify-center relative">

            {/* LEFT: TURN POINTS */}
            <div className="w-20 flex flex-col items-center sticky top-8">
               {(phase === "PLAYER_TURN" || phase === "ENEMY_TURN") && (
                 <>
                   <div className="text-3xl font-black mb-2 text-slate-700">{turnPoints}</div>
                   <TurnPointBar points={turnPoints} />
                 </>
               )}
            </div>

            {/* CENTER: BOARD & CONTROLS */}
            <div className="flex flex-col items-center gap-6">

                {/* GAME BOARD */}
                <div
                  className="grid grid-cols-5 gap-2 bg-slate-900 p-4 rounded-xl shadow-2xl relative"
                  style={{ width: "600px" }}
                >
                  {tiles.map((tile, i) => {
                    const unitOnTile = units.find(
                      (u) => u.x === tile.x && u.y === tile.y && !u.isDead
                    );

                    const isCurrentActor = phase === "PLAYER_TURN" && currentActor?.id === unitOnTile?.id;

                    const isTargetable =
                        interactionState.mode === "TARGETING" &&
                        unitOnTile?.type === "ENEMY";

                    // Move validation
                    let isValidMove = false;
                    if (interactionState.mode === "MOVING" && currentActor) {
                         const dx = Math.abs(tile.x - currentActor.x!);
                         const dy = Math.abs(tile.y - currentActor.y!);
                         const isOccupied = units.some(u => u.x === tile.x && u.y === tile.y && !u.isDead);
                         isValidMove = (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0) && !isOccupied;
                    }

                    return (
                      <GameTile
                        key={i}
                        tile={tile}
                        moveUnit={moveUnit}
                        phase={phase}
                        isValidMove={isValidMove}
                        onClick={() => handleTileClick(tile.x, tile.y)}
                      >
                        {unitOnTile && (
                          <DraggableUnit
                            unit={unitOnTile}
                            isTurn={
                              phase === "PLAYER_TURN" &&
                              currentActor?.id === unitOnTile.id
                            }
                            isAttacking={attackingUnitId === unitOnTile.id}
                            isHit={hitTargetId === unitOnTile.id}
                            isTargetable={!!isTargetable}
                            onClick={() => handleUnitClick(unitOnTile.id)}
                          />
                        )}

                        {isCurrentActor && (
                          <FloatingActionMenu
                            currentActor={currentActor}
                            interactionState={interactionState}
                            turnPoints={turnPoints}
                            onGuard={handleGuard}
                            onWait={handleWait}
                            onMove={handleMoveInitiate}
                            onOpenSkills={openSkillsMenu}
                            onSelectSkill={enterTargetingMode}
                          />
                        )}
                      </GameTile>
                    );
                  })}
                </div>

                {/* STAGING AREA (Only in Setup) */}
                {phase === "SETUP" && (
                  <div className="bg-slate-700 p-4 rounded w-full max-w-2xl flex gap-4 min-h-[80px] justify-center shadow-inner">
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

                {/* BOTTOM CONTROLS AREA */}
                <div className="h-16 flex items-center justify-center w-full">

                    {phase === "SETUP" && (
                      <button
                        onClick={startBattle}
                        className="bg-red-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-red-600 transition-colors text-lg"
                      >
                        ENTER BATTLE
                      </button>
                    )}

                    {/* CANCEL BUTTON */}
                    {interactionState.mode !== "MENU" && phase === "PLAYER_TURN" && (
                        <button
                            onClick={cancelInteraction}
                            className="bg-slate-600 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            CANCEL ACTION
                        </button>
                    )}

                    {/* Enemy Turn Indicator */}
                    {phase === "ENEMY_TURN" && (
                        <div className="text-red-600 font-bold animate-pulse text-xl">
                            Enemy Phase...
                        </div>
                    )}
                </div>

            </div>

            {/* RIGHT: LOGS */}
            <div className="w-80 h-[600px] flex flex-col sticky top-8">
               <h3 className="font-bold mb-2 text-slate-500 uppercase tracking-wider text-sm">Battle Log</h3>
               <div className="flex-1 overflow-hidden rounded-lg shadow-md border border-gray-200">
                  <BattleLog logs={logs} />
               </div>
            </div>

        </div>

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
