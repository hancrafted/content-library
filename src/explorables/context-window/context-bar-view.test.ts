import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ContextBarView, type ContextBarViewProps } from './context-bar-view';

const BLOCKS: ContextBarViewProps['blocks'] = [
  { key: 'a', start: 0, size: 50, colour: '--cs-s-start', faded: false, ring: false },
  { key: 'b', start: 50, size: 25, colour: '--cs-s-read', faded: true, ring: false },
  { key: 'c', start: 75, size: 5, colour: '--primary', faded: false, ring: true },
];
const render = (props: Partial<ContextBarViewProps> = {}) =>
  load(
    renderToStaticMarkup(
      createElement(ContextBarView, {
        orientation: 'horizontal',
        total: 100,
        blocks: BLOCKS,
        label: 'The window',
        ...props,
      }),
    ),
  );

describe('success cases', () => {
  it('draws each block at its share of the scale, with no button, handler or tab stop', () => {
    // ARRANGE
    const expected = ['--s:0;--z:50', '--s:50;--z:25', '--s:75;--z:5'];
    // ACT
    const $ = render();
    const places = $('[style]')
      .map((_, el) =>
        ($(el).attr('style') ?? '')
          .replace(/--k:[^;]*;?/, '')
          .replace(/ /g, '')
          .replace(/;$/, ''),
      )
      .get();
    // ASSERT
    expect(places).toEqual(expected);
    expect($('button, [tabindex], [onclick]')).toHaveLength(0);
  });

  it('marks the orientation, the faded block and the ringed one, and names the bar', () => {
    // ARRANGE
    const expected = { orientation: 'horizontal', faded: 1, ring: 1, label: 'The window', role: 'img' };
    // ACT
    const $ = render();
    const bar = $('[data-orientation]');
    // ASSERT
    expect({
      orientation: bar.attr('data-orientation'),
      faded: $('[data-faded]').length,
      ring: $('[data-ring]').length,
      label: bar.attr('aria-label'),
      role: bar.attr('role'),
    }).toEqual(expected);
  });

  it('draws the buffer and a crossed line when given', () => {
    // ARRANGE
    const props = { buffer: 8, lines: [{ id: 'matt', at: 0.4, crossed: true }] };
    const expected = { hidden: 2, crossed: 1 };
    // ACT
    const $ = render(props);
    // ASSERT
    expect($('[aria-hidden="true"]')).toHaveLength(expected.hidden);
    expect($('[data-crossed]')).toHaveLength(expected.crossed);
  });

  it("splits a labelled bar into parts: a line between them, each part's aside beside exactly its rows", () => {
    // ARRANGE
    const props = {
      orientation: 'vertical' as const,
      labels: ['A', 'B', 'C'],
      free: 'Free',
      parts: [
        { rows: 2, aside: 'Static' },
        { rows: 1, aside: 'Dynamic' },
      ],
    };
    const expected = {
      rows: ['A', 'B', 'line', 'C', 'Free'],
      asides: [
        { text: 'Static', rows: '--from:1;--to:3' },
        { text: 'Dynamic', rows: '--from:4;--to:5' },
      ],
    };
    // ACT
    const $ = render(props);
    const rows = $('[role="list"]')
      .children()
      .map((_, el) => ($(el).is('[data-split]') ? 'line' : $(el).text()))
      .get();
    const asides = $('[data-aside]')
      .map((_, el) => ({ text: $(el).text(), rows: ($(el).attr('style') ?? '').replace(/ /g, '') }))
      .get();
    // ASSERT
    expect({ rows, asides }).toEqual(expected);
  });

  it('sizes each row of a labelled bar by its share of the window, the line by its own height', () => {
    // ARRANGE
    const props = { orientation: 'vertical' as const, labels: ['A', 'B', 'C'], parts: [{ rows: 1 }, { rows: 2 }] };
    const expected =
      'minmax(min-content, 0.5fr) auto minmax(min-content, 0.25fr) minmax(min-content, 0.05fr) minmax(min-content, 0.2fr)';
    // ACT
    const $ = render(props);
    const tracks = $('[data-listed]').css('grid-template-rows');
    // ASSERT
    expect(tracks).toBe(expected);
  });
});

describe('failure cases', () => {
  it('draws no hook, handler or tab stop that a server render could not serve', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const $ = render({ blocks: [] });
    // ASSERT
    expect($('button, a, input, [tabindex]')).toHaveLength(expected);
  });

  it('refuses parts that do not hold every block of the bar', () => {
    // ARRANGE
    const props = { orientation: 'vertical' as const, labels: ['A', 'B', 'C'], parts: [{ rows: 2 }] };
    const expected = 'context bar: its parts hold 2 rows, but it has 3 blocks';
    // ACT
    const draw = () => render(props);
    // ASSERT
    expect(draw).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('draws no buffer without one', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const $ = render({ buffer: 0 });
    // ASSERT
    expect($('[aria-hidden="true"]')).toHaveLength(expected);
  });

  it('draws one part with no line and no aside when a labelled bar is not split', () => {
    // ARRANGE
    const expected = { lines: 0, asides: 0, rows: 4 };
    // ACT
    const $ = render({ orientation: 'vertical', labels: ['A', 'B', 'C'], free: 'Free' });
    // ASSERT
    expect({
      lines: $('[data-split]').length,
      asides: $('[data-aside]').length,
      rows: $('[role="listitem"]').length,
    }).toEqual(expected);
  });
});
