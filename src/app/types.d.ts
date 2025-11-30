export type Phase =
  | "START"
  | "SETUP"
  | "PLAYER_TURN"
  | "ENEMY_TURN"
  | "PASSIVE"
  | "VICTORY"
  | "DEFEAT";
export type UnitType = "PLAYER" | "ENEMY";
export type Element = "FIRE" | "ICE" | "WIND" | "PHYSICAL" | "BLACK_MAGIC";

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

export interface Unit {
  id: string;
  type: UnitType;
  x: number | null;
  y: number | null;
  hp: number;
  maxHp: number;
  element: Element;
  weakness: Element;
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

export type InteractionMode = "MENU" | "SKILLS" | "TARGETING" | "MOVING" | "EXECUTING";

export interface InteractionState {
  mode: InteractionMode;
  selectedSkill: Element | null;
}
