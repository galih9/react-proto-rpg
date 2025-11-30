import React, { useEffect, useState, useRef } from 'react';

interface Props {
  points: number;
}

export const TurnPointBar: React.FC<Props> = ({ points }) => {
  // displayPoints: The number of points currently being rendered as "stable"
  const [displayPoints, setDisplayPoints] = useState(points);
  // fallingBlocks: Indices of blocks currently animating out
  const [fallingBlocks, setFallingBlocks] = useState<number[]>([]);

  // We use a queue to handle rapid updates sequentially (e.g., 4 -> 2 -> 3)
  // However, simpler for React state is to process one transition at a time.
  // We track the 'target' points via the prop 'points'.
  // We use an effect to move 'displayPoints' towards 'points'.

  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (isAnimatingRef.current) return; // If busy, wait. (This might need a queue if we strictly want to process all steps)
    // Actually, if we just check diff between displayPoints and points:

    if (displayPoints !== points) {
      if (points < displayPoints) {
        // LOSS detected
        const diff = displayPoints - points;
        const blocksToFall = [];
        // We lose the top-most (highest index) blocks currently displayed
        for (let i = 0; i < diff; i++) {
          blocksToFall.push(displayPoints - i);
        }

        setFallingBlocks(blocksToFall);
        isAnimatingRef.current = true;

        // Wait for fall animation to finish
        setTimeout(() => {
          setDisplayPoints(points);
          setFallingBlocks([]);
          isAnimatingRef.current = false;
        }, 600); // 0.6s matches css duration

      } else if (points > displayPoints) {
        // GAIN detected
        // We want a delay BEFORE showing the new blocks
        isAnimatingRef.current = true;

        setTimeout(() => {
          setDisplayPoints(points);
          isAnimatingRef.current = false;
        }, 600); // Delay before showing gain
      }
    }
  }, [points, displayPoints]);

  // If points change rapidly (4 -> 2 -> 3):
  // 1. Initial: disp=4, points=4.
  // 2. Prop update: points=2. Effect runs. points(2) < disp(4).
  //    - setFallingBlocks([4, 3]). Start 600ms timer.
  // 3. Prop update (e.g. at 100ms): points=3.
  //    - Effect runs. isAnimatingRef is true. RETURNS.
  //    - The timer from step 2 is still running.
  // 4. Timer finishes (at 600ms).
  //    - setDisplayPoints(2). setFallingBlocks([]). isAnimatingRef = false.
  // 5. Effect runs (because displayPoints changed to 2).
  //    - now points=3 (from step 3), disp=2.
  //    - points(3) > disp(2). GAIN detected.
  //    - Start 600ms timer (delay).
  // 6. Timer finishes.
  //    - setDisplayPoints(3). isAnimatingRef = false.
  // This achieves the "Consumption (animate) -> Gain (animate)" sequence perfectly.

  const countToRender = Math.max(points, displayPoints);
  const blocks = [];

  for (let i = 1; i <= countToRender; i++) {
    // Determine status
    // 1. Is it a falling block?
    const isFalling = fallingBlocks.includes(i);

    // 2. Is it a new block (gain)?
    // A block is "new"/gained if it is currently visible (<= displayPoints)
    // BUT we need to distinguish if it *just* appeared.
    // Actually, the `animate-slide-up-in-custom` animation runs on mount.
    // When `displayPoints` goes from 2 -> 3, block 3 is mounted.
    // So it automatically gets the entry animation.
    // We just need to make sure we don't apply it to stable blocks.
    // But stable blocks are already mounted. React doesn't unmount/remount them unless key changes.
    // Key is `i`. So stable blocks (1, 2) stay. Block 3 mounts -> animates.

    // One edge case: If we drop 4->2, then gain 2->3.
    // Block 3 was falling (unmounted eventually), then remounted.
    // So it will animate in. Correct.

    blocks.push(
      <div
        key={i}
        className={`w-full transition-all duration-300 relative
          ${isFalling ? 'z-10 animate-fall-right-custom' : 'z-0 animate-slide-up-in-custom'}
        `}
        style={{
            height: '24px',
            marginBottom: '4px'
        }}
      >
        <div className="w-full h-full rounded shadow-sm border border-cyan-400 bg-cyan-500 animate-sirene-glow" />
      </div>
    );
  }

  return (
    <div className="w-full h-64 bg-slate-200/80 rounded-lg p-2 flex flex-col overflow-hidden shadow-inner border border-slate-300 relative">
      {blocks}
    </div>
  );
};
