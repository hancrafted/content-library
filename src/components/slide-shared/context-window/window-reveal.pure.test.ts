import { describe, expect, it } from 'vitest';
import { revealTop } from './window-reveal.pure';

const box = { top: 100, height: 300, scrollTop: 50 };
const bubble = { height: 40 };

describe('success cases', () => {
  it('centres a bubble that is below the view', () => {
    // ARRANGE
    const offset = 400;
    const expected = box.scrollTop + offset - (box.height - bubble.height) / 2;
    // ACT
    const top = revealTop(box, { top: box.top + offset, ...bubble });
    // ASSERT
    expect(top).toBe(expected);
  });

  it('scrolls up to a bubble above the view', () => {
    // ARRANGE
    const scrolled = { ...box, scrollTop: 500 };
    const offset = -80;
    const expected = scrolled.scrollTop + offset - (box.height - bubble.height) / 2;
    // ACT
    const top = revealTop(scrolled, { top: box.top + offset, ...bubble });
    // ASSERT
    expect(top).toBe(expected);
  });
});

describe('failure cases', () => {
  it('never scrolls above the start', () => {
    // ARRANGE
    const atStart = { ...box, scrollTop: 0 };
    // ACT
    const top = revealTop(atStart, { top: box.top - 10, height: 20 });
    // ASSERT
    expect(top).toBe(0);
  });
});

describe('edge cases', () => {
  it('stays put when the bubble is fully in view', () => {
    // ARRANGE
    const expected = box.scrollTop;
    // ACT
    const top = revealTop(box, { top: box.top + 100, ...bubble });
    // ASSERT
    expect(top).toBe(expected);
  });

  it('aligns the top of a bubble taller than the view', () => {
    // ARRANGE
    const offset = 400;
    const pad = 24;
    const expected = box.scrollTop + offset - pad;
    // ACT
    const top = revealTop(box, { top: box.top + offset, height: box.height * 2 });
    // ASSERT
    expect(top).toBe(expected);
  });
});
