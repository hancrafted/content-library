import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { ResolvedSlideTransition } from '../slide-master/slide-presentation';
import { SlideTransition } from './slide-transition';

/*
 * The outgoing Slide's trailing edge as the server renders it (docs/features/slide-transitions.md). The Iceberg
 * style's `bubbles` edge is a filter-free wave front painted in the incoming Slide's surface, with faceted bubbles
 * rising through it; every other effect keeps its filtered ink.
 */

const edge = (effect: ResolvedSlideTransition['declaration']['effect']): ResolvedSlideTransition => ({
  id: `intro->${effect}`,
  outgoing: 'intro',
  incoming: 'section-two',
  declaration: { effect },
  targetSurface: 'var(--zone-sunlit)',
});

const render = (effect: ResolvedSlideTransition['declaration']['effect']) =>
  load(renderToStaticMarkup(createElement(SlideTransition, { edge: edge(effect) })));

describe('success cases', () => {
  it('draws the bubbles edge as a front and back crest over the incoming surface, with forty faceted bubbles', () => {
    // ARRANGE
    const expected = {
      waveFront: 1,
      crests: ['back', 'front'],
      bubbles: 40,
      target: '--slide-transition-target-surface:var(--zone-sunlit)',
    };
    // ACT
    const $ = render('bubbles');
    const seen = {
      waveFront: $('[data-ink-scale][data-wave-front]').length,
      crests: $('[data-wave-crest]')
        .toArray()
        .map((crest) => $(crest).attr('data-wave-crest')),
      bubbles: $('[data-bubble-rise] > [data-poly-bubble]').length,
      target: $('[data-transition-edge] > div').attr('style'),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('draws the bubbles edge with no SVG filter and no filter reference', () => {
    // ARRANGE
    const expected = { filters: 0, filtered: [] };
    // ACT
    const $ = render('bubbles');
    const seen = {
      filters: $('filter').length,
      filtered: $('[style*="filter"]')
        .toArray()
        .map((node) => $(node).attr('style')),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('keeps the filtered ink and no bubbles for every other effect', () => {
    // ARRANGE
    const expected = { filters: 1, waveFront: 0, bubbles: 0 };
    // ACT
    const $ = render('wave');
    const seen = {
      filters: $('filter').length,
      waveFront: $('[data-wave-front]').length,
      bubbles: $('[data-poly-bubble]').length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
