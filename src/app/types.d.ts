export type Phase =
  | "START"
  | "SETUP"
  | "PLAYER_TURN"
  | "ENEMY_TURN"
  | "PASSIVE"
  | "VICTORY"
  | "DEFEAT";
export type UnitType = "PLAYER" | "ENEMY";
export type Element = "FIRE" | "ICE" | "WIND" | "PHYSICAL";

export interface Unit {
  id: string;
  type: UnitType;
  x: number | null;
  y: number | null;
  hp: number;
  maxHp: number;
  element: Element;
  weakness: Element;
  isDead: boolean;
  isGuarding?: boolean;
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

export type InteractionMode = "MENU" | "SKILLS" | "TARGETING";

export interface InteractionState {
  mode: InteractionMode;
  selectedSkill: Element | null;
}
