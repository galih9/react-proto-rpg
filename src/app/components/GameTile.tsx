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
  if (tile.zone === 'PLAYER') bgClass = 'bg-blue-100';
  if (tile.zone === 'NEUTRAL') bgClass = 'bg-gray-300';
  if (tile.zone === 'ENEMY') bgClass = 'bg-red-100';

  if (isOver && canDrop) bgClass = 'bg-green-400 transform scale-105';
  if (!isOver && canDrop) bgClass = 'bg-green-200';
  if (isOver && !canDrop) bgClass = 'bg-gray-500';

  return (
    <div
      ref={drop as any}
      className={`w-full h-24 flex items-center justify-center relative rounded-lg shadow-md transition-all duration-300 ease-in-out ${bgClass}`}
    >
      <span className="absolute top-1 left-1 text-[10px] text-gray-500 uppercase">{tile.zone}</span>
      {children}
    </div>
  );
};