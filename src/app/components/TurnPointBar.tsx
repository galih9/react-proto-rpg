import React, { useEffect, useState, useRef } from 'react';

interface Props {
  points: number;
}

export const TurnPointBar: React.FC<Props> = ({ points }) => {
  const [displayPoints, setDisplayPoints] = useState(points);
  const [fallingBlocks, setFallingBlocks] = useState<number[]>([]); // Array of IDs/Indexes for falling blocks
  const prevPointsRef = useRef(points);

  useEffect(() => {
    const diff = points - prevPointsRef.current;

    if (diff < 0) {
      // Points consumed - Trigger fall animation
      const lostCount = Math.abs(diff);
      const blocksToFall = [];
      // If we had 4, now 2. We lost blocks at index 3 and 2 (0-indexed logic sort of, or 1-based top blocks)
      // Actually simpler: We are losing the top-most blocks.
      // If we had 5 blocks, now 3. We lose blocks 5 and 4.
      for (let i = 0; i < lostCount; i++) {
        blocksToFall.push(prevPointsRef.current - i);
      }
      setFallingBlocks(blocksToFall);

      // Delay removing them from display to allow animation start
      setTimeout(() => {
        setDisplayPoints(points);
        setFallingBlocks([]);
      }, 500); // Animation duration
    } else if (diff > 0) {
      // Points gained - Delay update to allow slide up (or just slide up)
      // User asked for delay when gaining point bonus
      setTimeout(() => {
        setDisplayPoints(points);
      }, 500);
    } else {
        setDisplayPoints(points);
    }

    prevPointsRef.current = points;
  }, [points]);

  // We render the MAX of display and actual to handle the animations
  // But for the stack, we want to render up to the larger number, then animate the difference.
  // const renderCount = Math.max(displayPoints, prevPointsRef.current);

  // Actually, to keep it simple:
  // We always render `displayPoints`.
  // If we are dropping, `displayPoints` stays high for a moment, but the 'falling' ones get a class.
  // If we are gaining, `displayPoints` stays low, then increases (slide up effect handled by transition).

  // Wait, if I use a stack of divs, I can animate them individually.
  // Max possible points? Let's say 10 is enough for UI, or dynamic.
  // We'll just render `renderCount` blocks.

  // Let's iterate.
  const blocks = [];
  // Determine the number of blocks to render.
  // If points dropped (10 -> 8), we want to render 10, but 9 and 10 are falling.
  // If points gained (8 -> 10), we want to render 8, then 10 after delay.

  const countToRender = Math.max(points, prevPointsRef.current);

  for (let i = 1; i <= countToRender; i++) {
    const isFalling = fallingBlocks.includes(i);
    // If we are gaining, the new blocks (i > prevPoints) should scale in or slide up.
    // The delay handles the "wait then show".
    // So if points > prevPoints, the new blocks appear after the timeout in useEffect sets displayPoints.
    // So here we only render what is in `displayPoints` unless falling.

    // Correction:
    // If dropping: prev=5, curr=3. We want to show 5 blocks. 4 and 5 fall. After timeout, we show 3.
    // So if diff < 0, we use prevPointsRef.current as loop limit.

    // If gaining: prev=3, curr=5. We show 3. After timeout, we show 5.
    // So we use displayPoints as loop limit.

    // Combining:
    const limit = (points < prevPointsRef.current) ? prevPointsRef.current : displayPoints;
    if (i > limit) continue;

    blocks.push(
      <div
        key={i}
        className={`w-full bg-cyan-500 rounded shadow-sm border border-cyan-400 transition-all duration-500 ease-out
          ${isFalling ? 'translate-y-20 opacity-0 rotate-12' : 'translate-y-0 opacity-100'}
          ${!isFalling && i > prevPointsRef.current && points > prevPointsRef.current ? 'animate-slide-up' : ''}
        `}
        style={{
            height: '10%', // Fixed height % or pixel
            marginBottom: '4px'
        }}
      />
    );
  }

  // To make them stack from bottom, we use flex-col-reverse
  return (
    <div className="w-full h-64 bg-slate-200 rounded-lg p-2 flex flex-col-reverse overflow-hidden shadow-inner border border-slate-300 relative">
      {blocks}
    </div>
  );
};
