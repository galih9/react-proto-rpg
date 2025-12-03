import { useState, useEffect, useRef } from "react";
import type { Phase, ActiveUnit, LogEntry, InteractionState, StatusEffect, ISkillType } from "../types";
import { INITIAL_UNITS } from "../constants";
import { getValidTargets } from "../utils/targeting";

export const useGameLogic = () => {
  const [phase, setPhase] = useState<Phase>("START");
  const [units, setUnits] = useState<ActiveUnit[]>(INITIAL_UNITS);
  const [turnPoints, setTurnPoints] = useState(0);

  // Ref to always access latest units in async operations
  const unitsRef = useRef<ActiveUnit[]>(INITIAL_UNITS);
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
  const [activeEnemyId, setActiveEnemyId] = useState<string | null>(null);
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
                 logsToAdd.push(`${unit.displayName} takes ${damage} poison damage.`);

                 const eventId = `poison-${Date.now()}-${Math.random()}`;
                 newFloatingEvents.push({
                     id: eventId,
                     text: `-${damage}`,
                     type: 'DAMAGE'
                 });
                 eventsToRemove.push({ unitId: unit.id, eventId });
             }

             const newDuration = effect.duration - 1;
             if (newDuration > 0) {
                 newStatusEffects.push({ ...effect, duration: newDuration });
             } else {
                 logsToAdd.push(`Poison on ${unit.displayName} expired.`);
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
                         floatingTextEvents: [...u.floatingTextEvents, { id: eventId, text: `+${actualHeal}`, type: 'HEAL' }]
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

  const executeHeal = (targetId: string, skill: ISkillType) => {
      const currentUnits = unitsRef.current;
      const target = currentUnits.find((u) => u.id === targetId);

      if (!target) return;

      const healAmount = skill.baseNumber || 10;

      let eventIdToRemove: string | null = null;

      setUnits((prev) =>
          prev.map((u) => {
              if (u.id === target.id) {
                  const newHp = Math.min(u.maxHp, u.hp + healAmount);
                  const actualHeal = newHp - u.hp;

                  const eventId = `heal-${Date.now()}-${Math.random()}`;
                  eventIdToRemove = eventId;

                  return {
                      ...u,
                      hp: newHp,
                      floatingTextEvents: [...u.floatingTextEvents, { id: eventId, text: `+${actualHeal}`, type: 'HEAL' }]
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

      addLog(`${target.displayName} heals for ${healAmount} HP.`);
  };

  const executeAttack = (
    attackerId: string,
    targetId: string,
    skill: ISkillType
  ): boolean => {
    // Returns true if weakness was hit, false otherwise.
    // Does NOT return new points anymore.

    const currentUnits = unitsRef.current;
    const attacker = currentUnits.find((u) => u.id === attackerId);
    const target = currentUnits.find((u) => u.id === targetId);

    if (!attacker || !target) return false;

    // Only set attacking ID if not MULTIPLE to avoid rapid flickering or state confusion in loop,
    // or we accept it might flicker. For now let's set it.
    // If it's a loop, this might just show the last one or flicker.
    setAttackingUnitId(attacker.id);

    const affinity = target.status[skill.element];
    const isWeakness = affinity === "WEAK";
    const isResist = affinity === "RESIST";
    const isNull = affinity === "NULL" || affinity === "DRAIN" || affinity === "DEFLECT";

    // Dispatch Affinity Text Event (Slightly before damage)
    if (affinity !== "NORMAL") {
        setTimeout(() => {
            let affinityText = "";
            let affinityType: "WEAK" | "RESIST" | "NULL" | "DRAIN" | "DEFLECT" | null = null;

            switch (affinity) {
                case "WEAK": affinityText = "Weakness"; affinityType = "WEAK"; break;
                case "RESIST": affinityText = "Resist"; affinityType = "RESIST"; break;
                case "NULL": affinityText = "Nullify"; affinityType = "NULL"; break;
                case "DRAIN": affinityText = "Drain"; affinityType = "DRAIN"; break;
                case "DEFLECT": affinityText = "Deflect"; affinityType = "DEFLECT"; break;
            }

            if (affinityType) {
                 const affinityEventId = `affinity-${Date.now()}-${Math.random()}`;
                 setUnits(prev => prev.map(u => {
                    if (u.id === target.id) {
                        return {
                            ...u,
                            floatingTextEvents: [...u.floatingTextEvents, { id: affinityEventId, text: affinityText, type: affinityType! }]
                        };
                    }
                    return u;
                 }));

                 setTimeout(() => {
                    removeFloatingEvent(target.id, affinityEventId);
                 }, 1000);
            }
        }, 300);
    }

    // Resolve Damage
    setTimeout(() => {
      let damage = skill.baseNumber || 10;

      // Multipliers
      if (isWeakness) damage = Math.floor(damage * 1.5);
      if (isResist) damage = Math.floor(damage * 0.5);
      if (isNull) damage = 0;

      let statusEffectToAdd: StatusEffect | null = null;

      if (skill.element === 'BLACK_MAGIC') {
           statusEffectToAdd = {
              id: `poison-${Date.now()}-${Math.random()}`,
              type: 'POISON',
              duration: 3,
              sourceId: attacker.id
          };
      }

      // Guard Check
      if (target.isGuarding) {
         damage = Math.floor(damage / 2);
         addLog(`${target.displayName} is guarding! Damage reduced.`);
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
                floatingTextEvents: [...u.floatingTextEvents, { id: eventId, text: `-${damage}`, type: 'DAMAGE' }]
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
        `${attacker.displayName} hits ${target.displayName} (${skill.name}). ${
          isWeakness ? "WEAKNESS!" : ""
        } ${isResist ? "RESIST!" : ""} ${isNull ? "BLOCKED!" : ""} -${damage} HP`
      );
      if (statusEffectToAdd) {
          addLog(`${target.displayName} is poisoned!`);
      }

      setAttackingUnitId(null);
    }, 600);

    return isWeakness;
  };

  const openSkillsMenu = () => {
    setInteractionState({ mode: "SKILLS", selectedSkill: null });
  };

  const enterTargetingMode = (skill: ISkillType) => {
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

    if (!attacker) return;

    // VALIDATE TARGET
    const skill = interactionState.selectedSkill;
    const validTargets = getValidTargets(skill, attacker, units);

    if (!validTargets.includes(unitId)) {
        // Clicked invalid target, do nothing
        return;
    }

    // Determine targets to execute on
    let targetsToHit: string[] = [];
    if (skill.targetType === "MULTIPLE") {
        targetsToHit = validTargets; // Hit all valid targets
    } else {
        targetsToHit = [unitId]; // Hit the specific clicked target
    }

    // Deduct cost
    const cost = skill.pointCost;
    setTurnPoints(prev => prev - cost);

    // Execute Actions
    let anyWeakness = false;

    if (skill.targetType === "SELF") {
        // HEAL / BUFF logic
        executeHeal(unitId, skill);
    } else {
        // ATTACK logic
        targetsToHit.forEach((tid) => {
             const w = executeAttack(attacker.id, tid, skill);
             if (w) anyWeakness = true;
        });
    }

    setInteractionState({ mode: "EXECUTING", selectedSkill: null });

    // Handle Turn Cycle
    setTimeout(() => {
        if (anyWeakness) {
            setTurnPoints(prev => prev + 1);
            addLog("Weakness Hit! +1 Turn Point");
        }

        setTimeout(() => {
             const finalPoints = turnPointsRef.current;
             const currentUnits = unitsRef.current;

             // Victory Check
             const activeEnemies = currentUnits.filter(u => u.type === 'ENEMY' && !u.isDead);
             if (activeEnemies.length === 0) {
                 setPhase("VICTORY");
                 addLog("VICTORY - ALL ENEMIES DEFEATED");
                 return;
             }

             processTicksAndAdvance(() => {
                setInteractionState({ mode: "MENU", selectedSkill: null });
                if (finalPoints <= 0) {
                    startPassivePhase("ENEMY_TURN");
                } else {
                    setCurrentActorIndex((prev) => (prev + 1) % activePlayers.length);
                }
             });
        }, anyWeakness ? 1000 : 200);

    }, 800);
  };

  const handleGuard = () => {
    if (turnPoints < 1 || phase !== "PLAYER_TURN") return;

    const activePlayers = units.filter(
      (u) => u.type === "PLAYER" && u.x !== null && !u.isDead
    );
    const currentActor = activePlayers[currentActorIndex % activePlayers.length];

    if (!currentActor) return;

    setUnits(prev => prev.map(u => u.id === currentActor.id ? { ...u, isGuarding: true } : u));
    addLog(`${currentActor.displayName} is guarding.`);

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

    if (isAdjacent && !isOccupied && x <= 2) {
        moveUnit(currentActor.id, x, y);
        addLog(`${currentActor.displayName} moves to (${x}, ${y}).`);

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

    addLog(`${currentActor.displayName} waits.`);

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
        setActiveEnemyId(null);
        startPassivePhase("PLAYER_TURN");
        return;
      }

      const currentUnits = unitsRef.current;
      const livingEnemies = currentUnits.filter(
        (u) => u.type === "ENEMY" && !u.isDead
      );
      if (livingEnemies.length === 0) {
        setActiveEnemyId(null);
        return;
      }

      const attacker = livingEnemies[enemyIndex % livingEnemies.length];
      const alivePlayers = currentUnits.filter(
        (u) => u.type === "PLAYER" && u.x !== null && !u.isDead
      );
      if (alivePlayers.length === 0) {
          setActiveEnemyId(null);
          return;
      }

      const target =
        alivePlayers[Math.floor(Math.random() * alivePlayers.length)];

      const availableSkills = attacker.skills; // Now ISkillType[]

      // AI Decision Logic
      type EnemyAction =
          | { type: 'ATTACK'; skill: ISkillType; cost: number }
          | { type: 'GUARD'; cost: number }
          | { type: 'WAIT'; cost: number };

      let validActions: EnemyAction[] = [];

      // 1. Evaluate Attacks
      if (availableSkills && availableSkills.length > 0) {
        availableSkills.forEach(skill => {
            const affinity = target.status[skill.element];
            const isWeakness = affinity === "WEAK";
            const cost = isWeakness ? (skill.pointCost > 1 ? skill.pointCost - 1 : 1) : skill.pointCost;

            if (currentPoints >= cost) {
                validActions.push({ type: 'ATTACK', skill, cost });
            }
        });
      }

      // 2. Evaluate Guard/Wait (Cost 1)
      if (currentPoints >= 1) {
          validActions.push({ type: 'GUARD', cost: 1 });
          validActions.push({ type: 'WAIT', cost: 1 });
      }

      // 3. Fallback
      if (validActions.length === 0) {
           validActions.push({ type: 'WAIT', cost: 1 });
      }

      // 4. Choose Randomly
      const chosenAction = validActions[Math.floor(Math.random() * validActions.length)];

      setActiveEnemyId(attacker.id);

      setTimeout(() => {
        // Execute Action
        currentPoints -= chosenAction.cost;
        setTurnPoints(currentPoints);

        if (chosenAction.type === 'ATTACK') {
             executeAttack(attacker.id, target.id, chosenAction.skill);
        } else if (chosenAction.type === 'GUARD') {
             setUnits(prev => prev.map(u => u.id === attacker.id ? { ...u, isGuarding: true } : u));
             addLog(`${attacker.displayName} guards.`);
        } else {
             addLog(`${attacker.displayName} waits.`);
        }

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
    activeEnemyId,
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
