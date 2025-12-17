import type { ActiveItem, Item, LevelInformation } from "../types";

const LEVELS: LevelInformation[] = [
  {
    levelName: "First Level",
    units: [{ creatureId: "C1", x: 3, y: 1, moneyCarried: 100 }],
  },
  {
    levelName: "Second Level",
    units: [
      { creatureId: "C1", x: 3, y: 1, moneyCarried: 210 },
      { creatureId: "C1", x: 3, y: 2, moneyCarried: 180 },
    ],
  },
  {
    levelName: "Third Level",
    units: [
      { creatureId: "C1", x: 3, y: 1, moneyCarried: 200 },
      { creatureId: "C2", x: 3, y: 2, moneyCarried: 300 },
      { creatureId: "C2", x: 4, y: 2, moneyCarried: 300 },
    ],
  },
  {
    levelName: "Final Level",
    units: [
      { creatureId: "C1", x: 3, y: 1, moneyCarried: 200 },
      { creatureId: "C3", x: 3, y: 2, moneyCarried: 300 },
      { creatureId: "C2", x: 4, y: 2, moneyCarried: 300 },
      { creatureId: "C1", x: 3, y: 3, moneyCarried: 300 },
    ],
  },
];

const ITEMS: Item[] = [
  {
    name: "Small Heal Potion",
    description: "Heal single target",
    price: 10,
    baseNumber: 20,
    id: "1",
    effectType: "SUPPORT",
  },
  {
    name: "Heal Potion",
    description: "Heal single target",
    price: 40,
    baseNumber: 50,
    id: "2",
    effectType: "SUPPORT",
  },
  {
    name: "Big Heal Potion",
    description: "Heal single target",
    price: 80,
    baseNumber: 100,
    id: "3",
    effectType: "SUPPORT",
  },
  {
    name: "Heal Miracle",
    description: "Heal entire party",
    price: 150,
    baseNumber: 120,
    id: "4",
    effectType: "SUPPORT",
  },
  {
    name: "Spirit Potion",
    description: "Restore sp to a single character",
    price: 50,
    baseNumber: 80,
    id: "5",
    effectType: "SUPPORT",
  },
  {
    name: "Fully Spirit Potion",
    description: "Restore full sp to a single character",
    price: 140,
    baseNumber: 0,
    id: "6",
    effectType: "SUPPORT",
  },
  {
    name: "Fire ball",
    description: "Deal fire damage to a single character",
    price: 200,
    baseNumber: 80,
    id: "7",
    effectType: "ATTACK",
    targetType: "ANY_ENEMY",
  },
];

const SHOP_ITEMS: ActiveItem[] = [
  {
    stock: 10,
    itemId: "1",
  },
  {
    stock: 10,
    itemId: "5",
  },
  {
    stock: 10,
    itemId: "7",
  },
];

export { LEVELS, ITEMS, SHOP_ITEMS };
