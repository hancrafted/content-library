import { describe, expect, it } from 'vitest';
import { momentOf, paintBeat, paintField, type Pen } from './drift-paint';
import type { Area } from './drift.pure';

const AREA: Area = { x: 100, y: 100, w: 400, h: 500, compact: false };

/** A stand-in pen that counts the strokes and fills it is asked for. */
function recorder() {
  const log = { strokes: 0, fills: 0, alphas: [] as number[] };
  const pen: Pen = {
    globalAlpha: 0,
    lineWidth: 1,
    filter: 'none',
    beginPath: () => undefined,
    roundRect: () => undefined,
    moveTo: () => undefined,
    lineTo: () => undefined,
    stroke() {
      log.strokes++;
      log.alphas.push(pen.globalAlpha);
    },
    fill() {
      log.fills++;
    },
  };
  return { pen, log };
}

describe('success cases', () => {
  it('draws the Disciplines bubble with all four chips at its final tier in the end state', () => {
    // ARRANGE
    const { pen, log } = recorder();
    const moment = momentOf(0, true);
    const chips = 4;
    // ACT
    paintBeat(pen, { story: 'ai-disciplines', area: AREA, progress: moment.progress, strength: moment.strength });
    // ASSERT
    expect(log.fills).toBe(chips);
  });

  it('draws the Human check in the end state and the checkpoint line in the field', () => {
    // ARRANGE
    const beat = recorder();
    const field = recorder();
    const moment = momentOf(0, true);
    const bubbleStrokes = 3;
    // ACT
    paintBeat(beat.pen, {
      story: 'human-in-the-loop',
      area: AREA,
      progress: moment.progress,
      strength: moment.strength,
    });
    paintField(field.pen, { story: 'human-in-the-loop', area: AREA, width: 1440, height: 900, t: moment.t });
    // ASSERT
    expect(beat.log.strokes).toBeGreaterThan(bubbleStrokes);
    expect(field.log.strokes).toBeGreaterThan(0);
  });
});

describe('failure cases', () => {
  it('draws no Context bubble in the end state: it has been forgotten', () => {
    // ARRANGE
    const { pen, log } = recorder();
    const moment = momentOf(0, true);
    // ACT
    paintBeat(pen, { story: 'context-window', area: AREA, progress: moment.progress, strength: moment.strength });
    // ASSERT
    expect(log.strokes).toBe(0);
  });

  it('draws no beat while its strength is zero', () => {
    // ARRANGE
    const { pen, log } = recorder();
    // ACT
    paintBeat(pen, { story: 'human-in-the-loop', area: AREA, progress: 0.5, strength: 0 });
    // ASSERT
    expect(log.strokes).toBe(0);
  });
});

describe('edge cases', () => {
  it('draws the same field for a time and for the same time one loop later', () => {
    // ARRANGE
    const first = recorder();
    const later = recorder();
    const t = 5;
    const loop = 18;
    const digits = 6;
    // ACT
    paintField(first.pen, { story: 'context-window', area: AREA, width: 1440, height: 900, t });
    paintField(later.pen, { story: 'context-window', area: AREA, width: 1440, height: 900, t: t + loop });
    // ASSERT
    expect(later.log.alphas.map((a) => a.toFixed(digits))).toEqual(first.log.alphas.map((a) => a.toFixed(digits)));
  });
});
