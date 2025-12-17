# Turn Point System Documentation

The **Turn Point System** is the core resource management mechanic of the game. Unlike traditional RPGs where every unit gets one action per turn, this game uses a shared pool of "Turn Points" (TP) that the entire party consumes.

## 1. How Turn Points Work

### Generation
At the start of the **Player Phase**, Turn Points are calculated based on the number of active units you have on the board:

> **Formula:** `Turn Points = Active Player Units * 2`

*   **Example:** If you have 3 units alive, you get **6 Turn Points**.
*   This encourages keeping units alive; losing a unit significantly reduces your tactical options.

### Consumption (Costs)
Every action consumes Turn Points. The team must decide how to spend this shared budget.

| Action | Cost | Notes |
| :--- | :--- | :--- |
| **Regular Attack** | **2 TP** | Basic physical attack. Free SP cost. |
| **Skills** | **2 TP** | Most skills cost 2 TP + SP. |
| **Guard** | **1 TP** | Reduces incoming damage by 50% until next turn. |
| **Move** | **1 TP** | Move to an adjacent tile (limit 1 tile). |
| **Wait** | **1 TP** | Pass the turn for a specific unit. |
| **Deploy** | **Varies** | Deploying walls or sentries (costs defined by skill). |

### The "Weakness Refund" Mechanic
Exploiting enemy weaknesses is crucial for efficiency.
*   If an attack hits an enemy's **Weakness** (e.g., Fire vs Ice), you receive a **+1 Turn Point Refund**.
*   This effectively reduces the cost of the attack from 2 TP to 1 TP, allowing you to extend your turn and perform more actions.

---

## 2. Visual Implementation (`TurnPointBar.tsx`)

The Turn Point Bar is not just a number; it's a physically simulated container of "energy blocks."

### The "Gravity" Effect
The UI is built to resemble a battery or fuel gauge where blocks are subject to gravity.
*   **Consumption:** When points are spent, blocks don't just disappear. The top blocks "fall" out of the container (`animate-fall-right-custom`).
*   **Gain:** When points are gained (e.g., next turn or weakness refund), new blocks slide up from the bottom (`animate-slide-up-in-custom`).
*   **Siren Glow:** Active blocks pulse with a cyan glow (`animate-sirene-glow`) to indicate they are "charged" and ready to be used.

### Code Highlight
The visual logic is handled in `src/app/components/TurnPointBar.tsx`. It uses a "lagging state" to animate changes.

```typescript
// Simplified Logic
useEffect(() => {
  if (currentPoints < displayPoints) {
    // LOSS: Trigger 'fall' animation for the difference
    setFallingBlocks(indicesToDrop);
    setTimeout(() => setDisplayPoints(currentPoints), 600); // Wait for animation
  } else if (currentPoints > displayPoints) {
    // GAIN: Slide new blocks in
    setDisplayPoints(currentPoints);
  }
}, [currentPoints]);
```

## 3. Strategic Tips
1.  **Don't Spam Attacks:** Since attacks cost 2 TP, you can easily run out of points before all your units act.
2.  **Focus Fire:** Use the **Weakness Refund** to attack more times than normally possible.
3.  **Defensive Play:** If you are low on HP, using **Guard** (1 TP) is cheaper than attacking and protects your unit.
