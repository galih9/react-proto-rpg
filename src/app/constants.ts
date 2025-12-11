import type {
  TileData,
  ActiveUnit,
  ISkillType,
  Element,
  ElementAffinity,
} from "./types";
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
      baseNumber: 20,
      targetType: "ANY_ENEMY",
      pointCost: 2,
      spCost: 15
    },
    {
      id: 101,
      name: "Fireball",
      element: "FIRE",
      description: "A ball of fire.",
      baseNumber: 30,
      targetType: "PROJECTILE_SINGLE",
      pointCost: 2,
      spCost: 15
    },
    // prototype
    // support skill
    {
      id: 401,
      name: "Heal",
      element: "SPECIAL",
      description: "Heal a single ally",
      baseNumber: 100,
      targetType: "ANY_ALLY",
      pointCost: 2,
      spCost: 15
    },
    {
      id: 402,
      name: "Heal All",
      element: "SPECIAL",
      description: "Heal the entire active party",
      baseNumber: 100,
      targetType: "ALL_ALLY",
      pointCost: 2,
      spCost: 15
    },
    {
      id: 403,
      name: "Increase Attack",
      element: "SPECIAL",
      description: "Increase attack of an ally",
      baseNumber: 30,
      targetType: "ANY_ALLY",
      pointCost: 2,
      spCost: 15
    },
    {
      id: 404,
      name: "Weakened Weapon",
      element: "SPECIAL",
      description: "Decrease attack of an enemy",
      baseNumber: 30,
      targetType: "ANY_ENEMY",
      pointCost: 2,
      spCost: 15
    },
    {
      id: 406,
      name: "Weakened Mass Weapon",
      element: "SPECIAL",
      description: "Decrease attack all enemy",
      baseNumber: 30,
      targetType: "ALL_ENEMY",
      pointCost: 2,
      spCost: 15
    },
    {
      id: 405,
      name: "Weakened Armor",
      element: "SPECIAL",
      description: "Decrease Defense of an enemy",
      baseNumber: 40,
      targetType: "ANY_ENEMY",
      pointCost: 2,
      spCost: 15
    },
    // sentries
    // {
    //   id: 601,
    //   name: "Deploy Wall",
    //   element: "SPECIAL",
    //   description:
    //     "Deploying a wall in front of him",
    //   targetType: "DEPLOY_FRONT",
    //   pointCost: 2,
    //   baseNumber: 0,
    //   isChannelingSkill: false,
    // spCost: 15
    // },
    // {
    //   id: 602,
    //   name: "Deploy Jailankung",
    //   element: "SPECIAL",
    //   description:
    //     "Deploying a Sentry Jailankung in front of him",
    //   targetType: "DEPLOY_ANY",
    //   pointCost: 2,
    //   baseNumber: 0,
    //   isChannelingSkill: false,
    // spCost: 15
    // },
    // {
    //   id: 1,
    //   name: "Bash",
    //   element: "PHYSICAL",
    //   description:
    //     "Will go into channelling mode once, and the next time having turn will deal devastating damage to an enemy",
    //   targetType: "ANY",
    //   pointCost: 2,
    //   baseNumber: 100,
    //   isChannelingSkill: true,
    // },
    // {
    //   id: 1,
    //   name: "Test Target All",
    //   element: "FIRE",
    //   description: "-",
    //   baseNumber: 20,
    //   targetType: "MULTIPLE",
    //   pointCost: 2,
    // },
    // {
    //   id: 2,
    //   name: "Test Target Any Single",
    //   element: "FIRE",
    //   description: "-",
    //   baseNumber: 20,
    //   targetType: "ANY",
    //   pointCost: 2,
    // },
    // {
    //   id: 3,
    //   name: "Test Target Projectile Single",
    //   element: "FIRE",
    //   description: "-",
    //   baseNumber: 20,
    //   targetType: "PROJECTILE_SINGLE",
    //   pointCost: 2,
    // },
    // {
    //   id: 4,
    //   name: "Test Target Throwable Single",
    //   element: "FIRE",
    //   description: "-",
    //   baseNumber: 20,
    //   targetType: "THROWABLE_SINGLE",
    //   pointCost: 2,
    // },
    // {
    //   id: 5,
    //   name: "Test Self Heal",
    //   element: "SPECIAL",
    //   description: "-",
    //   baseNumber: 40,
    //   targetType: "SELF",
    //   pointCost: 2,
    // },
  ];

  const normalStatus: Record<Element, ElementAffinity> = {
    PHYSICAL: "NORMAL",
    FIRE: "NORMAL",
    ICE: "NORMAL",
    WIND: "NORMAL",
    BLACK_MAGIC: "NORMAL",
    SPECIAL: "NORMAL",
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
    x: 0,
    y: 0,
    hp: 100,
    maxHp: 100,
    element: "FIRE", // Main element
    skills: skills,
    status: normalStatus,
    statusEffects: [],
    isDead: false,
    floatingTextEvents: [],
    isChanneling: false,
    channelingSkillId: null,
    channelingTargetId: null,
    agility: 10,
    strength: 10,
    inteligence: 10,
    moneyCarried: 0,
    baseSp: 100
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
  const dbUnit = DB_UNITS.find((u) => u.name === dbUnitName);
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
    floatingTextEvents: [],
    isChanneling: false,
    channelingSkillId: null,
    channelingTargetId: null,
  };
};

export const INITIAL_UNITS: ActiveUnit[] = [
  createRaka(),
  createActiveUnitFromDB("Tuyul", "p2", "PLAYER", "ICE", null, null),
  createActiveUnitFromDB("Pocong", "e1", "ENEMY", "ICE", 4, 1),
  createActiveUnitFromDB("Genderuwo", "e2", "ENEMY", "WIND", 3, 1),
  createActiveUnitFromDB("Pocong", "e3", "ENEMY", "ICE", 3, 2),
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
