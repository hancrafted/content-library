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
});
