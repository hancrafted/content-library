import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Darts, type DartsProps } from './darts';

/*
 * The darts thrown at the dartboard: one mark per point, a dot by default or a document page, coloured by what the
 * throw means. The Title slide, the section slides and the precision and accuracy Slides draw them.
 */

const marks = (props: DartsProps): Record<string, string>[] => {
  const $ = load(renderToStaticMarkup(createElement('svg', null, createElement(Darts, props))));
  return $('svg')
    .children()
    .toArray()
    .map((mark) => ({ tag: mark.tagName, ...$(mark).attr() }));
};

describe('success cases', () => {
  it('draws one dot per point in the tone it is given', () => {
    // ARRANGE
    const points = [
      { x: 160, y: 40 },
      { x: 238, y: 50 },
    ];
    const expected = [
      { tag: 'circle', 'data-dart': 'true', cx: '160', cy: '40', r: '5', class: 'fill-(--warning)' },
      { tag: 'circle', 'data-dart': 'true', cx: '238', cy: '50', r: '5', class: 'fill-(--warning)' },
    ];
    // ACT
    const actual = marks({ points, tone: 'warning', r: 5 });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws a document dart as a page with a folded corner from its top-left point, edged in card', () => {
    // ARRANGE
    const expected = [
      {
        tag: 'path',
        'data-hit': 'true',
        d: 'M346 196 h14 l6 6 v18 h-20 z',
        class: 'fill-primary stroke-card',
        'stroke-width': '2',
      },
    ];
    // ACT
    const actual = marks({ points: [{ x: 346, y: 196 }], tone: 'primary', shape: 'document', edge: true });
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('draws nothing for no points, so an empty round leaves no stray mark', () => {
    // ARRANGE
    const expected: unknown[] = [];
    // ACT
    const actual = marks({ points: [], tone: 'ai', r: 4 });
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it.each([
    ['ai', true, 'fill-ai stroke-card'],
    ['dulled', false, 'fill-muted-foreground'],
    ['foreground', false, 'fill-foreground'],
  ] as const)('colours a %s dot, edged %s, as %s', (tone, edge, expected) => {
    // ARRANGE
    const points = [{ x: 0, y: 0 }];
    // ACT
    const [dot] = marks({ points, tone, edge, r: 3.5 });
    // ASSERT
    expect(dot?.class).toBe(expected);
  });
});
