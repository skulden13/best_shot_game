import { FIELD_SIZE } from '../constants';
import { bestShot } from '../bestShot';
import { bonuses, createExample } from '../fixtures';

test('image 1: the best 5 × 5 blast collects four nuts and 21 ordinary pieces', () => {
  const field = createExample(0);

  expect(field).toHaveLength(FIELD_SIZE);
  expect(field.every(row => row.length === FIELD_SIZE && row.every(cell => cell !== null))).toBe(true);
  expect(field.flat()).toHaveLength(FIELD_SIZE ** 2);

  const shot = bestShot(field, bonuses[3].bonus)!;

  expect(shot.targets).toEqual([{ x: 2, y: 3 }]);
  expect(shot.priorities).toEqual([...Array(4).fill(2), ...Array(21).fill(1)]);
  expect(shot.affected).toEqual(
    Array.from({ length: 25 }, (_, i) => ({
      x: i % 5,
      y: 1 + Math.floor(i / 5),
    })),
  );
});

test('image 2: the best horizontal ray hits two birds and stops after the first nut', () => {
  const field = createExample(1);

  expect(field).toHaveLength(FIELD_SIZE);
  expect(field.every(row => row.length === FIELD_SIZE && row.every(cell => cell !== null))).toBe(true);
  expect(field.flat()).toHaveLength(FIELD_SIZE ** 2);

  const shot = bestShot(field, bonuses[2].bonus)!;

  expect(shot.priorities).toEqual([5, 5, 2, 1]);
  expect(shot.affected).toEqual([
    { x: 0, y: 2 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 3, y: 2 },
  ]);

  // The pictured origin ties with two earlier cells on the same ray.
  expect(shot.targets[0].y).toBe(2);
  expect([0, 1, 2]).toContain(shot.targets[0].x);
  expect(shot.affected).not.toContainEqual({ x: 4, y: 2 });
});
