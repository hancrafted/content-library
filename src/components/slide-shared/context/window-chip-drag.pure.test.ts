import { describe, expect, it } from 'vitest';
import type { Part } from './context.types';
import { crossedChip } from './window-chip-drag.pure';

const ORDER: readonly Part[] = ['chat', 'timeline', 'context', 'category'];
const BOX = { left: 100, width: 40 };

describe('success cases', () => {
  it('takes the chip once the pointer passes its middle on the way in, forwards', () => {
    // ARRANGE
    const dragged = 'chat';
    const target = 'context';
    const pastMiddle = BOX.left + BOX.width / 2 + 1;
    // ACT
    const found = crossedChip(ORDER, dragged, { part: target, ...BOX, x: pastMiddle });
    // ASSERT
    expect(found).toBe(target);
  });

  it('takes the chip once the pointer passes its middle on the way in, backwards', () => {
    // ARRANGE
    const dragged = 'category';
    const target = 'timeline';
    const beforeMiddle = BOX.left + BOX.width / 2 - 1;
    // ACT
    const found = crossedChip(ORDER, dragged, { part: target, ...BOX, x: beforeMiddle });
    // ASSERT
    expect(found).toBe(target);
  });
});

describe('failure cases', () => {
  it('does nothing before the middle of the chip', () => {
    // ARRANGE
    const beforeMiddle = BOX.left + 5;
    // ACT
    const found = crossedChip(ORDER, 'chat', { part: 'context', ...BOX, x: beforeMiddle });
    // ASSERT
    expect(found).toBeNull();
  });

  it('does nothing over the dragged chip itself', () => {
    // ARRANGE
    const x = BOX.left + BOX.width - 1;
    // ACT
    const found = crossedChip(ORDER, 'chat', { part: 'chat', ...BOX, x });
    // ASSERT
    expect(found).toBeNull();
  });
});

describe('edge cases', () => {
  it('does nothing over no chip, or an element that names no part', () => {
    // ARRANGE
    const x = BOX.left + BOX.width;
    // ACT
    const none = crossedChip(ORDER, 'chat', null);
    const stranger = crossedChip(ORDER, 'chat', { part: 'nope', ...BOX, x });
    // ASSERT
    expect([none, stranger]).toEqual([null, null]);
  });
});
