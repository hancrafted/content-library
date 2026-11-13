import { describe, expect, it } from 'vitest';
import { CONSOLE_DESK_HEIGHT, consoleLayout, maxMugs, MIN_CONSOLE_WIDTH } from './console.pure';

/*
 * The control-room console: desk, screens, mugs and the seat anchor, from the approved Spec's console. (0, 0) is the
 * desk top's front-left corner; the seat is the floor point under the pilot's chair.
 */

describe('success cases', () => {
  it('seats the pilot left of the desk on the floor, two screens side by side at a third of the width each', () => {
    // ARRANGE
    const width = 260;
    const expected = {
      seat: { x: -60, y: CONSOLE_DESK_HEIGHT },
      glass: [
        { x: 26, y: -40, width: 93.6, height: 32 },
        { x: 135.2, y: -40, width: 93.6, height: 32 },
      ],
    };
    // ACT
    const layout = consoleLayout({ width });
    // ASSERT
    expect({ seat: layout.seat, glass: layout.screens.map(({ glass }) => glass) }).toEqual(expected);
  });

  it('spreads one wide screen for content such as a skill file', () => {
    // ARRANGE
    const width = 200;
    const expected = [{ x: 20, y: -40, width: 156, height: 32 }];
    // ACT
    const glass = consoleLayout({ width, screens: 1 }).screens.map((s) => s.glass);
    // ASSERT
    expect(glass).toEqual(expected);
  });

  it('stands the mugs on the desk top in a row', () => {
    // ARRANGE
    const width = 120;
    const mugs = 3;
    // ACT
    const layout = consoleLayout({ width, mugs });
    // ASSERT
    expect(layout.mugs).toHaveLength(mugs);
  });
});

describe('failure cases', () => {
  it('refuses a desk too narrow for a screen and a mug', () => {
    // ARRANGE
    const width = MIN_CONSOLE_WIDTH - 1;
    const expected = /at least/;
    // ACT
    const lay = () => consoleLayout({ width });
    // ASSERT
    expect(lay).toThrow(expected);
  });

  it('refuses a part or a negative mug', () => {
    // ARRANGE
    const counts = [-1, 1.5];
    const expected = /whole mugs/;
    // ACT
    const lays = counts.map((mugs) => () => consoleLayout({ width: 120, mugs }));
    // ASSERT
    for (const lay of lays) expect(lay).toThrow(expected);
  });

  it('refuses more mugs than the desk holds', () => {
    // ARRANGE
    const width = 82;
    const expected = /at most/;
    // ACT
    const lay = () => consoleLayout({ width, mugs: maxMugs(width) + 1 });
    // ASSERT
    expect(lay).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('seats the pilot right of a flipped desk and mirrors the screens without mirroring their content box', () => {
    // ARRANGE
    const width = 100;
    const expected = {
      seat: { x: 160, y: CONSOLE_DESK_HEIGHT },
      glass: [
        { x: 54, y: -40, width: 36, height: 32 },
        { x: 12, y: -40, width: 36, height: 32 },
      ],
    };
    // ACT
    const layout = consoleLayout({ width, flip: true });
    // ASSERT
    expect({ seat: layout.seat, glass: layout.screens.map(({ glass }) => glass) }).toEqual(expected);
  });

  it('fits exactly as many mugs as it says it holds', () => {
    // ARRANGE
    const width = MIN_CONSOLE_WIDTH;
    const most = maxMugs(width);
    // ACT
    const layout = consoleLayout({ width, mugs: most });
    // ASSERT
    expect(layout.mugs).toHaveLength(most);
  });
});
