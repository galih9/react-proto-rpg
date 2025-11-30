import { useState, useEffect, useRef } from "react";
import type { Phase, Unit, Element, LogEntry, InteractionState, StatusEffect } from "../types";
import { INITIAL_UNITS } from "../constants";

export const useGameLogic = () => {
  const [phase, setPhase] = useState<Phase>("START");
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [turnPoints, setTurnPoints] = useState(0);

  // Ref to always access latest units in async operations
  const unitsRef = useRef<Unit[]>(INITIAL_UNITS);
  // Ref for turn points to avoid stale closures in timeouts
  const turnPointsRef = useRef(0);

  // Sync Refs
  useEffect(() => {
    unitsRef.current = units;
  }, [units]);

  useEffect(() => {
    turnPointsRef.current = turnPoints;
  }, [turnPoints]);


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

  const processTicksAndAdvance = (callback: () => void) => {
     const currentUnits = unitsRef.current;
     const logsToAdd: string[] = [];
     const eventsToRemove: { unitId: string; eventId: string }[] = [];

     const nextUnits = currentUnits.map(unit => {
         if (unit.isDead) return unit;

         let newHp = unit.hp;
         const newStatusEffects: StatusEffect[] = [];
         const newFloatingEvents = [...unit.floatingTextEvents];

         unit.statusEffects.forEach(effect => {
             if (effect.type === 'POISON') {
                 const damage = Math.floor(unit.maxHp * 0.05);
                 newHp = Math.max(0, newHp - damage);
                 logsToAdd.push(`${unit.id} takes ${damage} poison damage.`);

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

     callback();
  };


  const startBattle = () => {
    const activePlayers = units.filter(
      (u) => u.type === "PLAYER" && u.x !== null
    );
    if (activePlayers.length === 0) {
      alert("Place at least one character!");
      return;
    }
    setPhase("PLAYER_TURN");
  };

  useEffect(() => {
    if (phase === "PLAYER_TURN") {
      const activePlayers = units.filter(
        (u) => u.type === "PLAYER" && u.x !== null && !u.isDead
      );
      if (activePlayers.length === 0) {
        addLog("GAME OVER - YOU LOST");
        setPhase("DEFEAT");
        return;
      }

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

      processEnemyTurn(points);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const startPassivePhase = (nextPhase: "PLAYER_TURN" | "ENEMY_TURN") => {
    processTicksAndAdvance(() => {
        setPhase("PASSIVE");
        const healingType = nextPhase === "ENEMY_TURN" ? "PLAYER" : "ENEMY";
        addLog(`--- Passive Phase (${healingType} Heal) ---`);

        setTimeout(() => {
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

          setPhase(nextPhase);
        }, 1500);
    });
  };

  const executeAttack = (
    attackerId: string,
    targetId: string,
    skillElement: Element
  ): boolean => {
    // Returns true if weakness was hit, false otherwise.
    // Does NOT return new points anymore.

    const currentUnits = unitsRef.current;
    const attacker = currentUnits.find((u) => u.id === attackerId);
    const target = currentUnits.find((u) => u.id === targetId);

    if (!attacker || !target) return false;

    setAttackingUnitId(attacker.id);

    const isWeakness = target.weakness === skillElement;

    // Resolve Damage
    setTimeout(() => {
      let damage = 0;
      let statusEffectToAdd: StatusEffect | null = null;

      if (skillElement === 'BLACK_MAGIC') {
          damage = 30;
          statusEffectToAdd = {
              id: `poison-${Date.now()}`,
              type: 'POISON',
              duration: 3,
              sourceId: attacker.id
          };
      } else {
          damage = isWeakness ? 20 : 10;
          if (target.isGuarding && skillElement === 'PHYSICAL') {
            damage = Math.floor(damage / 2);
            addLog(`${target.id} is guarding! Damage reduced.`);
          } else if (target.isGuarding) {
             damage = Math.floor(damage / 2);
             addLog(`${target.id} is guarding! Damage reduced.`);
          }
      }

      let eventIdToRemove: string | null = null;

      setUnits((prev) =>
        prev.map((u) => {
          if (u.id === target.id) {
            const newHp = Math.max(0, u.hp - damage);
            const newStatusEffects = statusEffectToAdd
                ? [...u.statusEffects, statusEffectToAdd]
                : u.statusEffects;

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
          const id = eventIdToRemove;
           setTimeout(() => {
               removeFloatingEvent(target.id, id);
           }, 1000);
      }

      setHitTargetId(target.id);
      setTimeout(() => setHitTargetId(null), 500);

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

    return isWeakness;
  };

  const openSkillsMenu = () => {
    setInteractionState({ mode: "SKILLS", selectedSkill: null });
  };

  const enterTargetingMode = (skill: Element) => {
    setInteractionState({ mode: "TARGETING", selectedSkill: skill });
  };

  const cancelInteraction = () => {
    setInteractionState({ mode: "MENU", selectedSkill: null });
  };

  const handleUnitClick = (unitId: string) => {
    if (interactionState.mode !== "TARGETING" || !interactionState.selectedSkill) return;

    if (turnPoints < 1) return;

    const activePlayers = units.filter(
      (u) => u.type === "PLAYER" && u.x !== null && !u.isDead
    );
    const attacker = activePlayers[currentActorIndex % activePlayers.length];

    const target = units.find(u => u.id === unitId);
    if(!attacker || !target || target.type !== 'ENEMY') return;

    // 1. DEDUCT COST IMMEDIATELY (2 points base)
    // This triggers the "Loss" animation (4 -> 2)
    const cost = 2;
    // We update state based on previous to be safe, but we know what we want
    // However, if we are at 1 point, we go to -1?
    // "sometimes the basic attack is consuming 2 turnpoint sometimes... 1"
    // If we have 1 point and hit weakness, technically cost is 1.
    // If we deduct 2 from 1, we get -1.
    // That's fine visually if we add 1 back later (to 0).
    // Or we clamp?
    // If we clamp to 0, then add 1, we get 1. Correct.
    // But if we had 4, went to 2, add 1 -> 3. Correct.
    setTurnPoints(prev => prev - cost);

    // 2. Execute Attack (Returns isWeakness)
    const isWeakness = executeAttack(
      attacker.id,
      target.id,
      interactionState.selectedSkill
    );

    setInteractionState({ mode: "EXECUTING", selectedSkill: null });

    // 3. Handle Turn Cycle & Bonus with Delay
    setTimeout(() => {
        // If Weakness, add bonus point
        if (isWeakness) {
            setTurnPoints(prev => prev + 1);
            addLog("Weakness Hit! +1 Turn Point");
        }

        // Wait another moment for the Gain animation (if any) to start/play
        // Gain animation in TurnPointBar waits 600ms or so.
        // We need to check end-of-turn AFTER the points have settled.

        setTimeout(() => {
             // Calculate final points from Ref (safest)
             const finalPoints = turnPointsRef.current;

             processTicksAndAdvance(() => {
                setInteractionState({ mode: "MENU", selectedSkill: null });
                if (finalPoints <= 0) {
                    startPassivePhase("ENEMY_TURN");
                } else {
                    setCurrentActorIndex((prev) => (prev + 1) % activePlayers.length);
                }
             });
        }, isWeakness ? 1000 : 200); // Wait longer if we triggered a gain animation

    }, 800); // Wait 800ms after deduction to apply bonus (allows consumption animation to finish)
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
    setInteractionState({ mode: "EXECUTING", selectedSkill: null });

    setTimeout(() => {
      processTicksAndAdvance(() => {
          setInteractionState({ mode: "MENU", selectedSkill: null });
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

    const dx = Math.abs(x - currentActor.x);
    const dy = Math.abs(y - currentActor.y);
    const isAdjacent = (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);

    const isOccupied = units.some(u => u.x === x && u.y === y && !u.isDead);

    if (isAdjacent && !isOccupied) {
        moveUnit(currentActor.id, x, y);
        addLog(`${currentActor.id} moves to (${x}, ${y}).`);

        const newPoints = turnPoints - 1;
        setTurnPoints(newPoints);
        setInteractionState({ mode: "EXECUTING", selectedSkill: null });

        setTimeout(() => {
           processTicksAndAdvance(() => {
                setInteractionState({ mode: "MENU", selectedSkill: null });
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
    setInteractionState({ mode: "EXECUTING", selectedSkill: null });

    setTimeout(() => {
      processTicksAndAdvance(() => {
          setInteractionState({ mode: "MENU", selectedSkill: null });
          if (newPoints <= 0) {
            startPassivePhase("ENEMY_TURN");
          } else {
            setCurrentActorIndex(prev => (prev + 1) % activePlayers.length);
          }
      });
    }, 200);
  };

  const processEnemyTurn = async (startingPoints: number) => {
    let currentPoints = startingPoints;
    let enemyIndex = 0;

    const performNextEnemyAction = () => {
      if (currentPoints <= 0) {
        startPassivePhase("PLAYER_TURN");
        return;
      }

      const currentUnits = unitsRef.current;
      const livingEnemies = currentUnits.filter(
        (u) => u.type === "ENEMY" && !u.isDead
      );
      if (livingEnemies.length === 0) return;

      const attacker = livingEnemies[enemyIndex % livingEnemies.length];
      const alivePlayers = currentUnits.filter(
        (u) => u.type === "PLAYER" && u.x !== null && !u.isDead
      );
      if (alivePlayers.length === 0) return;

      const target =
        alivePlayers[Math.floor(Math.random() * alivePlayers.length)];

      const availableSkills = attacker.skills || ['PHYSICAL', attacker.element];
      const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];

      setTimeout(() => {
        // AI Logic is simpler: Just calculate and set.
        // We can mimic the player flow if desired, but AI visuals are less critical?
        // Let's keep AI robust but maybe less delayed for now unless asked.
        // But `executeAttack` signature changed! It returns boolean now.

        // 1. Calculate Cost
        let cost = 2;
        // Check Weakness
        const isWeakness = target.weakness === skill;
        if (isWeakness) cost = 1;

        currentPoints = currentPoints - cost;
        setTurnPoints(currentPoints);

        executeAttack(
          attacker.id,
          target.id,
          skill
        );

        enemyIndex++;

        setTimeout(() => {
            processTicksAndAdvance(() => {
                 performNextEnemyAction();
            });
        }, 1200);
      }, 1000);
    };

    performNextEnemyAction();
  };

  const activePlayers = units.filter(
    (u) => u.type === "PLAYER" && u.x !== null && !u.isDead
  );
  const currentActor = activePlayers[currentActorIndex % activePlayers.length];
  const enemies = units.filter((u) => u.type === "ENEMY" && !u.isDead);

  useEffect(() => {
    if (currentActor) {
        setInteractionState({ mode: "MENU", selectedSkill: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
