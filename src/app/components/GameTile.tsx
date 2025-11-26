import React from 'react';
import { useDrop } from 'react-dnd';
import type { TileData, Phase } from '../types';
import { DRAG_TYPE } from '../constants';

interface Props {
  tile: TileData;
  phase: Phase;
  moveUnit: (id: string, x: number, y: number) => void;
  children?: React.ReactNode;
}

export const GameTile: React.FC<Props> = ({ tile, phase, moveUnit, children }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: DRAG_TYPE,
    canDrop: () => phase === 'SETUP' && tile.zone === 'PLAYER', 
    drop: (item: { id: string }) => moveUnit(item.id, tile.x, tile.y),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [phase, tile]); // <--- FIX INCLUDED HERE

  let bgClass = 'bg-white';
  if (tile.zone === 'PLAYER') bgClass = 'bg-blue-50';
  if (tile.zone === 'NEUTRAL') bgClass = 'bg-gray-200';
  if (tile.zone === 'ENEMY') bgClass = 'bg-red-50';

  if (isOver && canDrop) bgClass = 'bg-green-300';
  if (!isOver && canDrop) bgClass = 'bg-green-100';
  if (isOver && !canDrop) bgClass = 'bg-gray-400';

  return (
    <div
      ref={drop as any}
      className={`w-full h-24 border border-gray-300 flex items-center justify-center relative ${bgClass} transition-colors duration-200`}
    >
      <span className="absolute top-1 left-1 text-[10px] text-gray-400 uppercase">{tile.zone}</span>
      {children}
    </div>
  );
};