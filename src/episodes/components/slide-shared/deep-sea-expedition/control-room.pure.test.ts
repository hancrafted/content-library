import { describe, expect, it } from 'vitest';
import { ROOM, roomFacets, windowAt } from './control-room.pure';

/*
 * The control room's geometry: the faceted wall and floor the comic panels draw, at any room size, and where its
 * window hangs. The 300-unit room is the drawing the Slides copied before it was promoted.
 */

describe('success cases', () => {
  it('draws the comic panels’ 300-unit room as it was drawn: six wall planes, the floor, its lit patch', () => {
    // ARRANGE
    const expected = [
      { tone: 'lit', points: '0,0 130,0 70,84 0,64' },
      { tone: 'mid', points: '130,0 300,0 300,56 196,96' },
      { tone: 'lit', points: '130,0 196,96 70,84' },
      { tone: 'mid', points: '0,64 70,84 36,158 0,158' },
      { tone: 'lit', points: '70,84 196,96 160,158 36,158' },
      { tone: 'shade', points: '196,96 300,56 300,158 160,158' },
      { tone: 'floor', points: '0,158 300,158 300,180 0,180' },
      { tone: 'floor-lit', points: '0,158 140,158 96,180 0,180' },
    ];
    // ACT
    const facets = roomFacets(ROOM);
    // ASSERT
    expect(facets).toEqual(expected);
  });

  it('hangs the window in the wall’s top right corner', () => {
    // ARRANGE
    const expected = { x: 196, y: 10 };
    // ACT
    const at = windowAt(ROOM);
    // ASSERT
    expect(at).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a room too narrow to hang its window in', () => {
    // ARRANGE
    const narrow = { width: 100, height: 180, floor: 158 };
    const expected = /too narrow/;
    // ACT
    const hang = () => windowAt(narrow);
    // ASSERT
    expect(hang).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('keeps the planes’ proportions in a narrower, taller room: the wall stretches to its floor line', () => {
    // ARRANGE
    const size = { width: 240, height: 200, floor: 186 };
    const expected = { first: '0,0 104,0 56,98.89 0,75.34', floor: '0,186 240,186 240,200 0,200' };
    // ACT
    const facets = roomFacets(size);
    const seen = { first: facets[0]?.points, floor: facets.find(({ tone }) => tone === 'floor')?.points };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
