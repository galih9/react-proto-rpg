# Gameplay Mechanics Guide

This guide covers the essential mechanics for players, including stats, combat formulas, and the flow of battle.

## 1. Game Flow

The game operates in a strict phase loop:

1.  **SETUP:** Drag your units onto the blue tiles to position them.
2.  **PLAYER TURN:** You spend **Turn Points** to move and attack.
3.  **PASSIVE PHASE (1):** Player Sentries (e.g., Turrets) execute their automatic attacks.
4.  **ENEMY TURN:** The AI controls enemy units using its own Turn Points.
5.  **PASSIVE PHASE (2):** Enemy Sentries execute their attacks. Passive Healing occurs.
6.  **REPEAT:** The cycle continues until Victory or Defeat.

---

## 2. Unit Stats

Every unit (Player or Enemy) has three core attributes that define their combat role:

### Strength (STR) - *Damage Reduction*
Strength is not just for hitting hard; it's your armor.
> **Formula:** `Damage Taken = Incoming Damage * (100 / (100 + STR))`
*   *Example:* A unit with **100 STR** takes **50% less damage**.

### Intelligence (INT) - *Passive Regeneration*
Smart units heal themselves over time during the Passive Phase.
> **Formula:** `Heal Amount = MaxHP * (INT / 100)`
*   *Example:* A unit with **1000 HP** and **10 INT** heals **100 HP** every turn.

### Agility (AGI) - *Hit Chance*
Agility determines if an attack connects or misses entirely.
> **Formula:** `Hit Chance = 100 + (Attacker AGI - Target AGI)`
*   *Example:* If you have **10 AGI** and the enemy has **20 AGI**, your hit chance is **90%**.

---

## 3. Combat System

### Elements & Affinity
Attacks have elements (Physical, Fire, Ice, etc.). Units have resistances to these elements:
*   **WEAK:** Take **1.5x Damage**. Refunds **1 Turn Point**.
*   **RESIST:** Take **0.5x Damage**.
*   **NULL:** Take **0 Damage**.
*   **DRAIN/DEFLECT:** Special interactions (Heal from attack / Reflect damage).

### Targeting Types
Different skills behave differently on the grid:
*   **PROJECTILE:** Hits the *first* unit in the row. Blocked by units in front.
*   **THROWABLE:** Lobs over the front line to hit the *back row*.
*   **DEPLOY:** Creates a structure (Wall, Sentry) on an empty tile.

### Status Effects
*   **POISON:** Deals damage every turn (approx 5% MaxHP).
*   **ATTACK UP/DOWN:** Increases/Decreases damage dealt.
*   **DEFENSE DOWN:** Increases damage taken.

---

## 4. Victory Conditions
*   **Victory:** Defeat all enemies.
*   **Defeat:** All player units are defeated (0 HP).
