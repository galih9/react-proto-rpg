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
export type ElementAffinity = "WEAK" | "RESIST" | "NULL" | "DRAIN" | "DEFLECT" | "NORMAL"
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
  status: Record<Element, ElementAffinity>
}

// Inherit from IUnit but omit fields that conflict or need specific ActiveUnit handling if any
// We are keeping x, y, hp (current), type, statusEffects, isDead, isGuarding, displayName, floatingTextEvents
// We will use IUnit's 'skills' and 'status' directly.
export interface ActiveUnit extends IUnit {
  // Overriding/Adding fields specific to active gameplay
  type: UnitType;
  x: number | null;
  y: number | null;
  hp: number; // Current HP (vs baseHp in IUnit)
  maxHp: number; // Calculated max HP (likely same as baseHp for now)

  // NOTE: 'element' was in ActiveUnit but not explicitly in IUnit (IUnit has status map).
  // However, units usually have a base element. The 'data/units.ts' doesn't seem to have a single 'element' field,
  // only 'status' map.
  // If the game logic needs a "main element", we might need to keep it or derive it.
  // Looking at data/units.ts:
  // "Tuyul" -> status { PHYSICAL: WEAK, FIRE: WEAK ... }
  // It doesn't explicitly say "Element: FIRE".
  // However, existing ActiveUnit had 'element'.
  // I will keep 'element' in ActiveUnit for now as a required field for the game logic (e.g. AI logic might use it),
  // but I will assign it based on best guess or defaults if not in IUnit.
  element: Element;

  statusEffects: StatusEffect[];
  isDead: boolean;
  isGuarding?: boolean;
  displayName: string; // Can be same as name
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
  selectedSkill: ISkillType | null;
}
