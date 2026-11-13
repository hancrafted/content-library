import { describe, expect, it } from 'vitest';
import { deckY, SHIP_TONES, shipAnchors, shipLayers } from './ship.pure';

/*
 * The research ship's geometry: facets in three paint layers and the anchors where a Scene places the crew and the
 * robot. (0, 0) is the waterline amidships; the bow points right unless flipped.
 */

describe('success cases', () => {
  it('stands the bridge crew on the window sill, inside the window opening', () => {
    // ARRANGE
    const { bridge, window } = shipAnchors();
    const sill = window.y + window.height;
    // ACT
    const places = [bridge.captain, bridge.pilot].map(({ x, y }) => ({
      inside: x > window.x && x < window.x + window.width,
      y,
    }));
    // ASSERT
    expect(places).toEqual([
      { inside: true, y: sill },
      { inside: true, y: sill },
    ]);
  });

  it('stands the deck crew and the robot on the deck line, the robot aft of amidships under the A-frame', () => {
    // ARRANGE
    const { deck, robot, aFrameTip } = shipAnchors();
    const expected = [deckY(deck.aft.x), deckY(deck.fore.x), deckY(robot.x)];
    // ACT
    const actual = [deck.aft.y, deck.fore.y, robot.y];
    // ASSERT
    expect(actual).toEqual(expected);
    expect(robot.x).toBeLessThan(0);
    expect(aFrameTip.x).toBeLessThan(robot.x);
  });

  it('draws the hull before the bridge crew and the rail after the deck crew', () => {
    // ARRANGE
    const minimumFacets = 3;
    // ACT
    const { hull, superstructure, rail } = shipLayers();
    // ASSERT
    expect(hull.length).toBeGreaterThan(minimumFacets);
    expect(superstructure.length).toBeGreaterThan(minimumFacets);
    expect(rail.length).toBeGreaterThan(minimumFacets);
  });
});

describe('failure cases', () => {
  it('refuses a deck height off the deck, where a figure would float over the water', () => {
    // ARRANGE
    const pastTheBow = 400;
    const expected = /no deck/;
    // ACT
    const stand = () => deckY(pastTheBow);
    // ASSERT
    expect(stand).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('mirrors every anchor about amidships when flipped, keeping its height', () => {
    // ARRANGE
    const plain = shipAnchors();
    const mirrored = [plain.bridge.captain, plain.deck.fore, plain.robot, plain.aFrameTip].map(({ x, y }) => ({
      x: -x,
      y,
    }));
    // ACT
    const flipped = shipAnchors(true);
    // ASSERT
    expect([flipped.bridge.captain, flipped.deck.fore, flipped.robot, flipped.aFrameTip]).toEqual(mirrored);
  });

  it('keeps the window box the same size when flipped, its left edge mirrored from the right', () => {
    // ARRANGE
    const { window } = shipAnchors();
    const expected = { ...window, x: -(window.x + window.width) };
    // ACT
    const actual = shipAnchors(true).window;
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('mirrors every facet point when flipped, and paints only in the ship tones', () => {
    // ARRANGE
    const plain = shipLayers().hull.map(({ points }) => points.map(([x, y]) => [0 - x, y]));
    // ACT
    const flipped = shipLayers(true);
    const tones = new Set([...flipped.hull, ...flipped.superstructure, ...flipped.rail].map(({ tone }) => tone));
    // ASSERT
    expect(flipped.hull.map(({ points }) => points.map(([x, y]) => [x, y]))).toEqual(plain);
    expect([...tones].every((tone) => SHIP_TONES.includes(tone))).toBe(true);
  });
});
