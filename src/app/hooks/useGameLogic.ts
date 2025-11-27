import { useState } from "react";
import type { Phase, Unit, Element, LogEntry } from "../types";
import { INITIAL_UNITS } from "../constants";

export const useGameLogic = () => {
  const [phase, setPhase] = useState<Phase>("START");
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [turnPoints, setTurnPoints] = useState(0);

  // Target Selection & Animation States
  const [currentActorIndex, setCurrentActorIndex] = useState(0);
  const [attackingUnitId, setAttackingUnitId] = useState<string | null>(null);
  const [hitTargetId, setHitTargetId] = useState<string | null>(null); // <--- For bounce animation

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
    startPlayerTurn();
  };

  // --- PHASE MANAGEMENT ---
  const startPlayerTurn = () => {
    const activePlayers = units.filter(
      (u) => u.type === "PLAYER" && u.x !== null && !u.isDead
    );
    if (activePlayers.length === 0) {
      addLog("GAME OVER - YOU LOST");
      setPhase("DEFEAT");
      return;
    }

    // Reset guarding status for all player units at the start of their turn
    setUnits(prev => prev.map(u => u.type === 'PLAYER' ? { ...u, isGuarding: false } : u));

    setPhase("PLAYER_TURN");
    const points = activePlayers.length * 2;
    setTurnPoints(points);
    setCurrentActorIndex(0);
    addLog(`>>> PLAYER TURN (Points: ${points})`);
  };

  const startEnemyTurn = () => {
    const activeEnemies = units.filter((u) => u.type === "ENEMY" && !u.isDead);
    if (activeEnemies.length === 0) {
      addLog("VICTORY - ALL ENEMIES DEFEATED");
      setPhase("VICTORY");
      return;
    }
    setPhase("ENEMY_TURN");
    const points = activeEnemies.length * 2;
    setTurnPoints(points);
    addLog(`>>> ENEMY TURN (Points: ${points})`);

    // Trigger AI Logic
    processEnemyTurn(points, activeEnemies);
  };

  const startPassivePhase = (nextPhase: "PLAYER" | "ENEMY") => {
    setPhase("PASSIVE");

    // Determine who gets healed based on who just finished their turn
    // If next is ENEMY, that means Player just finished -> Heal Player
    const healingType = nextPhase === "ENEMY" ? "PLAYER" : "ENEMY";
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
      if (nextPhase === "ENEMY") {
        startEnemyTurn();
      } else {
        startPlayerTurn();
      }
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
    const attacker = units.find((u) => u.id === attackerId);
    const target = units.find((u) => u.id === targetId);

    if (!attacker || !target) return currentPoints;

    // 1. Animation: Attacker Moves
    setAttackingUnitId(attacker.id);

    // 2. Calculation
    let cost = 2;
    if (skillElement === 'NORMAL') {
      cost = 1;
    } else {
      const isWeakness = target.weakness === skillElement;
      if (isWeakness) cost = 1;
    }

    // 3. Resolve Damage (Delayed for visual sync)
    setTimeout(() => {
      let damage = skillElement === 'NORMAL' ? 10 : (target.weakness === skillElement ? 20 : 10);
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

  // --- PLAYER INPUT ---
  const handlePlayerAttack = (targetId: string, skillElement: Element) => {
    const target = units.find((u) => u.id === targetId);
    if (!target) return;

    let cost = 2;
    if (skillElement === "NORMAL") {
      cost = 1;
    } else {
      const isWeakness = target.weakness === skillElement;
      if (isWeakness) cost = 1;
    }

    if (turnPoints < cost || phase !== "PLAYER_TURN") return;

    const activePlayers = units.filter(
      (u) => u.type === "PLAYER" && u.x !== null && !u.isDead
    );
    const attacker = activePlayers[currentActorIndex % activePlayers.length];

    if (!attacker) return;

    executeAttack(
      attacker.id,
      targetId,
      skillElement,
      turnPoints,
      true
    );

    advanceTurn(cost);
  };

  const advanceTurn = (pointsSpent: number) => {
    const newPoints = turnPoints - pointsSpent;
    setTurnPoints(newPoints);

    setTimeout(() => {
      if (newPoints <= 0) {
        startPassivePhase("ENEMY");
      } else {
        const activePlayers = units.filter(
          (u) => u.type === "PLAYER" && u.x !== null && !u.isDead
        );
        setCurrentActorIndex((prev) => (prev + 1) % activePlayers.length);
      }
    }, 200);
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

    advanceTurn(1);
  };

  const handleWait = () => {
    if (turnPoints < 1 || phase !== "PLAYER_TURN") return;

    const activePlayers = units.filter(
      (u) => u.type === "PLAYER" && u.x !== null && !u.isDead
    );
    const currentActor = activePlayers[currentActorIndex % activePlayers.length];

    addLog(`${currentActor.id} waits.`);

    advanceTurn(1);
  };

  // --- ENEMY AI ---
  const processEnemyTurn = async (startingPoints: number, _enemies: Unit[]) => {
    let currentPoints = startingPoints;
    let enemyIndex = 0;

    // Simple Recursive function to process turns with delays
    const performNextEnemyAction = () => {
      // Check if turn over
      if (currentPoints <= 0) {
        startPassivePhase("PLAYER"); // Back to Player
        return;
      }

      // Check valid enemies remaining
      const livingEnemies = units.filter(
        (u) => u.type === "ENEMY" && !u.isDead
      );
      if (livingEnemies.length === 0) return; // Should be handled by win condition, but safety check

      // Select Attacker
      const attacker = livingEnemies[enemyIndex % livingEnemies.length];

      // Select Random Target (Alive Player)
      const alivePlayers = units.filter(
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
  const activePlayers = units.filter(
    (u) => u.type === "PLAYER" && u.x !== null && !u.isDead
  );
  const currentActor = activePlayers[currentActorIndex % activePlayers.length];
  const enemies = units.filter((u) => u.type === "ENEMY" && !u.isDead);

  return {
    phase,
    units,
    turnPoints,
    currentActor,
    enemies,
    attackingUnitId,
    hitTargetId,
    logs,
    moveUnit,
    initializeGame,
    startBattle,
    handleAttack: handlePlayerAttack,
    handleGuard,
    handleWait,
  };
};
