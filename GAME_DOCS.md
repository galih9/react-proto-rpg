# Game Documentation

Welcome to the documentation for the Turn-Based RPG Project.
These documents cover everything from how to play the game to how the code is structured.

## Table of Contents

### 1. [Gameplay Mechanics](docs/GAMEPLAY.md)
*   **For Players:** Learn about Stats (STR, INT, AGI), Elements, Status Effects, and how to win battles.
*   **Key Concept:** Understand how the "Passive Phase" and Regeneration works.

### 2. [The Turn Point System](docs/TURN_SYSTEM.md)
*   **Deep Dive:** A dedicated guide to the unique "Turn Point" resource mechanic.
*   **Mechanics:** Explains point generation, action costs, and the "Weakness Refund" system.
*   **Visuals:** Explains the gravity-based UI bar.

### 3. [Developer Architecture](docs/ARCHITECTURE.md)
*   **For Coders:** An overview of the React + TypeScript structure.
*   **Core Logic:** How `useGameLogic.ts` manages the game state.
*   **Extending:** How to add new units, skills, or levels.

---

## Quick Start

### For Players
1.  **Setup:** Drag your units to the blue tiles.
2.  **Fight:** Use your **Turn Points** wisely. Attacks cost 2, Moves cost 1.
3.  **Win:** Defeat all enemies to progress to the Shop (Breaking Room).

### For Developers
*   **Tech Stack:** React, TypeScript, Vite, TailwindCSS.
*   **Main Entry:** `src/app/index.tsx`
*   **Game Loop:** `src/app/hooks/useGameLogic.ts`
