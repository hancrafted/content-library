import { describe, expect, it } from 'vitest';
import { cellNumber, GRID_3X2_CELLS, spotlightPoint } from './grid-3x2.pure';

const box = { left: 100, top: 50, width: 300, height: 200 };

describe('success cases', () => {
  it('places the spotlight at the pointer, measured from the card corner', () => {
    // ARRANGE
    const offset = { x: 40, y: 30 };
    const pointer = { x: box.left + offset.x, y: box.top + offset.y };
    // ACT
    const point = spotlightPoint(pointer, box);
    // ASSERT
    expect(point).toEqual(offset);
  });

  it('numbers the cells in reading order with two digits', () => {
    // ARRANGE
    const expected = ['01', '02', '03', '04', '05', '06'];
    // ACT
    const numbers = GRID_3X2_CELLS.map((_, index) => cellNumber(index));
    // ASSERT
    expect(numbers).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('rejects a pointer position that is not a number', () => {
    // ARRANGE
    const pointer = { x: Number.NaN, y: 0 };
    // ACT
    const place = () => spotlightPoint(pointer, box);
    // ASSERT
    expect(place).toThrow(String(pointer.x));
  });

  it('rejects a negative cell index', () => {
    // ARRANGE
    const stray = -1;
    // ACT
    const number = () => cellNumber(stray);
    // ASSERT
    expect(number).toThrow(String(stray));
  });
});

describe('edge cases', () => {
  it('clamps a pointer past the bottom-right corner onto the corner', () => {
    // ARRANGE
    const pointer = { x: box.left + box.width + 25, y: box.top + box.height + 25 };
    // ACT
    const point = spotlightPoint(pointer, box);
    // ASSERT
    expect(point).toEqual({ x: box.width, y: box.height });
  });

  it('clamps a pointer above and left of the card onto its top-left corner', () => {
    // ARRANGE
    const pointer = { x: box.left - 10, y: box.top - 10 };
    const corner = { x: 0, y: 0 };
    // ACT
    const point = spotlightPoint(pointer, box);
    // ASSERT
    expect(point).toEqual(corner);
  });

  it('keeps the spotlight at the corner of a card with no size yet', () => {
    // ARRANGE
    const empty = { left: 0, top: 0, width: 0, height: 0 };
    const corner = { x: 0, y: 0 };
    // ACT
    const point = spotlightPoint({ x: 12, y: 8 }, empty);
    // ASSERT
    expect(point).toEqual(corner);
  });
});
