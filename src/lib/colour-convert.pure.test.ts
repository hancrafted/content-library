import { describe, expect, it } from 'vitest';
import { formatLike, toPickerHex } from './colour-convert.pure';

describe('success cases', () => {
  it.each([
    ['oklch(1 0 0)', '#ffffff'],
    ['oklch(0 0 0)', '#000000'],
    ['oklch(0.985 0 0)', '#fafafa'],
    ['oklch(0.145 0 0)', '#0a0a0a'],
    ['#dd5f27', '#dd5f27'],
    ['#fff', '#ffffff'],
    ['hsl(0 0% 100%)', '#ffffff'],
    ['hsl(210 20% 98%)', '#f9fafb'],
    ['rgb(250, 250, 250)', '#fafafa'],
    ['rgba(255, 255, 255, 0.1)', '#ffffff1a'],
  ])('reads %s as the picker hex %s', (token, expected) => {
    // ARRANGE
    const value = token;
    // ACT
    const hex = toPickerHex(value);
    // ASSERT
    expect(hex).toBe(expected);
  });

  it('writes a picked colour as oklch rounded to three places', () => {
    // ARRANGE
    const original = 'oklch(0.5 0.1 200)';
    const expected = 'oklch(0.628 0.258 29.2)';
    // ACT
    const written = formatLike(original, '#ff0000');
    // ASSERT
    expect(written).toBe(expected);
  });

  it('writes achromatic colours with chroma and hue 0', () => {
    // ARRANGE
    const expected = 'oklch(0.985 0 0)';
    // ACT
    const written = formatLike('oklch(0.5 0.1 200)', '#fafafa');
    // ASSERT
    expect(written).toBe(expected);
  });

  it('keeps a hex token in hex, lower-cased', () => {
    // ARRANGE
    const expected = '#f08a4b';
    // ACT
    const written = formatLike('#dd5f27', '#F08A4B');
    // ASSERT
    expect(written).toBe(expected);
  });

  it('writes an hsl token as oklch', () => {
    // ARRANGE
    const expected = 'oklch(1 0 0)';
    // ACT
    const written = formatLike('hsl(210 20% 98%)', '#ffffff');
    // ASSERT
    expect(written).toBe(expected);
  });
});

describe('failure cases', () => {
  it('is null for a length it cannot read', () => {
    // ARRANGE
    const value = '0.625rem';
    // ACT
    const hex = toPickerHex(value);
    // ASSERT
    expect(hex).toBeNull();
  });

  it('is null for color-mix, which needs the page to resolve', () => {
    // ARRANGE
    const value = 'color-mix(in oklab, red, blue)';
    // ACT
    const hex = toPickerHex(value);
    // ASSERT
    expect(hex).toBeNull();
  });

  it('leaves the token alone when the picked value is not a hex', () => {
    // ARRANGE
    const original = 'oklch(0.5 0.1 200)';
    // ACT
    const written = formatLike(original, 'not a colour');
    // ASSERT
    expect(written).toBe(original);
  });
});

describe('edge cases', () => {
  it('keeps alpha as two trailing hex digits', () => {
    // ARRANGE
    const expected = '#ffffff1a';
    // ACT
    const hex = toPickerHex('oklch(1 0 0 / 10%)');
    // ASSERT
    expect(hex).toBe(expected);
  });

  it('carries alpha back as a percentage', () => {
    // ARRANGE
    const expected = 'oklch(1 0 0 / 50%)';
    // ACT
    const written = formatLike('oklch(1 0 0 / 15%)', '#ffffff80');
    // ASSERT
    expect(written).toBe(expected);
  });

  it('reads the short four-digit hex with alpha', () => {
    // ARRANGE
    const expected = '#ffffff88';
    // ACT
    const hex = toPickerHex('#fff8');
    // ASSERT
    expect(hex).toBe(expected);
  });
});
