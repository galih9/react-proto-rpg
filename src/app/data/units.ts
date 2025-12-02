import type { IUnit } from "../types";

const UNITS: IUnit[] = [
  {
    id: "S1",
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
        targetType: "ANY",
        pointCost: 2,
        baseDamage: 25,
      },
      {
        id: 1,
        name: "Deadly Poison",
        element: "BLACK_MAGIC",
        description: "Throw poison into a single enemy",
        targetType: "PROJECTILE_SINGLE",
        pointCost: 2,
        baseDamage: 30,
      },
      {
        id: 2,
        name: "Steal",
        element: "SPECIAL",
        description:
          "Steal any money from the enemy, if they don't have any more money, it will disarm them for 4 turn",
        targetType: "ANY",
        pointCost: 1,
        baseDamage: 0,
      },
    ],
    contact: {
      recruitOption: [],
      startRecruit: [],
      resultRecruit: [],
      trashtalk: [],
      taunt: [],
      dispute: [],
      begFund: [],
      begItem: [],
      askFund: [],
      askItem: [],
    },
  },
  {
    id: "S2",
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
        targetType: "ANY",
        pointCost: 2,
        baseDamage: 20,
      },
      {
        id: 1,
        name: "Float",
        element: "SPECIAL",
        description: "Float in the sky for 3 turn, gaining high evasion against any attack, while floating, he can still attack",
        targetType: "ANY",
        pointCost: 3,
        baseDamage: 0,
      },
      {
        id: 2,
        name: "Bite",
        element: "PHYSICAL",
        description:
          "Deal high damage and recover health based on half of the damage",
        targetType: "ANY",
        pointCost: 2,
        baseDamage: 30,
      },
    ],
    contact: {
      recruitOption: [],
      startRecruit: [],
      resultRecruit: [],
      trashtalk: [],
      taunt: [],
      dispute: [],
      begFund: [],
      begItem: [],
      askFund: [],
      askItem: [],
    },
  },
  {
    id: "S3",
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
        baseDamage: 0,
      },
      {
        id: 1,
        name: "Bash",
        element: "PHYSICAL",
        description: "Will go into channelling mode once, and the next time having turn will deal devastating damage to an enemy",
        targetType: "ANY",
        pointCost: 3,
        baseDamage: 100,
      },
      {
        id: 2,
        name: "Bite",
        element: "PHYSICAL",
        description:
          "Deal high damage and recover health based on half of the damage",
        targetType: "ANY",
        pointCost: 2,
        baseDamage: 30,
      },
    ],
    contact: {
      recruitOption: [],
      startRecruit: [],
      resultRecruit: [],
      trashtalk: [],
      taunt: [],
      dispute: [],
      begFund: [],
      begItem: [],
      askFund: [],
      askItem: [],
    },
  },
];

const SENTRY = [];

export { UNITS, SENTRY };
