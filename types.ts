export interface Point {
  x: number;
  y: number;
}

export enum ElementType {
  Element = 'element',
  Blocker = 'blocker',
  Bonus = 'bonus',
}

export type Priority = 1 | 2 | 3 | 4 | 5;

interface Element {
  position: Point;
}

export interface RegularElement extends Element {
  type: ElementType.Element;
  weight: Priority;
}

export interface Blocker extends Element {
  type: ElementType.Blocker;
  weight: Priority;
  isBlocker: boolean;
}

export enum Dimension {
  Horizontal = 'x',
  Vertical = 'y',
}

// The kind discriminant determines which bonus-specific settings are available.
export enum BonusType {
  Point = 'point',
  Line = 'line',
  Bomb = 'bomb',
}

export interface BonusRandomDestroyer extends Element {
  type: ElementType.Bonus;
  weight: 0;
  kind: BonusType.Point;
  elementsToDestroy: number;
}

export interface BonusDimensionDestroyer extends Element {
  type: ElementType.Bonus;
  weight: 0;
  kind: BonusType.Line;
  dimension: Dimension;
}

export interface BonusBombDestroyer extends Element {
  type: ElementType.Bonus;
  weight: 0;
  kind: BonusType.Bomb;
  explosionRadius: number;
}

export type Bonus = BonusRandomDestroyer | BonusDimensionDestroyer | BonusBombDestroyer;
export type Elements = RegularElement | Blocker | Bonus;

/** Row-major: field[y][x]. null represents an empty cell. */
export type Field = (Elements | null)[][];

export interface Shot {
  targets: Point[];
  affected: Point[];
  priorities: number[];
}
