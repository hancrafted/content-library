import { describe, expect, it } from 'vitest';
import { menuItemAfter, tabAfter } from './roving-focus.pure';

describe('success cases', () => {
  it('moves between tabs with the arrows, wrapping at both ends, and jumps with Home and End', () => {
    // ARRANGE
    const tabs = ['notes', 'script'];
    const expected = ['script', 'script', 'notes', 'notes', 'script'];
    // ACT
    const targets = [
      tabAfter('ArrowRight', 'notes', tabs),
      tabAfter('ArrowLeft', 'notes', tabs),
      tabAfter('ArrowRight', 'script', tabs),
      tabAfter('Home', 'script', tabs),
      tabAfter('End', 'notes', tabs),
    ];
    // ASSERT
    expect(targets).toEqual(expected);
  });

  it('moves between menu items with the vertical arrows, wrapping, and jumps with Home and End', () => {
    // ARRANGE
    const items = ['beside', 'over'];
    const expected = ['over', 'over', 'beside', 'beside', 'over'];
    // ACT
    const targets = [
      menuItemAfter('ArrowDown', 'beside', items),
      menuItemAfter('ArrowUp', 'beside', items),
      menuItemAfter('ArrowDown', 'over', items),
      menuItemAfter('Home', 'over', items),
      menuItemAfter('End', 'beside', items),
    ];
    // ASSERT
    expect(targets).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('returns no tab for a key that is not a tab key', () => {
    // ARRANGE
    const tabs = ['notes', 'script'];
    // ACT
    const target = tabAfter('Enter', 'notes', tabs);
    // ASSERT
    expect(target).toBeNull();
  });

  it('returns no menu item for a key that is not a menu key, horizontal arrows included', () => {
    // ARRANGE
    const items = ['beside', 'over'];
    // ACT
    const targets = ['Enter', 'ArrowRight', 'ArrowLeft'].map((key) => menuItemAfter(key, 'beside', items));
    // ASSERT
    expect(targets).toEqual([null, null, null]);
  });
});

describe('edge cases', () => {
  it('stays on the only tab', () => {
    // ARRANGE
    const tabs = ['notes'];
    const expected = 'notes';
    // ACT
    const target = tabAfter('ArrowRight', 'notes', tabs);
    // ASSERT
    expect(target).toBe(expected);
  });

  it('stays on the only menu item', () => {
    // ARRANGE
    const items = ['beside'];
    // ACT
    const target = menuItemAfter('ArrowDown', 'beside', items);
    // ASSERT
    expect(target).toBe(items[0]);
  });
});
