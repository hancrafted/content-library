import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BubbleRise } from './bubble-rise';

const render = () => load(renderToStaticMarkup(createElement(BubbleRise)));

describe('success cases', () => {
  it('draws forty faceted bubbles inside one field', () => {
    // ARRANGE
    const expected = { fields: 1, bubbles: 40 };
    // ACT
    const $ = render();
    const seen = {
      fields: $('[data-bubble-rise]').length,
      bubbles: $('[data-bubble-rise] > [data-poly-bubble]').length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('names no motion on a bubble, since the edge clock, not an animation, moves it', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const $ = render();
    const marked = $('[data-poly-bubble][data-motion]')
      .toArray()
      .map((bubble) => $(bubble).attr('data-motion') ?? '');
    // ASSERT
    expect(marked).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('mixes bubbles of six, seven and eight sides', () => {
    // ARRANGE
    const expected = [6, 7, 8];
    // ACT
    const $ = render();
    const sides = [
      ...new Set(
        $('[data-poly-bubble] > polygon:first-child')
          .toArray()
          .map((outline) => ($(outline).attr('points') ?? '').split(' ').length),
      ),
    ].sort((a, b) => a - b);
    // ASSERT
    expect(sides).toEqual(expected);
  });
});
