import { FIELD_SIZE } from './constants';
import { Bonus, BonusType, Dimension, ElementType, Field, Point } from './types';

export const bonuses: { label: string; bonus: Bonus }[] = [
  {
    label: '🎯 Triple strike',
    bonus: {
      type: ElementType.Bonus,
      weight: 0,
      kind: BonusType.Point,
      position: { x: 0, y: 0 },
      elementsToDestroy: 3,
    },
  },
  {
    label: '🚀 Vertical rocket ↕️',
    bonus: {
      type: ElementType.Bonus,
      weight: 0,
      kind: BonusType.Line,
      position: { x: 0, y: 0 },
      dimension: Dimension.Vertical,
    },
  },
  {
    label: '🚀 Horizontal rocket ↔️',
    bonus: {
      type: ElementType.Bonus,
      weight: 0,
      kind: BonusType.Line,
      position: { x: 0, y: 0 },
      dimension: Dimension.Horizontal,
    },
  },
  {
    label: '💣 Area bomb',
    bonus: {
      type: ElementType.Bonus,
      weight: 0,
      kind: BonusType.Bomb,
      position: { x: 0, y: 0 },
      explosionRadius: 2,
    },
  },
];

const points = (pairs: number[][]): Point[] => pairs.map(([x, y]) => ({ x, y }));

export function createExample(index: number): Field {
  // Special-piece coordinates are transcribed from the two example images.
  const blockers = points(index === 0
    ? [[2, 1], [4, 2], [7, 2], [3, 4], [1, 5], [7, 5], [8, 5]]
    : [[3, 2], [4, 2]]);
  const birds = points(index === 0
    ? []
    : [[0, 2], [1, 2], [6, 2], [4, 3], [6, 4], [2, 5], [5, 6], [6, 6], [7, 7]]);
  const placedBonuses = points(index === 0 ? [[3, 8], [4, 8]] : [[4, 8], [5, 8]]);

  const includes = (list: Point[], x: number, y: number) =>
    list.some(point => point.x === x && point.y === y);

  // Extend each illustrated board to the configured field size with ordinary priority-1 pieces.
  return Array.from({ length: FIELD_SIZE }, (_, y) =>
    Array.from({ length: FIELD_SIZE }, (_, x) => {
      const position = { x, y };

      if (includes(blockers, x, y)) {
        return { type: ElementType.Blocker, position, weight: 2, isBlocker: true };
      }

      if (includes(placedBonuses, x, y)) {
        return { ...bonuses[3].bonus, position };
      }

      return {
        type: ElementType.Element,
        position,
        weight: includes(birds, x, y) ? 5 : 1,
      };
    }),
  );
}
