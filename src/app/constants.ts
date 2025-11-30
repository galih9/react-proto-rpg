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
    skills: ["PHYSICAL", "FIRE"],
    statusEffects: [],
    isDead: false,
    displayName: "Raka",
    floatingTextEvents: []
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
    skills: ["PHYSICAL", "ICE", "BLACK_MAGIC"],
    statusEffects: [],
    isDead: false,
    displayName: "Tuyul",
    floatingTextEvents: []
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
    skills: ["PHYSICAL", "ICE"],
    statusEffects: [],
    isDead: false,
    displayName: "Pocong",
    floatingTextEvents: []
  },
  {
    id: "e2",
    type: "ENEMY",
    x: 3,
    y: 2,
    hp: 120,
    maxHp: 120,
    element: "WIND",
    weakness: "PHYSICAL",
    skills: ["PHYSICAL", "WIND"],
    statusEffects: [],
    isDead: false,
    displayName: "Genderuwo",
    floatingTextEvents: []
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
