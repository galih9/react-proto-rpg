import type { ActiveUnit, ISkillType } from "../types";
import { ROWS } from "../constants";

export const getValidTargets = (
  skill: ISkillType,
  source: ActiveUnit,
  allUnits: ActiveUnit[]
): string[] => {
  const targets: string[] = [];

  // Filter out dead units initially
  const livingUnits = allUnits.filter((u) => !u.isDead);
  const enemies = livingUnits.filter((u) => u.type === "ENEMY");

  switch (skill.targetType) {
    case "SELF":
      targets.push(source.id);
      break;

    case "ANY":
    case "MULTIPLE":
      // Target all enemies regardless of position
      enemies.forEach((u) => targets.push(u.id));
      break;

    case "PROJECTILE_SINGLE":
      // Target frontmost unit in each row, but only if it's an enemy.
      // If a friendly unit is in front, the enemy behind is blocked.
      for (let y = 0; y < ROWS; y++) {
        // Get all units in this row to the right of the source
        const rowUnits = livingUnits
          .filter((u) => u.y === y && u.x !== null && u.x > (source.x || 0))
          .sort((a, b) => (a.x || 0) - (b.x || 0));

        if (rowUnits.length > 0) {
          const firstUnit = rowUnits[0];
          if (firstUnit.type === "ENEMY") {
            targets.push(firstUnit.id);
          }
          // If firstUnit is PLAYER/NEUTRAL, it blocks line of sight, so no target in this row.
        }
      }
      break;

    case "THROWABLE_SINGLE":
      // Only targets in the last column (index 4)
      enemies.filter((u) => u.x === 4).forEach((u) => targets.push(u.id));
      break;

    default:
      // Fallback for other types or custom logic
      break;
  }

  return targets;
};
