import { describe, expect, it } from 'vitest';
import { svgPen } from './svg-pen';

const ALPHA = 0.4;
const LINE_WIDTH = 2;
const BOX = { x: 0, y: 0, w: 10, h: 4, radius: 1 };
const FROM = [1, 2] as const;
const TO = [5, 6] as const;

describe('success cases', () => {
  it('records a stroked line with the alpha and width it was drawn at', () => {
    // ARRANGE
    const { pen, shapes } = svgPen();
    // ACT
    pen.globalAlpha = ALPHA;
    pen.lineWidth = LINE_WIDTH;
    pen.beginPath();
    pen.moveTo(...FROM);
    pen.lineTo(...TO);
    pen.stroke();
    // ASSERT
    expect(shapes).toEqual([{ d: 'M1 2L5 6', alpha: ALPHA, width: LINE_WIDTH, filled: false, blur: undefined }]);
  });

  it('records a filled rounded rectangle as a closed path', () => {
    // ARRANGE
    const { pen, shapes } = svgPen();
    // ACT
    pen.beginPath();
    pen.roundRect(BOX.x, BOX.y, BOX.w, BOX.h, BOX.radius);
    pen.fill();
    // ASSERT
    expect([shapes[0]?.filled, shapes[0]?.d.endsWith('Z')]).toEqual([true, true]);
  });
});

describe('failure cases', () => {
  it('records nothing until a path is stroked or filled', () => {
    // ARRANGE
    const { pen, shapes } = svgPen();
    // ACT
    pen.beginPath();
    pen.moveTo(...FROM);
    // ASSERT
    expect(shapes).toHaveLength(0);
  });
});

describe('edge cases', () => {
  it('keeps a blur filter and drops the default one', () => {
    // ARRANGE
    const { pen, shapes } = svgPen();
    const blur = 'blur(2px)';
    // ACT
    pen.filter = blur;
    pen.stroke();
    pen.filter = 'none';
    pen.stroke();
    // ASSERT
    expect(shapes.map((shape) => shape.blur)).toEqual([blur, undefined]);
  });
});
