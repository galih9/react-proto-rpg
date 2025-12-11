import { useState, useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createGrid } from "./constants";
import { useGameLogic } from "./hooks/useGameLogic";
import { getValidTargets } from "./utils/targeting";

// Components
import { GameTile } from "./components/GameTile";
import { DraggableUnit } from "./components/DraggableUnit";
import { BattleLog } from "./components/BattleLog";
import { FloatingActionMenu } from "./components/FloatingActionMenu";
import { TurnPointBar } from "./components/TurnPointBar";
import { Popup } from "./components/Popup";
import { PauseMenu } from "./components/PauseMenu";
import { Encyclopedia } from "./components/Encyclopedia";
import { AboutModal } from "./components/AboutModal";

export default function App() {
  const [tiles] = useState(createGrid());
  const [isPaused, setIsPaused] = useState(false);
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const {
    phase,
    units,
    turnPoints,
    currentActor,
    activeEnemyId,
    attackingUnitId,
    hitTargetId,
    logs,
    interactionState,
    moveUnit,
    startGameFlow,
    initializeGame,
    startBattle,
    handleGuard,
    handleWait,
    handleMoveInitiate,
    handleRegularAttack,
    handleTileClick,
    openSkillsMenu,
    enterTargetingMode,
    cancelInteraction,
    handleUnitClick
  } = useGameLogic();

  // Memoize valid targets for the current interaction state to avoid recalculating on every render
  const validTargetIds = useMemo(() => {
    if (interactionState.mode === "TARGETING" && interactionState.selectedSkill && currentActor) {
      return getValidTargets(interactionState.selectedSkill, currentActor, units);
    }
    return [];
  }, [interactionState, currentActor, units]);

  // Derived state to check if we are in main game flow
  const isGameActive = !['LOADING', 'MENU', 'PRE_GAME_LOAD', 'START'].includes(phase);
  const isMenuPhase = phase === "MENU";
  const isLoadingPhase = phase === "LOADING" || phase === "PRE_GAME_LOAD";

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-slate-950 text-slate-200 p-8 flex flex-col items-center relative font-sans">

        {/* --- LOADING SCREEN --- */}
        {isLoadingPhase && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950">
             <h1 className="text-4xl font-bold tracking-widest text-slate-300 animate-pulse">
                LOADING...
             </h1>
          </div>
        )}

        {/* --- MAIN MENU --- */}
        {isMenuPhase && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950">
             <div className="flex flex-col items-center gap-8 p-12 bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl w-full max-w-md">
                 <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-8">
                    TACTICS GAME
                 </h1>

                 <button
                   onClick={startGameFlow}
                   className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-bold text-xl rounded-lg shadow-lg transform hover:scale-105 transition-all"
                 >
                    START GAME
                 </button>

                 <button
                   onClick={() => setShowEncyclopedia(true)}
                   className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xl rounded-lg shadow-lg transform hover:scale-105 transition-all"
                 >
                    ENCYCLOPEDIA
                 </button>

                 <button
                   onClick={() => setShowAbout(true)}
                   className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xl rounded-lg shadow-lg transform hover:scale-105 transition-all"
                 >
                    ABOUT
                 </button>
             </div>
          </div>
        )}

        {/* --- HEADER --- */}
        {isGameActive && (
          <div className="w-full max-w-6xl flex justify-between mb-8 p-2 border-b border-slate-700">
             <h1 className="text-2xl font-bold text-slate-400">Tactics Game</h1>
             <div className="flex gap-4 items-center">
                <p className="font-bold text-lg">
                  Phase: <span className="text-yellow-500">{phase}</span>
                </p>
                <button
                  onClick={() => setIsPaused(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-full transition-colors border border-slate-600"
                  aria-label="Pause Game"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
             </div>
          </div>
        )}

        {/* --- MAIN GAME LAYOUT --- */}
        {isGameActive && (
          <div className="flex gap-8 items-start w-full max-w-6xl justify-center relative">

            {/* LEFT: TURN POINTS */}
            <div className="w-20 flex flex-col items-center sticky top-8">
               {(phase === "PLAYER_TURN" || phase === "ENEMY_TURN") && (
                 <>
                   <div className="text-3xl font-black mb-2 text-slate-400">{turnPoints}</div>
                   <TurnPointBar points={turnPoints} />
                 </>
               )}
            </div>

            {/* CENTER: BOARD & CONTROLS */}
            <div className="flex flex-col items-center gap-6">

                {/* GAME BOARD */}
                <div
                  className="grid grid-cols-5 gap-2 bg-slate-900 p-4 rounded-xl shadow-2xl relative border border-slate-700"
                  style={{ width: "600px" }}
                >
                  {tiles.map((tile, i) => {
                    const unitOnTile = units.find(
                      (u) => u.x === tile.x && u.y === tile.y && !u.isDead
                    );

                    const isCurrentActor = phase === "PLAYER_TURN" && currentActor?.id === unitOnTile?.id;

                    // Updated: Use the pre-calculated validTargetIds list
                    const isTargetable = unitOnTile && validTargetIds.includes(unitOnTile.id);

                    // Move validation
                    let isValidMove = false;
                    if (interactionState.mode === "MOVING" && currentActor) {
                         const dx = Math.abs(tile.x - currentActor.x!);
                         const dy = Math.abs(tile.y - currentActor.y!);
                         const isOccupied = units.some(u => u.x === tile.x && u.y === tile.y && !u.isDead);
                         isValidMove = (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0) && !isOccupied && tile.x <= 2;
                    } else if (interactionState.mode === "DEPLOYING" && interactionState.selectedSkill?.targetType === "DEPLOY_ANY") {
                         const isOccupied = units.some(u => u.x === tile.x && u.y === tile.y && !u.isDead);
                         isValidMove = !isOccupied && tile.x <= 2;
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
                              (phase === "PLAYER_TURN" && currentActor?.id === unitOnTile.id) ||
                              (phase === "ENEMY_TURN" && activeEnemyId === unitOnTile.id)
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
                            onRegularAttack={handleRegularAttack}
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
                  <div className="bg-slate-800 p-4 rounded w-full max-w-2xl flex gap-4 min-h-20 justify-center shadow-inner border border-slate-700">
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
                <div className="h-16 flex items-center justify-end w-full">

                    {phase === "SETUP" && (
                      <button
                        onClick={startBattle}
                        className="bg-red-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-red-700 transition-colors text-lg"
                      >
                        ENTER BATTLE
                      </button>
                    )}

                    {/* CANCEL BUTTON */}
                    {interactionState.mode !== "MENU" && interactionState.mode !== "EXECUTING" && phase === "PLAYER_TURN" && (
                        <div className="flex flex-col items-center">
                          <button
                              onClick={cancelInteraction}
                              className="bg-slate-700 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:bg-slate-600 transition-colors flex items-center gap-2 border border-slate-600"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              CANCEL ACTION
                          </button>
                          {interactionState.warning && (
                            <div className="text-red-400 font-bold text-sm mt-1 animate-pulse bg-slate-900/80 px-2 rounded">
                              {interactionState.warning}
                            </div>
                          )}
                        </div>
                    )}

                    {/* Enemy Turn Indicator */}
                    {phase === "ENEMY_TURN" && (
                        <div className="text-red-500 font-bold animate-pulse text-xl">
                            Enemy Phase...
                        </div>
                    )}
                </div>

            </div>

            {/* RIGHT: LOGS */}
            <div className="w-80 h-[600px] flex flex-col sticky top-8">
               <h3 className="font-bold mb-2 text-slate-500 uppercase tracking-wider text-sm">Battle Log</h3>
               <div className="flex-1 overflow-hidden rounded-lg shadow-md border border-slate-700 bg-slate-900">
                  <BattleLog logs={logs} />
               </div>
            </div>

          </div>
        )}

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

        {/* --- PAUSE MENU --- */}
        {isPaused && !showEncyclopedia && !showAbout && (
          <PauseMenu
            onResume={() => setIsPaused(false)}
            onRestart={() => {
              initializeGame();
              setIsPaused(false);
            }}
            onEncyclopedia={() => setShowEncyclopedia(true)}
          />
        )}

        {/* --- ENCYCLOPEDIA --- */}
        {showEncyclopedia && (
          <Encyclopedia onClose={() => setShowEncyclopedia(false)} />
        )}

        {/* --- ABOUT --- */}
        {showAbout && (
          <AboutModal onClose={() => setShowAbout(false)} />
        )}
      </div>
    </DndProvider>
  );
}
