import { useState, useEffect, useRef } from "react";
import type { Phase, Unit, Element, LogEntry, InteractionState, StatusEffect } from "../types";
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

  // Helper to remove floating event
  const removeFloatingEvent = (unitId: string, eventId: string) => {
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id === unitId) {
          return {
            ...u,
            floatingTextEvents: u.floatingTextEvents.filter((e) => e.id !== eventId),
          };
        }
        return u;
      })
    );
  };

  // --- STATUS EFFECT LOGIC ---
  // Better implementation of tick that supports logging
  const processTicksAndAdvance = (callback: () => void) => {
     // 1. Get current units from Ref (latest)
     const currentUnits = unitsRef.current;
     let logsToAdd: string[] = [];
     const eventsToRemove: { unitId: string; eventId: string }[] = [];

     const nextUnits = currentUnits.map(unit => {
         if (unit.isDead) return unit;

         let newHp = unit.hp;
         let newStatusEffects: StatusEffect[] = [];
         let newFloatingEvents = [...unit.floatingTextEvents];

         unit.statusEffects.forEach(effect => {
             if (effect.type === 'POISON') {
                 const damage = Math.floor(unit.maxHp * 0.05);
                 newHp = Math.max(0, newHp - damage);
                 logsToAdd.push(`${unit.id} takes ${damage} poison damage.`);

                 // Add Floating Text
                 const eventId = `poison-${Date.now()}-${Math.random()}`;
                 newFloatingEvents.push({
                     id: eventId,
                     value: -damage,
                     type: 'DAMAGE'
                 });
                 eventsToRemove.push({ unitId: unit.id, eventId });
             }

             const newDuration = effect.duration - 1;
             if (newDuration > 0) {
                 newStatusEffects.push({ ...effect, duration: newDuration });
             } else {
                 logsToAdd.push(`Poison on ${unit.id} expired.`);
             }
         });

         return {
             ...unit,
             hp: newHp,
             isDead: newHp === 0,
             statusEffects: newStatusEffects,
             floatingTextEvents: newFloatingEvents
         };
     });

     // 2. Update State
     setUnits(nextUnits);
     logsToAdd.forEach(msg => addLog(msg));

     if (eventsToRemove.length > 0) {
         setTimeout(() => {
             setUnits(prev => prev.map(u => {
                 const eventsForUnit = eventsToRemove.filter(e => e.unitId === u.id).map(e => e.eventId);
                 if (eventsForUnit.length > 0) {
                     return {
                         ...u,
                         floatingTextEvents: u.floatingTextEvents.filter(e => !eventsForUnit.includes(e.id))
                     };
                 }
                 return u;
             }));
         }, 1000);
     }

     // 3. Callback (Proceed to next actor/phase)
     callback();
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
    // Trigger Ticks before entering Passive logic proper
    processTicksAndAdvance(() => {
        setPhase("PASSIVE");

        // Determine who gets healed based on who just finished their turn
        // If next is ENEMY, that means Player just finished -> Heal Player
        const healingType = nextPhase === "ENEMY_TURN" ? "PLAYER" : "ENEMY";
        addLog(`--- Passive Phase (${healingType} Heal) ---`);

        setTimeout(() => {
          // Heal Logic (Active healing)
          const eventsToRemove: { unitId: string; eventId: string }[] = [];

          setUnits((prev) =>
            prev.map((u) => {
              if (u.type === healingType && !u.isDead && u.hp < u.maxHp) {
                const healAmount = 5;
                const newHp = Math.min(u.maxHp, u.hp + healAmount);
                const actualHeal = newHp - u.hp;

                if (actualHeal > 0) {
                     const eventId = `heal-${Date.now()}-${Math.random()}`;
                     eventsToRemove.push({ unitId: u.id, eventId });
                     return {
                         ...u,
                         hp: newHp,
                         floatingTextEvents: [...u.floatingTextEvents, { id: eventId, value: actualHeal, type: 'HEAL' }]
                     };
                }
                return { ...u, hp: newHp };
              }
              return u;
            })
          );

          if (eventsToRemove.length > 0) {
               setTimeout(() => {
                   setUnits(prev => prev.map(u => {
                       const eventsForUnit = eventsToRemove.filter(e => e.unitId === u.id).map(e => e.eventId);
                       if (eventsForUnit.length > 0) {
                           return {
                               ...u,
                               floatingTextEvents: u.floatingTextEvents.filter(e => !eventsForUnit.includes(e.id))
                           };
                       }
                       return u;
                   }));
               }, 1000);
          }

          // Trigger Ticks AGAIN?
          // Requirement: "triggered every turn taken by anyone and also when the passive phase"
          // We ticked entering Passive. That counts for the "Passive Phase" tick.
          // Then we go to next phase.

          // Transition to next active phase
          // We set phase here, allowing useEffect to pick it up with updated units state
          setPhase(nextPhase);
        }, 1500);
    });
  };

  // --- CORE ATTACK LOGIC (Generic) ---
  const executeAttack = (
    attackerId: string,
    targetId: string,
    skillElement: Element,
    currentPoints: number,
    _isPlayer: boolean
  ) => {
    const currentUnits = unitsRef.current;

    const attacker = currentUnits.find((u) => u.id === attackerId);
    const target = currentUnits.find((u) => u.id === targetId);

    if (!attacker || !target) return currentPoints;

    // 1. Animation: Attacker Moves
    setAttackingUnitId(attacker.id);

    // 2. Calculation
    let cost = 2;
    // Basic Rule: Attack costs 2.
    // If Weakness -> Cost 1.
    // NOTE: Even for BLACK_MAGIC, cost is 2.
    // If we want BLACK_MAGIC to reduce cost on weakness (does it have a weakness?), we apply same rule.
    // For now, we assume standard Elemental Weakness logic applies to all skills.

    // Check Weakness
    // Physical now behaves like Magic: 2 pts base, 1 pt if weakness.
    const isWeakness = target.weakness === skillElement;
    if (isWeakness) cost = 1;

    // 3. Resolve Damage (Delayed for visual sync)
    setTimeout(() => {
      let damage = 0;
      let statusEffectToAdd: StatusEffect | null = null;

      if (skillElement === 'BLACK_MAGIC') {
          damage = 30; // Fixed initial damage
          statusEffectToAdd = {
              id: `poison-${Date.now()}`,
              type: 'POISON',
              duration: 3,
              sourceId: attacker.id
          };
      } else {
          // Standard Calculation
          damage = isWeakness ? 20 : 10;
          if (target.isGuarding && skillElement === 'PHYSICAL') {
            // Guard usually blocks physical? Or all? Assuming all damage reduction for simplicity
            damage = Math.floor(damage / 2);
            addLog(`${target.id} is guarding! Damage reduced.`);
          } else if (target.isGuarding) {
             damage = Math.floor(damage / 2);
             addLog(`${target.id} is guarding! Damage reduced.`);
          }
      }

      // Update HP & Status
      let eventIdToRemove: string | null = null;

      setUnits((prev) =>
        prev.map((u) => {
          if (u.id === target.id) {
            const newHp = Math.max(0, u.hp - damage);
            const newStatusEffects = statusEffectToAdd
                ? [...u.statusEffects, statusEffectToAdd]
                : u.statusEffects;

            // Add Floating Text
            const eventId = `dmg-${Date.now()}-${Math.random()}`;
            eventIdToRemove = eventId;

            return {
                ...u,
                hp: newHp,
                isDead: newHp === 0,
                statusEffects: newStatusEffects,
                floatingTextEvents: [...u.floatingTextEvents, { id: eventId, value: -damage, type: 'DAMAGE' }]
            };
          }
          return u;
        })
      );

      if (eventIdToRemove) {
          const id = eventIdToRemove; // capture
           setTimeout(() => {
               removeFloatingEvent(target.id, id);
           }, 1000);
      }

      // Trigger Target Bounce Animation
      setHitTargetId(target.id);
      setTimeout(() => setHitTargetId(null), 500); // Reset bounce after 0.5s

      addLog(
        `${attacker.id} hits ${target.id} (${skillElement}). ${
          isWeakness ? "WEAKNESS!" : ""
        } -${damage} HP`
      );
      if (statusEffectToAdd) {
          addLog(`${target.id} is poisoned!`);
      }

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
    // Now all skills cost 2 base. Weakness logic is applied inside executeAttack return value.
    // However, we need to know if we have enough points to *start*.
    // Since we don't know weakness yet (it's hidden logic?), safe bet is to require 2 points?
    // User said: "sometimes the basic attack is consuming 2 turnpoint sometimes it consuming the right turnpoint (1 turnpoint)"
    // If current points is 1, and target is weak, we should allow it.
    // But we can't pre-calculate without peeking.
    // For now, let's allow attempt if points >= 1, but if it costs 2 and we have 1, result is -1?
    // The previous logic allowed execution.
    // Let's enforce >= 1 to click. Cost calculation handles the rest.
    if (turnPoints < 1) return;

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
      // Tick logic triggers when we move to next ACTOR or PHASE
      processTicksAndAdvance(() => {
          if (newPoints <= 0) {
            startPassivePhase("ENEMY_TURN");
          } else {
            setCurrentActorIndex((prev) => (prev + 1) % activePlayers.length);
            // Also reset UI for next actor just in case
            setInteractionState({ mode: "MENU", selectedSkill: null });
          }
      });
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
      processTicksAndAdvance(() => {
          if (newPoints <= 0) {
            startPassivePhase("ENEMY_TURN");
          } else {
            setCurrentActorIndex(prev => (prev + 1) % activePlayers.length);
          }
      });
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
           processTicksAndAdvance(() => {
                if (newPoints <= 0) {
                    startPassivePhase("ENEMY_TURN");
                } else {
                    setCurrentActorIndex(prev => (prev + 1) % activePlayers.length);
                }
           });
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
      processTicksAndAdvance(() => {
          if (newPoints <= 0) {
            startPassivePhase("ENEMY_TURN");
          } else {
            setCurrentActorIndex(prev => (prev + 1) % activePlayers.length);
          }
      });
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
        // Tick handled inside startPassivePhase transition?
        // Wait, startPassivePhase does a tick.
        // But we need a tick *between* enemy actions too?
        // "triggered every turn taken by anyone"
        startPassivePhase("PLAYER_TURN");
        return;
      }

      // Check valid enemies remaining
      const currentUnits = unitsRef.current;

      const livingEnemies = currentUnits.filter(
        (u) => u.type === "ENEMY" && !u.isDead
      );
      if (livingEnemies.length === 0) return;

      // Select Attacker
      const attacker = livingEnemies[enemyIndex % livingEnemies.length];

      // Select Random Target (Alive Player)
      const alivePlayers = currentUnits.filter(
        (u) => u.type === "PLAYER" && u.x !== null && !u.isDead
      );
      if (alivePlayers.length === 0) return;

      const target =
        alivePlayers[Math.floor(Math.random() * alivePlayers.length)];

      // Select Random Skill from Unit Skills
      // Fallback if skills undefined for some reason (though we added them)
      const availableSkills = attacker.skills || ['PHYSICAL', attacker.element];
      const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];

      // EXECUTE
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

        // Process Tick after action
        setTimeout(() => {
            processTicksAndAdvance(() => {
                 // Loop again
                 performNextEnemyAction();
            });
        }, 1200); // Wait for attack animation to finish fully
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
    interactionState,
    moveUnit,
    initializeGame,
    startBattle,
    handleGuard,
    handleWait,
    handleMoveInitiate,
    handleTileClick,
    openSkillsMenu,
    enterTargetingMode,
    cancelInteraction,
    handleUnitClick,
  };
};
