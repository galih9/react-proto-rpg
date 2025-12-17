# Developer Architecture Guide

This document outlines the technical architecture of the project for developers interested in the codebase.

## 1. Project Structure

The project is a standard **React + TypeScript + Vite** application.

```
src/
├── app/
│   ├── components/      # UI Components (TurnPointBar, Unit, Board)
│   ├── data/            # Static Data (Units, Levels, Items)
│   ├── hooks/           # Core Logic (useGameLogic)
│   ├── utils/           # Helper functions (Targeting, Math)
│   ├── constants.ts     # Global Config (Grid size, Initial State)
│   └── types.ts         # TypeScript Interfaces
```

## 2. Core Logic: `useGameLogic.ts`

The entire game state is managed by a single custom hook: `src/app/hooks/useGameLogic.ts`.
This "God Hook" pattern centralizes the game loop to ensure synchronous state updates and prevent race conditions.

### Key Responsibilities:
*   **State Management:** `units` (Array of ActiveUnit), `turnPoints`, `phase`.
*   **Game Loop:** Handles the transition between `PLAYER_TURN` -> `PASSIVE` -> `ENEMY_TURN`.
*   **Action Execution:** The `executeAction` function handles all combat math (Damage, Hit/Miss, Status).
*   **AI:** `processEnemyTurn` contains the decision tree for enemy behavior.

### Ref Pattern
Due to the heavy use of `setTimeout` for animations (delays between attacks, damage text, etc.), the hook uses `useRef` to access the latest state inside closures.
```typescript
const unitsRef = useRef<ActiveUnit[]>([]);
// Synced in useEffect
useEffect(() => { unitsRef.current = units; }, [units]);
```
*Developer Note:* Always use `unitsRef.current` inside `setTimeout` or async functions to avoid stale state bugs.

## 3. The Turn System Implementation

Turn points are managed via a simple integer state `turnPoints`.
However, to support the "Gravity" UI, updates are often followed by brief delays to allow animations to play out before the phase advances.

## 4. Drag and Drop

The project uses `react-dnd` for the Setup Phase (placing units).
*   **DraggableUnit.tsx:** The source component.
*   **BoardTile.tsx:** The drop target.

## 5. Adding Content

*   **New Units:** Add entries to `src/app/data/units.ts`.
*   **New Skills:** Add skill definitions in `units.ts` (inside the unit object) or create a shared skill registry.
*   **New Levels:** Update `src/app/data/levels.ts`.

## 6. Type Definitions

All shared types are in `src/app/types.ts`.
*   `ActiveUnit`: The runtime state of a unit (HP, SP, Position).
*   `IUnit`: The static database definition of a unit.
*   `ISkillType`: Skill data structure.
