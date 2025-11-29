import { useState, useEffect, useRef } from "react";
import type { Phase, Unit, Element, LogEntry, InteractionState } from "../types";
import { INITIAL_UNITS } from "../constants";

export const useGameLogic = () => {
  const [phase, setPhase] = useState<Phase>("START");
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [turnPoints, setTurnPoints] = useState(0);

  // Ref to always access latest units in async operations
  const unitsRef = useRef<Unit[]>(INITIAL_UNITS);

  // Sync Ref
  useEffect(() => {
    unitsRef.current = units;
  }, [units]);


  // Interaction State (For new UI flow)
  const [interactionState, setInteractionState] = useState<InteractionState>({
    mode: "MENU",
    selectedSkill: null,
  });

  // Target Selection & Animation States
  const [currentActorIndex, setCurrentActorIndex] = useState(0);
  const [attackingUnitId, setAttackingUnitId] = useState<string | null>(null);
  const [hitTargetId, setHitTargetId] = useState<string | null>(null);

  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (msg: string) => {
    setLogs((prev) => [{ id: Date.now(), message: msg }, ...prev]);
  };

  const moveUnit = (id: string, x: number, y: number) => {
    setUnits((prev) => prev.map((u) => (u.id === id ? { ...u, x, y } : u)));
  };

  const initializeGame = () => {
    setUnits(INITIAL_UNITS);
    setPhase("SETUP");
    addLog("Setup Phase: Drag blue units onto the left blue tiles.");
  };

  // --- BATTLE START ---
  const startBattle = () => {
    const activePlayers = units.filter(
      (u) => u.type === "PLAYER" && u.x !== null
    );
    if (activePlayers.length === 0) {
      alert("Place at least one character!");
      return;
    }
    // Instead of calling startPlayerTurn directly, we set phase
    setPhase("PLAYER_TURN");
  };

  // --- PHASE MANAGEMENT (useEffect driven) ---
  useEffect(() => {
    // We use units from the scope here, which is fine because this effect re-runs when phase changes,
    // and phase changes usually happen after state updates.
    // However, for extra safety, we can use unitsRef.current, but React state 'units' is safer for render logic.

    if (phase === "PLAYER_TURN") {
      const activePlayers = units.filter(
        (u) => u.type === "PLAYER" && u.x !== null && !u.isDead
      );
      if (activePlayers.length === 0) {
        addLog("GAME OVER - YOU LOST");
        setPhase("DEFEAT");
        return;
      }

      // Reset guarding status & interaction state
      setUnits(prev => prev.map(u => u.type === 'PLAYER' ? { ...u, isGuarding: false } : u));
      setInteractionState({ mode: "MENU", selectedSkill: null });

      const points = activePlayers.length * 2;
      setTurnPoints(points);
      setCurrentActorIndex(0);
      addLog(`>>> PLAYER TURN (Points: ${points})`);
    } else if (phase === "ENEMY_TURN") {
      const activeEnemies = units.filter((u) => u.type === "ENEMY" && !u.isDead);
      if (activeEnemies.length === 0) {
        addLog("VICTORY - ALL ENEMIES DEFEATED");
        setPhase("VICTORY");
        return;
      }
      const points = activeEnemies.length * 2;
      setTurnPoints(points);
      addLog(`>>> ENEMY TURN (Points: ${points})`);

      // Trigger AI Logic
      processEnemyTurn(points);
    }
  }, [phase]);

  const startPassivePhase = (nextPhase: "PLAYER_TURN" | "ENEMY_TURN") => {
    setPhase("PASSIVE");

    // Determine who gets healed based on who just finished their turn
    // If next is ENEMY, that means Player just finished -> Heal Player
    const healingType = nextPhase === "ENEMY_TURN" ? "PLAYER" : "ENEMY";
    addLog(`--- Passive Phase (${healingType} Heal) ---`);

    setTimeout(() => {
      // Heal Logic
      setUnits((prev) =>
        prev.map((u) => {
          if (u.type === healingType && !u.isDead && u.hp < u.maxHp) {
            return { ...u, hp: Math.min(u.maxHp, u.hp + 5) };
          }
          return u;
        })
      );

      // Transition to next active phase
      // We set phase here, allowing useEffect to pick it up with updated units state
      setPhase(nextPhase);
    }, 1500);
  };

  // --- CORE ATTACK LOGIC (Generic) ---
  const executeAttack = (
    attackerId: string,
    targetId: string,
    skillElement: Element,
    currentPoints: number,
    _isPlayer: boolean
  ) => {
    // Use Ref to find current state of units (especially for AI chain)
    // Actually, 'units' state in scope might be stale in AI loop.
    // For safety, let's look up in the ref if available, or just map carefully.

    // BUT, this function is used by UI click (Player) and AI (Enemy).
    // Player click: 'units' scope is fresh.
    // Enemy AI: 'units' scope is stale.
    const currentUnits = unitsRef.current;

    const attacker = currentUnits.find((u) => u.id === attackerId);
    const target = currentUnits.find((u) => u.id === targetId);

    if (!attacker || !target) return currentPoints;

    // 1. Animation: Attacker Moves
    setAttackingUnitId(attacker.id);

    // 2. Calculation
    let cost = 2;
    const isWeakness = target.weakness === skillElement;
    if (isWeakness) cost = 1;

    // 3. Resolve Damage (Delayed for visual sync)
    setTimeout(() => {
      let damage = isWeakness ? 20 : 10;
      if (target.isGuarding) {
        damage = Math.floor(damage / 2); // 50% damage reduction
        addLog(`${target.id} is guarding! Damage reduced.`);
      }

      // Update HP
      setUnits((prev) =>
        prev.map((u) => {
          if (u.id === target.id) {
            const newHp = Math.max(0, u.hp - damage);
            return { ...u, hp: newHp, isDead: newHp === 0 };
          }
          return u;
        })
      );

      // Trigger Target Bounce Animation
      setHitTargetId(target.id);
      setTimeout(() => setHitTargetId(null), 500); // Reset bounce after 0.5s

      addLog(
        `${attacker.id} hits ${target.id} (${skillElement}). ${
          isWeakness ? "WEAKNESS!" : ""
        } -${damage} HP`
      );
      setAttackingUnitId(null);
    }, 600);

    return currentPoints - cost;
  };

  // --- INTERACTION HELPER FUNCTIONS ---
  const openSkillsMenu = () => {
    setInteractionState({ mode: "SKILLS", selectedSkill: null });
  };

  const enterTargetingMode = (skill: Element) => {
    setInteractionState({ mode: "TARGETING", selectedSkill: skill });
  };

  const cancelInteraction = () => {
    setInteractionState({ mode: "MENU", selectedSkill: null });
  };

  // --- PLAYER ACTIONS ---

  // Called when clicking an ENEMY unit in TARGETING mode
  const handleUnitClick = (unitId: string) => {
    if (interactionState.mode !== "TARGETING" || !interactionState.selectedSkill) return;

    // Validate turn points
    if (turnPoints < 2 && interactionState.selectedSkill !== "PHYSICAL") {
       // Should be blocked by UI, but good safety
    }

    const activePlayers = units.filter(
      (u) => u.type === "PLAYER" && u.x !== null && !u.isDead
    );
    const attacker = activePlayers[currentActorIndex % activePlayers.length];

    // Ensure target is valid (Enemy)
    const target = units.find(u => u.id === unitId);
    if(!attacker || !target || target.type !== 'ENEMY') return;

    // Execute
    const newPoints = executeAttack(
      attacker.id,
      target.id,
      interactionState.selectedSkill,
      turnPoints,
      true
    );
    setTurnPoints(newPoints);

    // Reset UI
    setInteractionState({ mode: "MENU", selectedSkill: null });

    // Turn Cycle Logic
    setTimeout(() => {
      if (newPoints <= 0) {
        startPassivePhase("ENEMY_TURN");
      } else {
        setCurrentActorIndex((prev) => (prev + 1) % activePlayers.length);
        // Also reset UI for next actor just in case
        setInteractionState({ mode: "MENU", selectedSkill: null });
      }
    }, 700);
  };

  const handleGuard = () => {
    if (turnPoints < 1 || phase !== "PLAYER_TURN") return;

    const activePlayers = units.filter(
      (u) => u.type === "PLAYER" && u.x !== null && !u.isDead
    );
    const currentActor = activePlayers[currentActorIndex % activePlayers.length];

    if (!currentActor) return;

    setUnits(prev => prev.map(u => u.id === currentActor.id ? { ...u, isGuarding: true } : u));
    addLog(`${currentActor.id} is guarding.`);

    const newPoints = turnPoints - 1;
    setTurnPoints(newPoints);

    setTimeout(() => {
      if (newPoints <= 0) {
        startPassivePhase("ENEMY_TURN");
      } else {
        setCurrentActorIndex(prev => (prev + 1) % activePlayers.length);
      }
    }, 200);
  };

  const handleMoveInitiate = () => {
    if (turnPoints < 1) return;
    setInteractionState({ mode: "MOVING", selectedSkill: null });
  };

  const handleTileClick = (x: number, y: number) => {
    if (interactionState.mode !== "MOVING" || phase !== "PLAYER_TURN") return;

    const activePlayers = units.filter(
        (u) => u.type === "PLAYER" && u.x !== null && !u.isDead
    );
    const currentActor = activePlayers[currentActorIndex % activePlayers.length];
    if (!currentActor || currentActor.x === null || currentActor.y === null) return;

    // Validate Move (1 tile radius)
    const dx = Math.abs(x - currentActor.x);
    const dy = Math.abs(y - currentActor.y);
    const isAdjacent = (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);

    // Validate Occupancy
    const isOccupied = units.some(u => u.x === x && u.y === y && !u.isDead);

    if (isAdjacent && !isOccupied) {
        // Execute Move
        moveUnit(currentActor.id, x, y);
        addLog(`${currentActor.id} moves to (${x}, ${y}).`);

        const newPoints = turnPoints - 1;
        setTurnPoints(newPoints);
        setInteractionState({ mode: "MENU", selectedSkill: null });

        setTimeout(() => {
            if (newPoints <= 0) {
                startPassivePhase("ENEMY_TURN");
            } else {
                setCurrentActorIndex(prev => (prev + 1) % activePlayers.length);
            }
        }, 300);
    }
  };

  const handleWait = () => {
    if (turnPoints < 1 || phase !== "PLAYER_TURN") return;

    const activePlayers = units.filter(
      (u) => u.type === "PLAYER" && u.x !== null && !u.isDead
    );
    const currentActor = activePlayers[currentActorIndex % activePlayers.length];

    addLog(`${currentActor.id} waits.`);

    const newPoints = turnPoints - 1;
    setTurnPoints(newPoints);

    setTimeout(() => {
      if (newPoints <= 0) {
        startPassivePhase("ENEMY_TURN");
      } else {
        setCurrentActorIndex(prev => (prev + 1) % activePlayers.length);
      }
    }, 200);
  };

  // --- ENEMY AI ---
  const processEnemyTurn = async (startingPoints: number) => {
    let currentPoints = startingPoints;
    let enemyIndex = 0;

    // Simple Recursive function to process turns with delays
    const performNextEnemyAction = () => {
      // Check if turn over
      if (currentPoints <= 0) {
        startPassivePhase("PLAYER_TURN"); // Back to Player
        return;
      }

      // Check valid enemies remaining
      // Use Ref to get latest state inside async loop
      const currentUnits = unitsRef.current;

      const livingEnemies = currentUnits.filter(
        (u) => u.type === "ENEMY" && !u.isDead
      );
      if (livingEnemies.length === 0) return; // Should be handled by win condition, but safety check

      // Select Attacker
      const attacker = livingEnemies[enemyIndex % livingEnemies.length];

      // Select Random Target (Alive Player)
      const alivePlayers = currentUnits.filter(
        (u) => u.type === "PLAYER" && u.x !== null && !u.isDead
      );
      if (alivePlayers.length === 0) return; // Game Over handled elsewhere

      const target =
        alivePlayers[Math.floor(Math.random() * alivePlayers.length)];

      // Select Random Skill
      const skills: Element[] = ["PHYSICAL", attacker.element]; // Can attack with Physical or their Element
      const skill = skills[Math.floor(Math.random() * skills.length)];

      // EXECUTE
      // We use a timeout to simulate "Thinking" time before the attack starts
      setTimeout(() => {
        currentPoints = executeAttack(
          attacker.id,
          target.id,
          skill,
          currentPoints,
          false
        );
        setTurnPoints(currentPoints);

        // Move to next enemy for next action
        enemyIndex++;

        // Loop again after animation finishes
        setTimeout(performNextEnemyAction, 1200);
      }, 1000);
    };

    // Kick off the loop
    performNextEnemyAction();
  };

  // Getters
  // We use the state 'units' for rendering, not the ref
  const activePlayers = units.filter(
    (u) => u.type === "PLAYER" && u.x !== null && !u.isDead
  );
  const currentActor = activePlayers[currentActorIndex % activePlayers.length];
  const enemies = units.filter((u) => u.type === "ENEMY" && !u.isDead);

  // Watch for actor change to reset interaction state
  useEffect(() => {
    if (currentActor) {
        setInteractionState({ mode: "MENU", selectedSkill: null });
    }
  }, [currentActor?.id]);


  return {
    phase,
    units,
    turnPoints,
    currentActor,
    enemies,
    attackingUnitId,
    hitTargetId,
    logs,
    interactionState, // <--- Export
    moveUnit,
    initializeGame,
    startBattle,
    handleGuard,
    handleWait,
    handleMoveInitiate, // <--- Export
    handleTileClick, // <--- Export
    openSkillsMenu, // <--- Export
    enterTargetingMode, // <--- Export
    cancelInteraction, // <--- Export
    handleUnitClick, // <--- Export
  };
};
