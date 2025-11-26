import type { TileData, Unit } from "./types";

export const ROWS = 4;
export const COLS = 5;
export const DRAG_TYPE = "UNIT";

export const INITIAL_UNITS: Unit[] = [
  {
    id: "p1",
    type: "PLAYER",
    x: null,
    y: null,
    hp: 50,
    maxHp: 50,
    element: "FIRE",
    weakness: "ICE",
    isDead: false,
  },
  {
    id: "p2",
    type: "PLAYER",
    x: null,
    y: null,
    hp: 50,
    maxHp: 50,
    element: "ICE",
    weakness: "FIRE",
    isDead: false,
  },
  {
    id: "e1",
    type: "ENEMY",
    x: 4,
    y: 1,
    hp: 100,
    maxHp: 100,
    element: "ICE",
    weakness: "FIRE",
    isDead: false,
  },
  {
    id: "e2",
    type: "ENEMY",
    x: 3,
    y: 2,
    hp: 80,
    maxHp: 80,
    element: "WIND",
    weakness: "PHYSICAL",
    isDead: false,
  },
];

export const createGrid = (): TileData[] => {
  const tiles: TileData[] = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      let zone: TileData["zone"] = "NEUTRAL";
      if (x < 2) zone = "PLAYER";
      if (x > 2) zone = "ENEMY";
      tiles.push({ x, y, zone });
    }
  }
  return tiles;
};
