import { describe, expect, it } from 'vitest';
import { saysBox, saysFit, saysRoom } from './says.pure';

describe('success cases', () => {
  it('turns words up until they draw at their caption size, when the picture draws them smaller', () => {
    // ARRANGE
    const phone = { unitPixels: 0.25, scale: 0.5 };
    const expected = 8;
    // ACT
    const fit = saysFit(phone);
    // ASSERT
    expect(fit).toBe(expected);
  });

  it('leaves a bubble that stays inside its picture free to take its own width', () => {
    // ARRANGE
    const inside = {
      side: 1,
      bubble: { left: 20, right: 200, drawnPerCss: 1 },
      picture: { left: 0, right: 340 },
    } as const;
    // ACT
    const room = saysRoom(inside);
    // ASSERT
    expect(room).toBeUndefined();
  });

  it('leaves words alone that already draw at their caption size or larger', () => {
    // ARRANGE
    const desk = { unitPixels: 1.3, scale: 1 };
    // ACT
    const fit = saysFit(desk);
    // ASSERT
    expect(fit).toBe(1);
  });

  it('measures one short line rising beside the head, on the side the figure faces', () => {
    // ARRANGE
    const words = 'Nice to meet you.';
    const expected = {
      right: { x: 110, y: 55, width: 145.5, height: 31 },
      left: { x: -55.5, y: 55, width: 145.5, height: 31 },
    };
    // ACT
    const seen = {
      right: saysBox({ words, head: { x: 100, y: 100 }, figureScale: 1, scenePixels: 1 }),
      left: saysBox({ words, facing: 'left', head: { x: 100, y: 100 }, figureScale: 1, scenePixels: 1 }),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('wraps at the width a Scene gives and rises by its lift, so two speakers facing each other stack', () => {
    // ARRANGE
    const words = 'Which depth? What goes on the label?';
    const expected = { x: 110, y: -16, width: 153, height: 52 };
    // ACT
    const box = saysBox({ words, head: { x: 100, y: 100 }, figureScale: 1, scenePixels: 1, width: 160, lift: 50 });
    // ASSERT
    expect(box).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('gives a bubble that runs past the picture only the room left between its anchored edge and the picture edge', () => {
    // ARRANGE
    const left = {
      side: -1,
      bubble: { left: -30, right: 190, drawnPerCss: 2 },
      picture: { left: 0, right: 340 },
    } as const;
    const right = {
      side: 1,
      bubble: { left: 200, right: 420, drawnPerCss: 2 },
      picture: { left: 0, right: 340 },
    } as const;
    const expected = { left: 93, right: 68 };
    // ACT
    const seen = { left: saysRoom(left), right: saysRoom(right) };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('refuses to measure a bubble with no words, as the emote draws none', () => {
    // ARRANGE
    const words = '   ';
    const expected = /no words/;
    // ACT
    const measure = () => saysBox({ words, head: { x: 0, y: 0 }, figureScale: 1, scenePixels: 1 });
    // ASSERT
    expect(measure).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('leaves the width alone in a hidden picture, where the bubble draws at no size', () => {
    // ARRANGE
    const hidden = { side: 1, bubble: { left: 0, right: 0, drawnPerCss: 0 }, picture: { left: 0, right: 0 } } as const;
    // ACT
    const room = saysRoom(hidden);
    // ASSERT
    expect(room).toBeUndefined();
  });

  it('grows the box in Scene units on a phone, where the fit turns the words up', () => {
    // ARRANGE
    const words = 'Nice to meet you.';
    const expected = { x: 120, y: -52, width: 582, height: 124 };
    // ACT
    const box = saysBox({ words, head: { x: 100, y: 100 }, figureScale: 2, saysScale: 0.5, scenePixels: 0.25 });
    // ASSERT
    expect(box).toEqual(expected);
  });

  it('rises past the thought cloud when the figure thinks, so the two never overlap', () => {
    // ARRANGE
    const words = 'Hm.';
    const expected = { x: 34, bottom: -6 };
    // ACT
    const box = saysBox({ words, mood: 'thinking', head: { x: 0, y: 0 }, figureScale: 1, scenePixels: 1 });
    // ASSERT
    expect({ x: box.x, bottom: box.y + box.height }).toEqual(expected);
  });

  it('measures nothing in a hidden picture: a zero size leaves the words at their own scale', () => {
    // ARRANGE
    const hidden = { unitPixels: 0, scale: 0.5 };
    // ACT
    const fit = saysFit(hidden);
    // ASSERT
    expect(fit).toBe(1);
  });
});
