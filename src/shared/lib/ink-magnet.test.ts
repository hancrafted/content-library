import { describe, expect, it } from 'vitest';
import { inkMagnet } from './ink-magnet.pure';

const BUTTON = { width: 160, height: 48 };
const REACH = 200;

describe('success cases', () => {
  it('stretches the droplets out of the bottom edge toward a pointer below the button', () => {
    // ARRANGE
    const below = { x: 80, y: 148 };
    const column = [80, 80, 80, 80];
    const stretchedDown = [48, 64.8, 76.8, 92];
    // ACT
    const { droplets } = inkMagnet(BUTTON, below, REACH);
    const xs = droplets.map((drop) => drop.x);
    const ys = droplets.map((drop) => drop.y);
    // ASSERT
    expect(xs).toEqual(column);
    expect(ys).toEqual(stretchedDown);
  });
  it('stretches the droplets sideways toward a pointer to the right', () => {
    // ARRANGE
    const right = { x: 260, y: 24 };
    const row = [24, 24, 24, 24];
    const stretchedRight = [160, 176.8, 188.8, 204];
    // ACT
    const { droplets } = inkMagnet(BUTTON, right, REACH);
    const xs = droplets.map((drop) => drop.x);
    const ys = droplets.map((drop) => drop.y);
    // ASSERT
    expect(ys).toEqual(row);
    expect(xs).toEqual(stretchedRight);
  });
  it('starts filling from the edge nearest a close pointer', () => {
    // ARRANGE
    const close = { x: 80, y: 68 };
    const expectedFill = { x: 80, y: 48, r: 38 };
    // ACT
    const { fill } = inkMagnet(BUTTON, close, REACH);
    // ASSERT
    expect(fill).toEqual(expectedFill);
  });
  it('floods the whole button from the pointer once it is over it', () => {
    // ARRANGE
    const inside = { x: 40, y: 20 };
    const expectedFill = { x: 40, y: 20, r: 123.22 };
    // ACT
    const { fill, droplets, strength } = inkMagnet(BUTTON, inside, REACH);
    // ASSERT
    expect(fill).toEqual(expectedFill);
    expect(droplets).toEqual([]);
    expect(strength).toBe(1);
  });
});

describe('failure cases', () => {
  it('rejects a reach that is not positive', () => {
    // ARRANGE
    const point = { x: 80, y: 148 };
    const message = 'Reach must be a positive distance.';
    // ACT
    const attract = () => inkMagnet(BUTTON, point, 0);
    // ASSERT
    expect(attract).toThrow(message);
  });
  it('rejects a button without an area', () => {
    // ARRANGE
    const flat = { width: 160, height: 0 };
    const point = { x: 80, y: 148 };
    const message = 'Button must have a positive width and height.';
    // ACT
    const attract = () => inkMagnet(flat, point, REACH);
    // ASSERT
    expect(attract).toThrow(message);
  });
});

describe('edge cases', () => {
  it('leaves the button untouched beyond reach', () => {
    // ARRANGE
    const far = { x: 80, y: 300 };
    const untouched = { strength: 0, fill: { x: 80, y: 48, r: 0 }, droplets: [] };
    // ACT
    const field = inkMagnet(BUTTON, far, REACH);
    // ASSERT
    expect(field).toEqual(untouched);
  });
  it('never stretches a droplet past the pointer', () => {
    // ARRANGE
    const almostTouching = { x: 80, y: 58 };
    // ACT
    const { droplets } = inkMagnet(BUTTON, almostTouching, REACH);
    const furthest = Math.max(...droplets.map((drop) => drop.y));
    // ASSERT
    expect(furthest).toBeLessThan(almostTouching.y);
  });
});
