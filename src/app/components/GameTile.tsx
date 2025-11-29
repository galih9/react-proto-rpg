import React from 'react';
import { useDrop } from 'react-dnd';
import type { TileData, Phase } from '../types';
import { DRAG_TYPE } from '../constants';

interface Props {
  tile: TileData;
  phase: Phase;
  moveUnit: (id: string, x: number, y: number) => void;
  isValidMove?: boolean; // <--- New prop for move highlighting
  onClick?: () => void;  // <--- New prop for click handling
  children?: React.ReactNode;
}

export const GameTile: React.FC<Props> = ({ tile, phase, moveUnit, isValidMove, onClick, children }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: DRAG_TYPE,
    canDrop: () => phase === 'SETUP' && tile.zone === 'PLAYER', 
    drop: (item: { id: string }) => moveUnit(item.id, tile.x, tile.y),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [phase, tile]);

  let bgClass = 'bg-white';
  if (tile.zone === 'PLAYER') bgClass = 'bg-blue-100';
  if (tile.zone === 'NEUTRAL') bgClass = 'bg-gray-300';
  if (tile.zone === 'ENEMY') bgClass = 'bg-red-100';

  if (isOver && canDrop) bgClass = 'bg-green-400 transform scale-105';
  if (!isOver && canDrop) bgClass = 'bg-green-200';
  if (isOver && !canDrop) bgClass = 'bg-gray-500';

  // Move Highlight Override
  if (isValidMove) {
      bgClass = 'bg-green-500 ring-4 ring-green-300 cursor-pointer hover:bg-green-400';
  }

  return (
    <div
      ref={drop as any}
      onClick={isValidMove ? onClick : undefined}
      className={`w-full h-24 flex items-center justify-center relative rounded-lg shadow-md transition-all duration-300 ease-in-out ${bgClass}`}
    >
      <span className="absolute top-1 left-1 text-[10px] text-gray-500 uppercase">{tile.zone}</span>
      {children}
    </div>
  );
};
