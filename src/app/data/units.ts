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
        recruitOption:[
            {
                option: "",
                id: ""
            }
        ],
      startRecruit: [
        {
          id: "1",
          lines: [
            {
              text: "Hmm, so you wanted me to join your gang?",
              actor: "Tuyul",
            },
            {
              text: "It's not going to be free though. How about this?",
              actor: "Tuyul",
            },
          ],
          dialogType: "CONFIDENT",
        },
        {
          id: "2",
          lines: [
            {
              text: "Huh? What do you mean you want me to join you?",
              actor: "Tuyul",
            },
            {
              text: "I don't think its gonna happen bud.",
              actor: "Tuyul",
            },
          ],
          dialogType: "CONFUSED",
        },
      ],
      resultRecruit: [
        {
          id: "1",
          refId: "1",
          lines: [
            {
              text: "Hell yeah, that's more like it",
              actor: "Tuyul",
            },
            {
              text: "Wazzzup gang?",
              actor: "Tuyul",
            },
          ],
          dialogType: "SATISFY",
        },
        {
          id: "2",
          refId: "1",
          lines: [
            {
              text: "What is this? are you joking?",
              actor: "Tuyul",
            },
          ],
          dialogType: "ANGRY",
        },
      ],
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
