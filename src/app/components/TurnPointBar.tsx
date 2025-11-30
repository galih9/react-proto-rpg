import React, { useEffect, useState, useRef } from 'react';

interface Props {
  points: number;
}

export const TurnPointBar: React.FC<Props> = ({ points }) => {
  const [displayPoints, setDisplayPoints] = useState(points);
  const [fallingBlocks, setFallingBlocks] = useState<number[]>([]);
  const prevPointsRef = useRef(points);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const diff = points - prevPointsRef.current;

    if (diff < 0) {
      // Points consumed - Trigger fall animation
      const lostCount = Math.abs(diff);
      const blocksToFall = [];
      for (let i = 0; i < lostCount; i++) {
        blocksToFall.push(prevPointsRef.current - i);
      }
      setFallingBlocks(blocksToFall);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setDisplayPoints(points);
        setFallingBlocks([]);
      }, 800);
    } else if (diff > 0) {
      setDisplayPoints(points);
      setFallingBlocks([]);
    } else {
        setDisplayPoints(points);
    }

    prevPointsRef.current = points;
  }, [points]);

  const countToRender = Math.max(points, displayPoints);
  const blocks = [];

  for (let i = 1; i <= countToRender; i++) {
    const isFalling = fallingBlocks.includes(i);

    // Structure:
    // Outer div: Handles Layout, Positioning, Entry (Slide Up), and Exit (Fall Right) animations.
    // Inner div: Handles Visuals (Background, Border, Glow).

    blocks.push(
      <div
        key={i}
        className={`w-full transition-all duration-300
          ${isFalling ? 'animate-fall-right' : 'animate-slide-up-in'}
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
