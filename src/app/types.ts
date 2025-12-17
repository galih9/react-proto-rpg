export type Phase =
  | "LOADING"
  | "MENU"
  | "PRE_GAME_LOAD"
  | "START"
  | "SETUP"
  | "PLAYER_TURN"
  | "ENEMY_TURN"
  | "PASSIVE"
  | "VICTORY"
  | "DEFEAT"
  | "BREAKING_ROOM"
  | "GAME_VICTORY";
export type UnitType = "PLAYER" | "ENEMY" | "NEUTRAL";
export type Element =
  | "FIRE"
  | "ICE"
  | "WIND"
  | "PHYSICAL"
  | "BLACK_MAGIC"
  | "SPECIAL";
export type ElementAffinity =
  | "WEAK"
  | "RESIST"
  | "NULL"
  | "DRAIN"
  | "DEFLECT"
  | "NORMAL";
// skill target types
export type ISkillTarget =
  | "ANY_ENEMY"
  | "ANY_ALLY"
  | "ALL_ALLY"
  | "ALL_ENEMY"
  | "SELF"
  | "PROJECTILE_SINGLE"
  | "PROJECTILE_MULTI"
  | "THROWABLE_SINGLE"
  | "THROWABLE_MULTI"
  | "DEPLOY_FRONT"
  | "DEPLOY_AROUND"
  | "DEPLOY_ANY"
  | "DEPLOY_ALLY"
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
  type: "POISON" | "ATTACK_UP" | "ATTACK_DOWN" | "DEFENSE_DOWN";
  name: string; // Display name (e.g., "Atk Up", "Poison")
  value: number; // Percentage value (e.g., 30 for 30%) or damage amount for poison
  duration: number; // Number of ticks remaining
  sourceId: string; // Who applied it
}

export interface FloatingTextEvent {
  id: string;
  text: string;
  type: "DAMAGE" | "HEAL" | "WEAK" | "RESIST" | "NULL" | "DRAIN" | "DEFLECT";
}

export interface ISkillType {
  id: number;
  name: string;
  element: Element;
  description: string;
  targetType: ISkillTarget;
  pointCost: number;
  spCost: number;
  baseNumber: number;
  isChannelingSkill?: boolean;
}

export interface IDialogues {
  type: "PROMPT-MONEY" | "PROMPT-ITEM" | "SPEECH";
  text: string;
  actor: string | null;
}
export interface IOptions {
  option: string;
  id: string;
}
export interface IUnit {
  id: string;
  name: string;
  lore: string;
  shortDescription: string;
  baseHp: number;
  baseSp: number;
  baseLevel: number;
  skills: ISkillType[];
  passiveSkill?: ISkillType[];
  status: Record<Element, ElementAffinity>;
  moneyCarried?: number;
  strength: number;
  agility: number;
  inteligence: number;
}

export interface ActiveUnit extends IUnit {
  // Overriding/Adding fields specific to active gameplay
  type: UnitType;
  x: number | null;
  y: number | null;
  hp: number; // Current HP (vs baseHp in IUnit)
  maxHp: number;
  sp: number;
  maxSp: number;
  element: Element;

  statusEffects: StatusEffect[];
  isDead: boolean;
  isGuarding?: boolean;
  displayName: string; // Can be same as name
  floatingTextEvents: FloatingTextEvent[];
  isChanneling: boolean;
  channelingSkillId: number | null;
  channelingTargetId: string | null;
  moodType?: MoodType;
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
  | "DEPLOYING"
  | "EXECUTING";

export interface InteractionState {
  mode: InteractionMode;
  selectedSkill: ISkillType | null;
  warning?: string | null;
}

export type MoodType =
  | "CONFIDENT"
  | "ANGRY"
  | "CONFUSED"
  | "PITY"
  | "DISRESPECT"
  | "SATISFY";

export interface LevelCreature {
  creatureId: string;
  moneyCarried: number;
  x: number;
  y: number;
}

export interface LevelInformation {
  units: LevelCreature[];
  levelName: string;
}
export interface Item {
  name: string;
  description: string;
  baseNumber: number;
  price: number;
  id: string;
  effectType: "SUPPORT" | "ATTACK";
  targetType?: ISkillTarget;
}

export interface ActiveItem {
  itemId: string;
  stock: number;
}

export interface InventoryItem extends ActiveItem {
  quantity: number;
}
