export type Phase =
  | "START"
  | "SETUP"
  | "PLAYER_TURN"
  | "ENEMY_TURN"
  | "PASSIVE";
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
