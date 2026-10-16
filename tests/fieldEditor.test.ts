import { FIELD_SIZE } from '../constants';
import { createRandomField, parseField, serializeField } from '../fieldEditor';
import { createExample } from '../fixtures';
import { ElementType } from '../types';

test('field text round-trips both examples and every supported token', () => {
  for (const index of [0, 1]) {
    const field = createExample(index);
    expect(parseField(serializeField(field))).toEqual(field);
  }

  const tokens = ['1', '2', '3', '4', '5', 'B1', 'B2', 'B3', 'B4', 'B5', '0'];
  const row = Array.from({ length: FIELD_SIZE }, (_, index) => tokens[index % tokens.length]).join(' ');
  const emptyRow = Array(FIELD_SIZE).fill('.').join(' ');
  const text = [row, ...Array(FIELD_SIZE - 1).fill(emptyRow)].join('\n');
  const field = parseField(text);

  expect(serializeField(field)).toBe(text);
  expect(field[0][9]).toMatchObject({ position: { x: 9, y: 0 }, weight: 5, isBlocker: true });
  expect(field[1].every(cell => cell === null)).toBe(true);
  expect(parseField(text.replaceAll('\n', '\r\n'))).toEqual(field);
});

test('invalid field text reports dimensions or the offending token location', () => {
  const rows = serializeField(createExample(0)).split('\n');
  expect(() => parseField(rows.slice(1).join('\n'))).toThrow(`Expected ${FIELD_SIZE} rows; found ${FIELD_SIZE - 1}.`);

  rows[3] = '1 1';
  expect(() => parseField(rows.join('\n'))).toThrow(`Row 4: expected ${FIELD_SIZE} cells; found 2.`);

  const invalidRow = Array(FIELD_SIZE).fill('1');
  invalidRow[6] = 'B6';
  rows[3] = invalidRow.join(' ');
  expect(() => parseField(rows.join('\n'))).toThrow('Row 4, column 7:');
});

test('shuffle fills the field with positioned pieces, valid priorities and varied types', () => {
  // Exercise each distribution branch and both endpoints of regular priorities.
  const values = [0.05, 0, 0.15, 0.99, 0.5, 0, 0.99, 0.99];
  let index = 0;
  const field = createRandomField(() => values[index++ % values.length]);

  expect(field).toHaveLength(FIELD_SIZE);
  expect(field.every(row => row.length === FIELD_SIZE && row.every(Boolean))).toBe(true);
  expect(new Set(field.flat().map(item => item!.type))).toEqual(new Set([
    ElementType.Bonus,
    ElementType.Blocker,
    ElementType.Element,
  ]));

  field.forEach((row, y) => row.forEach((item, x) => {
    expect(item!.position).toEqual({ x, y });
    expect(item!.weight).toBeGreaterThanOrEqual(item!.type === ElementType.Bonus ? 0 : 1);
    expect(item!.weight).toBeLessThanOrEqual(5);
  }));
  expect(parseField(serializeField(field))).toEqual(field);
});
