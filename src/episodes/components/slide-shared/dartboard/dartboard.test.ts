import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Dartboard, type DartboardProps } from './dartboard';

/*
 * The dartboard, the Hero motif of "From shared understanding to shared context": evenly spaced rings around a bull in
 * `primary`. The Title slide, every section slide and the precision and accuracy Slides draw it.
 */

const board = (props: DartboardProps) => {
  const $ = load(renderToStaticMarkup(createElement('svg', null, createElement(Dartboard, props))));
  const rings = $('[data-ring]')
    .toArray()
    .map((ring) => ({ r: $(ring).attr('r'), className: $(ring).attr('class') }));
  return { rings, bull: $('[data-bull]').attr('r'), bullClass: $('[data-bull]').attr('class') };
};

describe('success cases', () => {
  it('spaces the rings evenly from the outer edge in, the bull in primary on top', () => {
    // ARRANGE
    const expected = { radii: ['150', '112.5', '75', '37.5'], bull: '14', bullClass: 'fill-primary' };
    // ACT
    const { rings, bull, bullClass } = board({ cx: 364, cy: 220, r: 150, rings: 4, bull: 14 });
    // ASSERT
    expect({ radii: rings.map(({ r }) => r), bull, bullClass }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a board without a ring, which would draw the bull alone', () => {
    // ARRANGE
    const props = { cx: 0, cy: 0, r: 10, rings: 0, bull: 2 };
    const expected = /at least one ring/;
    // ACT
    const draw = () => board(props);
    // ASSERT
    expect(draw).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('alternates card and muted fills from the outer ring, the hero tone ringing the outer edge in foreground', () => {
    // ARRANGE
    const expected = [
      'fill-card stroke-foreground',
      'fill-muted stroke-muted-foreground',
      'fill-card stroke-muted-foreground',
    ];
    // ACT
    const { rings } = board({ cx: 0, cy: 0, r: 30, rings: 3, bull: 4, tone: 'hero' });
    // ASSERT
    expect(rings.map(({ className }) => className)).toEqual(expected);
  });

  it('draws the quiet tone, a section slide echo, from a muted outer ring on border strokes', () => {
    // ARRANGE
    const expected = ['fill-muted stroke-border', 'fill-card stroke-border'];
    // ACT
    const { rings } = board({ cx: 0, cy: 0, r: 30, rings: 2, bull: 4, tone: 'quiet' });
    // ASSERT
    expect(rings.map(({ className }) => className)).toEqual(expected);
  });
});
