import { describe, expect, it } from 'vitest';
import { placeDash } from './dash-placement.pure.ts';

const stage = { left: 100, top: 50, width: 1200, height: 700 };

describe('success cases', () => {
  it('opens to the left of a card with room there, its tail at the card’s middle', () => {
    // ARRANGE
    const card = { left: 900, top: 300, width: 220, height: 92 };
    const [x, y, tail] = [344, 136, 210];
    // ACT
    const p = placeDash({ card, stage, height: 420 });
    // ASSERT
    expect(p.side).toBe('left');
    expect([p.x, p.y, p.tail]).toEqual([x, y, tail]);
  });

  it('opens to the right of a card at the stage’s left edge', () => {
    // ARRANGE
    const card = { left: 120, top: 300, width: 160, height: 256 };
    const x = 296;
    // ACT
    const p = placeDash({ card, stage, height: 420 });
    // ASSERT
    expect(p.side).toBe('right');
    expect(p.x).toBe(x);
  });
});

describe('failure cases', () => {
  it('falls below the card when the stage is too narrow for either side and the card sits at the top', () => {
    // ARRANGE
    const narrow = { left: 0, top: 0, width: 375, height: 700 };
    const card = { left: 100, top: 20, width: 150, height: 90 };
    const [width, y] = [351, 126];
    // ACT
    const p = placeDash({ card, stage: narrow, height: 400 });
    // ASSERT
    expect(p.side).toBe('below');
    expect([p.width, p.y]).toEqual([width, y]);
  });
});

describe('edge cases', () => {
  it('keeps a tall popover 8 px inside the stage', () => {
    // ARRANGE
    const card = { left: 900, top: 680, width: 220, height: 60 };
    const y = 50 + 700 - 600 - 8;
    // ACT
    const p = placeDash({ card, stage, height: 600 });
    // ASSERT
    expect(p.y).toBe(y);
  });

  it('keeps the popover inside the window, which shows only part of a tall stage', () => {
    // ARRANGE
    const tall = { left: 100, top: -200, width: 900, height: 1400 };
    const view = { left: 0, top: 0, width: 1440, height: 900 };
    const card = { left: 600, top: 100, width: 160, height: 90 };
    const y = 900 - 750 - 8;
    // ACT
    const p = placeDash({ card, stage: tall, height: 750, view });
    // ASSERT
    expect(p.y).toBe(y);
  });
});
