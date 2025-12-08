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

  // Identify opponents based on source type
  const isPlayer = source.type === "PLAYER";
  const opponents = livingUnits.filter((u) => u.type === (isPlayer ? "ENEMY" : "PLAYER"));

  switch (skill.targetType) {
    case "SELF":
      targets.push(source.id);
      break;

    case "ANY":
    case "MULTIPLE":
      // Target all opponents regardless of position
      opponents.forEach((u) => targets.push(u.id));
      break;

    case "PROJECTILE_SINGLE":
      // Target frontmost unit in each row (from source perspective)
      for (let y = 0; y < ROWS; y++) {
        let rowUnits: ActiveUnit[] = [];

        if (isPlayer) {
            // Shooting Right (x > source.x) -> Sort Ascending (Nearest first)
            rowUnits = livingUnits
              .filter((u) => u.y === y && u.x !== null && u.x > (source.x || 0))
              .sort((a, b) => (a.x || 0) - (b.x || 0));
        } else {
            // Shooting Left (x < source.x) -> Sort Descending (Nearest first)
            rowUnits = livingUnits
              .filter((u) => u.y === y && u.x !== null && u.x < (source.x || 0))
              .sort((a, b) => (b.x || 0) - (a.x || 0));
        }

        if (rowUnits.length > 0) {
          const firstUnit = rowUnits[0];
          // Valid target if it's an opponent (or explicitly Wall/Sentry if we need to distinguish, but Type handles it)
          if (firstUnit.type !== source.type) {
            targets.push(firstUnit.id);
          }
          // If firstUnit is friendly (same type), it blocks line of sight.
        }
      }
      break;

    case "THROWABLE_SINGLE":
      // Only targets in the backmost column
      // Player throws to Col 4. Enemy throws to Col 0?
      // Assuming "Throwable" implies lobbing over to the back.
      const targetCol = isPlayer ? 4 : 0;
      opponents.filter((u) => u.x === targetCol).forEach((u) => targets.push(u.id));
      break;

    case "DEPLOY_FRONT":
    case "DEPLOY_ANY":
       // These targets TILE, not UNIT. This function returns UNIT IDs.
       // So we return empty here, logic is handled in handleTileClick.
       break;

    default:
      break;
  }

  return targets;
};
