import { describe, expect, it } from 'vitest';
import { phaseArc, polarPoint, popOffset, RING, tickMarks } from './radial-cycle.pure';

const SIX = 6;

describe('success cases', () => {
  it('measures angles clockwise from 12 o’clock', () => {
    // ARRANGE
    const radius = 100;
    const expected = { x: RING.centre + radius, y: RING.centre };
    // ACT
    const point = polarPoint(90, radius);
    // ASSERT
    expect(point).toEqual(expected);
  });

  it('starts the first of six phases just after 12 o’clock and sweeps one sixth of the face', () => {
    // ARRANGE
    const halfGap = RING.gapDeg / 2;
    const expected = { startDeg: halfGap, endDeg: 60 - halfGap, midDeg: 30 };
    // ACT
    const arc = phaseArc(0, SIX);
    // ASSERT
    expect(arc).toMatchObject(expected);
  });

  it('draws a phase as a clockwise arc on the ring from its start to its end', () => {
    // ARRANGE
    const from = polarPoint(RING.gapDeg / 2, RING.radius);
    const to = polarPoint(60 - RING.gapDeg / 2, RING.radius);
    const expected = `M ${from.x} ${from.y} A ${RING.radius} ${RING.radius} 0 0 1 ${to.x} ${to.y}`;
    // ACT
    const { path } = phaseArc(0, SIX);
    // ASSERT
    expect(path).toBe(expected);
  });

  it('turns a top-half label to the ring’s tangent at its middle, so it reads left to right along the arc', () => {
    // ARRANGE
    const expected = 30;
    // ACT
    const { labelTurnDeg } = phaseArc(0, SIX);
    // ASSERT
    expect(labelTurnDeg).toBe(expected);
  });

  it('pops a phase outward along its middle: the 3 o’clock phase moves straight right', () => {
    // ARRANGE
    const distance = 10;
    const halves = 2;
    const expected = { x: distance, y: 0 };
    // ACT
    const offset = popOffset(0, halves, distance);
    // ASSERT
    expect(offset).toEqual(expected);
  });

  it('marks the twelve months with ticks just outside the ring, the first at 12 o’clock', () => {
    // ARRANGE
    const months = 12;
    const top = RING.centre - RING.radius - RING.stroke / 2;
    // ACT
    const ticks = tickMarks(months);
    // ASSERT
    expect(ticks).toHaveLength(months);
    expect(ticks[0]).toMatchObject({ x1: RING.centre, x2: RING.centre });
    expect(ticks[0].y1).toBeLessThan(top);
  });
});

describe('failure cases', () => {
  it('refuses a phase past the end of the cycle', () => {
    // ARRANGE
    const past = SIX;
    // ACT
    const arc = () => phaseArc(past, SIX);
    // ASSERT
    expect(arc).toThrow(String(past));
  });

  it('refuses a cycle with no phases instead of dividing the face by zero', () => {
    // ARRANGE
    const empty = 0;
    // ACT
    const arc = () => phaseArc(0, empty);
    // ASSERT
    expect(arc).toThrow(String(empty));
  });

  it('refuses a fractional phase', () => {
    // ARRANGE
    const fraction = 1.5;
    // ACT
    const offset = () => popOffset(fraction, SIX, 10);
    // ASSERT
    expect(offset).toThrow(String(fraction));
  });
});

describe('edge cases', () => {
  it('flips a bottom-half label half a turn so it reads left to right instead of upside down', () => {
    // ARRANGE
    const bottom = 3;
    const expected = 30;
    // ACT
    const { labelTurnDeg } = phaseArc(bottom, SIX);
    // ASSERT
    expect(labelTurnDeg).toBe(expected);
  });

  it('places a phase’s label on the ring at its middle', () => {
    // ARRANGE
    const expected = polarPoint(30, RING.radius);
    // ACT
    const { labelAt } = phaseArc(0, SIX);
    // ASSERT
    expect(labelAt).toEqual(expected);
  });

  it('sets the large-arc flag when one phase sweeps more than half the face', () => {
    // ARRANGE
    const lonePhase = 1;
    const largeArc = ' 0 1 1 ';
    // ACT
    const { path } = phaseArc(0, lonePhase);
    // ASSERT
    expect(path).toContain(largeArc);
  });

  it('pops the 9 o’clock-centred phase straight left, never down the SVG’s flipped y axis', () => {
    // ARRANGE
    const distance = 8;
    const halves = 2;
    const expected = { x: -distance, y: 0 };
    // ACT
    const offset = popOffset(1, halves, distance);
    // ASSERT
    expect(offset).toEqual(expected);
  });
});
