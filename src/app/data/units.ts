import type { IUnit } from "../types";

const UNITS: IUnit[] = [
  // ward unit
  {
    id: "S1",
    name: "Wall",
    lore: "Wall",
    shortDescription:
      "A Wall that can block projectile attack",
    baseHp: 100,
    baseLevel: 1,
    skills: [],
    status: {
      PHYSICAL: "NORMAL",
      FIRE: "NORMAL",
      ICE: "NORMAL",
      WIND: "NORMAL",
      BLACK_MAGIC: "NORMAL",
      SPECIAL: "NORMAL"
    }
  },
  // sentry unit
  {
    id: "S1",
    name: "Jailankung",
    lore: "A cursed old toy that said been posessed by evil spirit",
    shortDescription:
      "A sentry unit that will lock an enemy target",
    baseHp: 20,
    baseLevel: 1,
    skills: [],
    passiveSkill: [
      {
        id: 0,
        name: "Locked in",
        element: "PHYSICAL",
        description: "Quick shoot onto frontliner enemies",
        targetType: "PROJECTILE_SINGLE",
        pointCost: 0,
        baseNumber: 10,
      }
    ],
    status: {
      PHYSICAL: "NORMAL",
      FIRE: "NORMAL",
      ICE: "NORMAL",
      WIND: "NORMAL",
      BLACK_MAGIC: "NORMAL",
      SPECIAL: "NORMAL"
    }
  },
  // creature units
  {
    id: "C1",
    name: "Tuyul",
    lore: "A deceased spirit of a baby sacrificed for some ritual. Now the baby is used mainly as a tool to steal other people's money",
    shortDescription:
      "An agile spirit, capable to steal and disarming the enemies",
    baseHp: 70,
    baseLevel: 1,
    skills: [
      {
        id: 0,
        name: "Scratch",
        element: "PHYSICAL",
        description: "Quick scratch onto any enemies",
        targetType: "PROJECTILE_SINGLE",
        pointCost: 2,
        baseNumber: 25,
      },
      {
        id: 1,
        name: "Deadly Poison",
        element: "BLACK_MAGIC",
        description: "Throw poison into a single enemy",
        targetType: "PROJECTILE_SINGLE",
        pointCost: 2,
        baseNumber: 30,
      },
      {
        id: 2,
        name: "Steal",
        element: "SPECIAL",
        description:
          "Steal any money from the enemy, if they don't have any more money, it will disarm them for 4 turn",
        targetType: "ANY_ENEMY",
        pointCost: 1,
        baseNumber: 0,
      },
    ],
    status: {
      PHYSICAL: "WEAK",
      FIRE: "WEAK",
      ICE: "NORMAL",
      WIND: "NORMAL",
      BLACK_MAGIC: "WEAK",
      SPECIAL: "NORMAL"
    }
  },
  {
    id: "C2",
    name: "Pocong",
    lore: "Haunting spirit of a freshly dead body, yearning for revenge.",
    shortDescription:
      "A ferocious spirit, and a decent tanker",
    baseHp: 120,
    baseLevel: 1,
    skills: [
      {
        id: 0,
        name: "Bump",
        element: "PHYSICAL",
        description: "Quick bump onto any enemies",
        targetType: "PROJECTILE_SINGLE",
        pointCost: 2,
        baseNumber: 20,
      },
      {
        id: 1,
        name: "Float",
        element: "SPECIAL",
        description: "Float in the sky for 3 turn, gaining high evasion against any attack, while floating, he can still attack",
        targetType: "SELF",
        pointCost: 3,
        baseNumber: 0,
      },
      {
        id: 2,
        name: "Bite",
        element: "PHYSICAL",
        description:
          "Deal high damage and recover health based on half of the damage",
        targetType: "PROJECTILE_SINGLE",
        pointCost: 2,
        baseNumber: 30,
      },
    ],
    status: {
      PHYSICAL: "RESIST",
      FIRE: "WEAK",
      ICE: "WEAK",
      WIND: "WEAK",
      BLACK_MAGIC: "RESIST",
      SPECIAL: "NORMAL"
    }
  },
  {
    id: "C3",
    name: "Genderuwo",
    lore: "A giant spirit who defy death.",
    shortDescription:
      "A beefy unstopable tank",
    baseHp: 300,
    baseLevel: 1,
    skills: [
      {
        id: 0,
        name: "One more",
        element: "SPECIAL",
        description: "When dying for the first time, he will revive with half health",
        targetType: "SELF",
        pointCost: 0,
        baseNumber: 0,
      },
      {
        id: 1,
        name: "Bash",
        element: "PHYSICAL",
        description: "Will go into channelling mode once, and the next time having turn will deal devastating damage to an enemy",
        targetType: "PROJECTILE_SINGLE",
        pointCost: 2,
        baseNumber: 100,
        isChannelingSkill: true,
      },
      {
        id: 2,
        name: "Bite",
        element: "PHYSICAL",
        description:
          "Deal high damage and recover health based on half of the damage",
        targetType: "PROJECTILE_SINGLE",
        pointCost: 2,
        baseNumber: 30,
      },
    ],
    status: {
      PHYSICAL: "DRAIN",
      FIRE: "WEAK",
      ICE: "NULL",
      WIND: "NULL",
      BLACK_MAGIC: "RESIST",
      SPECIAL: "NORMAL"
    }
  },
];

const SENTRY: IUnit[] = [];

export { UNITS, SENTRY };
