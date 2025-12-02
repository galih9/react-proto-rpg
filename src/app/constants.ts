import type { TileData, ActiveUnit, ISkillType, Element, ElementAffinity } from "./types";
import { UNITS as DB_UNITS } from "./data/units";

export const ROWS = 4;
export const COLS = 5;
export const DRAG_TYPE = "UNIT";

// Helper to create the custom Raka unit
const createRaka = (): ActiveUnit => {
    const skills: ISkillType[] = [
        {
            id: 100,
            name: "Basic Attack",
            element: "PHYSICAL",
            description: "A basic physical attack.",
            baseDamage: 20,
            targetType: "ANY",
            pointCost: 2
        },
        {
            id: 101,
            name: "Fireball",
            element: "FIRE",
            description: "A ball of fire.",
            baseDamage: 30,
            targetType: "PROJECTILE_SINGLE",
            pointCost: 2
        }
    ];

    const normalStatus: Record<Element, ElementAffinity> = {
        PHYSICAL: "NORMAL",
        FIRE: "NORMAL",
        ICE: "NORMAL",
        WIND: "NORMAL",
        BLACK_MAGIC: "NORMAL",
        SPECIAL: "NORMAL"
    };

    const emptyContact = {
        recruitOption: [],
        startRecruit: [],
        resultRecruit: [],
        trashtalk: [],
        taunt: [],
        dispute: [],
        begFund: [],
        begItem: [],
        askFund: [],
        askItem: []
    };

    return {
        id: "p1",
        name: "Raka",
        displayName: "Raka",
        lore: "The custom player character.",
        shortDescription: "A balanced warrior.",
        baseHp: 100,
        baseLevel: 1,
        type: "PLAYER",
        x: null,
        y: null,
        hp: 100,
        maxHp: 100,
        element: "FIRE", // Main element
        skills: skills,
        contact: emptyContact,
        status: normalStatus,
        statusEffects: [],
        isDead: false,
        floatingTextEvents: []
    };
};

// Helper to convert DB IUnit to ActiveUnit
const createActiveUnitFromDB = (
    dbUnitName: string,
    id: string,
    type: "PLAYER" | "ENEMY",
    element: Element, // We assign a main element manually as IUnit doesn't have it
    x: number | null,
    y: number | null
): ActiveUnit => {
    const dbUnit = DB_UNITS.find(u => u.name === dbUnitName);
    if (!dbUnit) {
        throw new Error(`Unit ${dbUnitName} not found in database!`);
    }

    return {
        ...dbUnit,
        id,
        type,
        displayName: dbUnit.name,
        x,
        y,
        hp: dbUnit.baseHp,
        maxHp: dbUnit.baseHp,
        element,
        statusEffects: [],
        isDead: false,
        floatingTextEvents: []
    };
};

export const INITIAL_UNITS: ActiveUnit[] = [
    createRaka(),
    createActiveUnitFromDB("Tuyul", "p2", "PLAYER", "ICE", null, null),
    createActiveUnitFromDB("Pocong", "e1", "ENEMY", "ICE", 4, 1),
    createActiveUnitFromDB("Genderuwo", "e2", "ENEMY", "WIND", 3, 2),
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
