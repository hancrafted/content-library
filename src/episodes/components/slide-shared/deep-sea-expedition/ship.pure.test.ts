import { describe, expect, it } from 'vitest';
import { deckY, SHIP_TONES, shipAnchors, shipLayers } from './ship.pure';

/*
 * The research ship's geometry: facets in three paint layers and the anchors where a Scene places the crew and the
 * robot. (0, 0) is the waterline amidships; the bow points right unless flipped. The deck line runs from (-144, -29)
 * at the stern to (150, -37) at the bow, so a deck height at x is -29 - 8 * (x + 144) / 294.
 */

describe('success cases', () => {
  it('stands the bridge crew on the window sill, inside the window opening', () => {
    // ARRANGE
    const expected = {
      window: { x: 0, y: -77, width: 90, height: 18 },
      captain: { x: 45, y: -59 },
      pilot: { x: 74, y: -59 },
    };
    // ACT
    const { bridge, window } = shipAnchors();
    // ASSERT
    expect({ window, captain: bridge.captain, pilot: bridge.pilot }).toEqual(expected);
  });

  it('stands the deck crew and the robot on the deck line, the robot aft of amidships under the A-frame', () => {
    // ARRANGE
    const digits = 3;
    const expected = {
      aft: { x: -50, y: expect.closeTo(-31.558, digits) },
      fore: { x: 132, y: expect.closeTo(-36.51, digits) },
      robot: { x: -110, y: expect.closeTo(-29.925, digits) },
      aFrameTip: { x: -165, y: -99 },
    };
    // ACT
    const { deck, robot, aFrameTip } = shipAnchors();
    // ASSERT
    expect({ aft: deck.aft, fore: deck.fore, robot, aFrameTip }).toEqual(expected);
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
    const digits = 3;
    const expected = [
      { x: -45, y: -59 },
      { x: -132, y: expect.closeTo(-36.51, digits) },
      { x: 110, y: expect.closeTo(-29.925, digits) },
      { x: 165, y: -99 },
    ];
    // ACT
    const flipped = shipAnchors(true);
    // ASSERT
    expect([flipped.bridge.captain, flipped.deck.fore, flipped.robot, flipped.aFrameTip]).toEqual(expected);
  });

  it('keeps the window box the same size when flipped, its left edge mirrored from the right', () => {
    // ARRANGE
    const expected = { x: -90, y: -77, width: 90, height: 18 };
    // ACT
    const actual = shipAnchors(true).window;
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('mirrors every facet point when flipped, and paints only in the ship tones', () => {
    // ARRANGE
    const expected = [
      [144, -26],
      [-150, -34],
      [-178, -40],
      [-160, -22],
      [126, -14],
    ];
    // ACT
    const flipped = shipLayers(true);
    const firstHull = flipped.hull[0].points;
    const tones = [...flipped.hull, ...flipped.superstructure, ...flipped.rail].map(({ tone }) => tone);
    const unknownTones = tones.filter((tone) => !SHIP_TONES.includes(tone));
    // ASSERT
    expect(firstHull).toEqual(expected);
    expect(unknownTones).toEqual([]);
  });
});
