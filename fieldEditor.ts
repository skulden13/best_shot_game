import { FIELD_SIZE } from './constants';
import { BonusType, ElementType, Field, Point, Priority } from './types';

/** Compact tokens describe scoring and blockers; placed bonuses use a bomb shape. */
export function serializeField(field: Field): string {
  return field.map(row => row.map(item => {
    if (!item) {
      return '.';
    }

    if (item.type === ElementType.Blocker && item.isBlocker) {
      return `B${item.weight}`;
    }

    return String(item.weight);
  }).join(' ')).join('\n');
}

export function parseField(text: string): Field {
  const rows = text.trim().split(/\r?\n/);

  if (rows.length !== FIELD_SIZE) {
    throw new Error(`Expected ${FIELD_SIZE} rows; found ${rows.length}.`);
  }

  return rows.map((row, y) => {
    const tokens = row.trim().split(/\s+/);

    if (tokens.length !== FIELD_SIZE) {
      throw new Error(`Row ${y + 1}: expected ${FIELD_SIZE} cells; found ${tokens.length}.`);
    }

    return tokens.map((token, x) => {
      const position: Point = { x, y };

      if (token === '.') {
        return null;
      }

      if (token === '0') {
        return {
          type: ElementType.Bonus,
          weight: 0,
          kind: BonusType.Bomb,
          position,
          explosionRadius: 2,
        };
      }

      if (/^B[1-5]$/.test(token)) {
        return {
          type: ElementType.Blocker,
          weight: Number(token[1]) as Priority,
          position,
          isBlocker: true,
        };
      }

      if (/^[1-5]$/.test(token)) {
        return {
          type: ElementType.Element,
          weight: Number(token) as Priority,
          position,
        };
      }

      throw new Error(`Row ${y + 1}, column ${x + 1}: use 1–5, B1–B5, 0, or .`);
    });
  });
}

/** Every random cell is occupied: 10% bonuses, 15% blockers, 75% regular pieces. */
export function createRandomField(random: () => number = Math.random): Field {
  const rows = Array.from({ length: FIELD_SIZE }, () =>
    Array.from({ length: FIELD_SIZE }, () => {
      const kind = random();
      const weight = Math.floor(random() * 5) + 1;

      if (kind < 0.1) {
        return '0';
      }

      return kind < 0.25 ? `B${weight}` : String(weight);
    }).join(' '),
  );

  return parseField(rows.join('\n'));
}
