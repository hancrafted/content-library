import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { POLY_BUBBLE_MOTIONS, POLY_BUBBLE_TOKENS, PolyBubble, type PolyBubbleProps } from './poly-bubble';

/*
 * `PolyBubble`'s frozen interface (decisions 13 and 16 of the Iceberg feedback-2 grill): a redraw may change its
 * drawing, never its anchor box, its `data-motion` names, its tokens or its hook. These tests stay green across it.
 */

const render = (props: PolyBubbleProps = {}) => load(renderToStaticMarkup(createElement(PolyBubble, props)))('svg');

describe('success cases', () => {
  it('draws into a square anchor box centred on the origin, marked for hosts and hidden from readers', () => {
    // ARRANGE
    const expected = { viewBox: '-10 -10 20 20', hook: 'true', hidden: 'true' };
    // ACT
    const bubble = render();
    const seen = {
      viewBox: bubble.attr('viewBox'),
      hook: bubble.attr('data-poly-bubble'),
      hidden: bubble.attr('aria-hidden'),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('writes the motion its host names, from a closed set', () => {
    // ARRANGE
    const expected = ['ambient', 'progress'];
    // ACT
    const seen = POLY_BUBBLE_MOTIONS.map((motion) => render({ motion }).attr('data-motion'));
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('places itself inside an SVG host by its anchor box', () => {
    // ARRANGE
    const expected = { x: '4', y: '-6', width: '12', height: '12' };
    // ACT
    const bubble = render({ x: 4, y: -6, size: 12 });
    const seen = {
      x: bubble.attr('x'),
      y: bubble.attr('y'),
      width: bubble.attr('width'),
      height: bubble.attr('height'),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('names no motion when its host names none', () => {
    // ARRANGE
    const expected = undefined;
    // ACT
    const motion = render().attr('data-motion');
    // ASSERT
    expect(motion).toBe(expected);
  });
});

describe('edge cases', () => {
  it('mixes its colours from the tint its host sets and two global tokens', () => {
    // ARRANGE
    const expected = ['--poly-bubble-tint', '--on-brand-accent', '--foreground'];
    // ACT
    const tokens = [...POLY_BUBBLE_TOKENS];
    // ASSERT
    expect(tokens).toEqual(expected);
  });
});
