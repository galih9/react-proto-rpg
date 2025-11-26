import { useState } from 'react';
import type { Phase, Unit, Element, LogEntry } from '../types';
import { INITIAL_UNITS } from '../constants';

export const useGameLogic = () => {
  const [phase, setPhase] = useState<Phase>('START');
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [turnPoints, setTurnPoints] = useState(0);
  const [currentActorIndex, setCurrentActorIndex] = useState(0);
  const [attackingUnitId, setAttackingUnitId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [{ id: Date.now(), message: msg }, ...prev]);
  };

  const moveUnit = (id: string, x: number, y: number) => {
    setUnits(prev => prev.map(u => u.id === id ? { ...u, x, y } : u));
  };

  const initializeGame = () => {
    setUnits(INITIAL_UNITS);
    setPhase('SETUP');
    addLog("Setup Phase: Drag blue units onto the left blue tiles.");
  };

  const startBattle = () => {
    const activePlayers = units.filter(u => u.type === 'PLAYER' && u.x !== null);
    if (activePlayers.length === 0) {
      alert("Place at least one character!");
      return;
    }
    setPhase('PLAYER_TURN');
    const initialPoints = activePlayers.length * 2;
    setTurnPoints(initialPoints);
    setCurrentActorIndex(0);
    addLog(`Battle Start! Points: ${initialPoints}`);
  };

  const startPassivePhase = () => {
    setPhase('PASSIVE');
    addLog("--- Passive Phase (Auto Heal) ---");
    
    setTimeout(() => {
      setUnits(prev => prev.map(u => {
        if (u.type === 'PLAYER' && !u.isDead && u.hp < u.maxHp) {
          return { ...u, hp: Math.min(u.maxHp, u.hp + 5) };
        }
        return u;
      }));
      
      const activePlayers = units.filter(u => u.type === 'PLAYER' && u.x !== null && !u.isDead);
      const nextPoints = activePlayers.length * 2;
      setTurnPoints(nextPoints);
      setCurrentActorIndex(0);
      setPhase('PLAYER_TURN');
      addLog(`New Turn! Points: ${nextPoints}`);
    }, 1500);
  };

  const handleAttack = (targetId: string, skillElement: Element) => {
    if (turnPoints <= 0) return;

    const activePlayers = units.filter(u => u.type === 'PLAYER' && u.x !== null && !u.isDead);
    const attacker = activePlayers[currentActorIndex % activePlayers.length];
    const target = units.find(u => u.id === targetId);

    if (!attacker || !target) return;

    setAttackingUnitId(attacker.id);

    let cost = 2;
    let isWeakness = target.weakness === skillElement;
    if (isWeakness) cost = 1;

    setTimeout(() => {
      const damage = isWeakness ? 20 : 10;
      
      setUnits(prev => prev.map(u => {
        if (u.id === target.id) {
          const newHp = Math.max(0, u.hp - damage);
          return { ...u, hp: newHp, isDead: newHp === 0 };
        }
        return u;
      }));

      const newPoints = turnPoints - cost;
      setTurnPoints(newPoints);

      addLog(`${attacker.id} attacks ${target.id}. ${isWeakness ? '(WEAKNESS!)' : ''}`);
      setAttackingUnitId(null);

      if (newPoints <= 0) {
        startPassivePhase();
      } else {
        setCurrentActorIndex(prev => (prev + 1) % activePlayers.length);
      }
    }, 600);
  };

  // Getters for specific groups
  const activePlayers = units.filter(u => u.type === 'PLAYER' && u.x !== null && !u.isDead);
  const currentActor = activePlayers[currentActorIndex % activePlayers.length];
  const enemies = units.filter(u => u.type === 'ENEMY' && !u.isDead);

  return {
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
    handleAttack
  };
};