import { FIELD_SIZE } from './constants';
import { Bonus, BonusType, Dimension, ElementType, Field, Point, Shot } from './types';

/** Sorted priorities compare lexicographically; a longer matching prefix wins. */
export function comparePriorities(a: number[], b: number[]): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) {
      return a[i] - b[i];
    }
  }
  return a.length - b.length;
}

function validate(field: Field, bonus: Bonus): void {
  const width = field[0]?.length ?? 0;

  if (field.length > FIELD_SIZE || width > FIELD_SIZE || field.some(row => row.length !== width)) {
    throw new Error(`The field must be rectangular and at most ${FIELD_SIZE} × ${FIELD_SIZE}.`);
  }

  field.forEach((row, y) => {
    row.forEach((item, x) => {
      if (!item) {
        return;
      }

      if (item.position.x !== x || item.position.y !== y) {
        throw new Error('Item positions must match their field coordinates.');
      }

      if (
        item.type === ElementType.Bonus
          ? item.weight !== 0
          : !Number.isInteger(item.weight) || item.weight < 1 || item.weight > 5
      ) {
        throw new Error('Items need priorities 1–5; bonuses need priority 0.');
      }
    }
  )});

  if (
    bonus.kind === BonusType.Line
    && bonus.dimension !== Dimension.Horizontal
    && bonus.dimension !== Dimension.Vertical
  ) {
    throw new Error('Line dimension must be horizontal or vertical.');
  }

  if (
    bonus.kind === BonusType.Point
    && (!Number.isInteger(bonus.elementsToDestroy) || bonus.elementsToDestroy < 1)
  ) {
    throw new Error('Point target count must be a positive integer.');
  }

  if (
    bonus.kind === BonusType.Bomb
    && (!Number.isInteger(bonus.explosionRadius) || bonus.explosionRadius < 0)
  ) {
    throw new Error('Bomb radius must be a nonnegative integer.');
  }
}

/** A blocker stops a line at its origin too, as required by screenshot 2. */
export function bestShot(field: Field, bonus: Bonus): Shot | null {
  validate(field, bonus);

  const height = field.length;
  const width = field[0]?.length ?? 0;

  if (!height || !width) {
    return null;
  }

  // Row-major traversal makes the first equally good target deterministic.
  const cells: Point[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      cells.push({ x, y });
    }
  }

  const result = (targets: Point[], hits: Point[]): Shot => {
    // Empty cells can be targets, but only occupied cells contribute priorities.
    const affected = hits
      .filter(({ x, y }) => field[y][x] !== null)
      .sort((a, b) => a.y - b.y || a.x - b.x);

    return {
      targets,
      affected,
      priorities: affected
        .map(({ x, y }) => field[y][x]!.weight)
        .sort((a, b) => b - a),
    };
  };

  if (bonus.kind === BonusType.Point) {
    // Independent hits need only the highest priorities; empty cells sort last.
    const targets = [...cells]
      .sort((a, b) => (field[b.y][b.x]?.weight ?? -1) - (field[a.y][a.x]?.weight ?? -1))
      .slice(0, bonus.elementsToDestroy);

    return result(targets, targets);
  }

  let best: Shot | null = null;

  for (const target of cells) {
    const hits: Point[] = [target];
    const origin = field[target.y][target.x];

    if (bonus.kind === BonusType.Bomb) {
      // Clip the square to the board edges. Blockers do not limit a bomb.
      hits.length = 0;

      const fromY = Math.max(0, target.y - bonus.explosionRadius);
      const toY = Math.min(height - 1, target.y + bonus.explosionRadius);
      for (let y = fromY; y <= toY; y++) {
        const fromX = Math.max(0, target.x - bonus.explosionRadius);
        const toX = Math.min(width - 1, target.x + bonus.explosionRadius);
        for (let x = fromX; x <= toX; x++) {
          hits.push({ x, y });
        }
      }
    } else if (!(origin?.type === ElementType.Blocker && origin.isBlocker)) {
      for (const direction of [-1, 1]) {
        const dx = bonus.dimension === Dimension.Horizontal ? direction : 0;
        const dy = bonus.dimension === Dimension.Vertical ? direction : 0;

        for (
          let x = target.x + dx, y = target.y + dy;
          x >= 0 && x < width && y >= 0 && y < height;
          x += dx, y += dy
        ) {
          // Include the stopping blocker before ending this ray.
          hits.push({ x, y });

          const item = field[y][x];

          if (item?.type === ElementType.Blocker && item.isBlocker) {
            break;
          }
        }
      }
    }

    const candidate = result([target], hits);

    // Keep the earlier target when the priority sequences are equal.
    if (!best || comparePriorities(candidate.priorities, best.priorities) > 0) {
      best = candidate;
    }
  }

  return best;
}

export default bestShot;
