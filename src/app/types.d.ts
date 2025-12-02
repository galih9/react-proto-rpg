export type Phase =
  | "START"
  | "SETUP"
  | "PLAYER_TURN"
  | "ENEMY_TURN"
  | "PASSIVE"
  | "VICTORY"
  | "DEFEAT";
export type UnitType = "PLAYER" | "ENEMY" | "NEUTRAL";
export type Element =
  | "FIRE"
  | "ICE"
  | "WIND"
  | "PHYSICAL"
  | "BLACK_MAGIC"
  | "SPECIAL";
// skill target types
export type ISkillTarget =
  | "ANY"
  | "SELF"
  | "MULTIPLE"
  | "PROJECTILE_SINGLE"
  | "PROJECTILE_MULTI"
  | "THROWABLE_SINGLE"
  | "THROWABLE_MULTI"
  | "SPECIAL";
// target types can be used for friendly target or enemy target
// ANY = will target a single target regardless their tile position
// MULTIPLE = will target all (either enemy or ally)
// SELF = only target self
// target types with exclusive for attacking
// PROJECTILE = will target the frontmost target of the enemy regardless any tile position
// THROWABLE = will target the backmost tiles of the enemy
// SPECIAL = have custom tile attack specifically for certain skill (cone shape, aoe, triangle, etc)

export interface StatusEffect {
  id: string; // Unique ID for the effect instance
  type: "POISON";
  duration: number; // Number of ticks remaining
  sourceId: string; // Who applied it
}

export interface FloatingTextEvent {
  id: string;
  value: number;
  type: "DAMAGE" | "HEAL";
}

export interface ActiveUnit {
  id: string;
  type: UnitType;
  x: number | null;
  y: number | null;
  hp: number;
  maxHp: number;
  element: Element;
  weakness: Element;
  // soon change skills to having ISkillType[]
  skills: Element[];
  statusEffects: StatusEffect[];
  isDead: boolean;
  isGuarding?: boolean;
  displayName: string;
  floatingTextEvents: FloatingTextEvent[];
}

export interface TileData {
  x: number;
  y: number;
  zone: "PLAYER" | "NEUTRAL" | "ENEMY";
}

export interface LogEntry {
  id: number;
  message: string;
}

export type InteractionMode =
  | "MENU"
  | "SKILLS"
  | "TARGETING"
  | "MOVING"
  | "EXECUTING";

export interface InteractionState {
  mode: InteractionMode;
  selectedSkill: Element | null;
}
// new skill type
export interface ISkillType {
  id: number;
  name: string;
  element: Element;
  description: string;
  baseDamage: number;
  targetType: ISkillTarget;
  pointCost: number;
}

export type IResponseTypes =
  | "SATISFY"
  | "DISRESPECT"
  | "CONFUSED"
  | "PITY"
  | "CONFIDENT"
  | "ANGRY";
export interface IDialogues {
  text: string;
  actor: string | null;
}
export interface IVariantDialogue {
  id: string;
  refId?: string;
  lines: IDialogues[];
  dialogType: IResponseTypes;
}
export interface IOptions {
  option: string;
  id: string;
}
export interface IUnitInteraction {
  startRecruit: IVariantDialogue[];
  resultRecruit: IVariantDialogue[];
  recruitOption: IOptions[];
  trashtalk: IDialogues[];
  taunt: IDialogues[];
  dispute: IDialogues[];
  begFund: IDialogues[];
  begItem: IDialogues[];
  askFund: IDialogues[];
  askItem: IDialogues[];
}
export interface IUnit {
  id: string;
  name: string;
  lore: string;
  shortDescription: string;
  baseHp: number;
  baseLevel: number;
  skills: ISkillType[];
  contact: IUnitInteraction;
}
