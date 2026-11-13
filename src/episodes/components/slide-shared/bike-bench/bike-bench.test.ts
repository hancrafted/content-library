import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BikeBench, type BikeBenchProps } from './bike-bench';

/*
 * The bike assembly bench, the reference drawing of "From shared understanding to shared context": read through its
 * rendered SVG, by the items it marks with `data-bench-item`.
 */

const render = (props: BikeBenchProps) => load(renderToStaticMarkup(createElement(BikeBench, props)));

const itemsOf = ($: ReturnType<typeof render>) =>
  $('[data-bench-item]')
    .toArray()
    .map((item) => $(item).attr('data-bench-item'));

describe('success cases', () => {
  it('draws only what is set up before the shift when nothing has arrived yet', () => {
    // ARRANGE
    const expected = ['tool-wall', 'instruction-sheet', 'work-order', 'parts-box', 'bench', 'bike'];
    // ACT
    const items = itemsOf(render({ label: 'The bench before the shift' }));
    // ASSERT
    expect(items).toEqual(expected);
  });

  it('adds what lands during the shift: the folder, the belt with its boxes, the note, the phone and the crate', () => {
    // ARRANGE
    const expected = [
      'tool-wall',
      'instruction-sheet',
      'work-order',
      'parts-box',
      'bench',
      'bike',
      'folder',
      'belt',
      'note',
      'phone',
      'crate',
    ];
    // ACT
    const items = itemsOf(render({ label: 'The bench during the shift', arrivals: true }));
    // ASSERT
    expect(items).toEqual(expected);
  });

  it('stands the person in front, the AI worker beside them and the hand-over arc between', () => {
    // ARRANGE
    const expected = { person: 1, ai: 1, handOver: 1 };
    // ACT
    const $ = render({ label: 'You hand the AI worker a part', arrivals: true, worker: 'human-and-ai' });
    const actual = {
      person: $('[data-bench-worker="human"]').length,
      ai: $('[data-bench-worker="ai"]').length,
      handOver: $('[data-bench-hand-over]').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('draws no worker unless asked, so the bench stays the one diagram', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const workers = render({ label: 'The bench', arrivals: true })(
      '[data-bench-worker], [data-bench-hand-over]',
    ).length;
    // ASSERT
    expect(workers).toBe(expected);
  });

  it('refuses to highlight an item the bench does not draw', () => {
    // ARRANGE
    const expected = 'The bench does not draw "folder"';
    // ACT
    const draw = () => render({ label: 'The bench', highlight: ['folder'] });
    // ASSERT
    expect(draw).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('dims every item but the highlighted ones', () => {
    // ARRANGE
    const expected = { lit: ['instruction-sheet', 'note'], dimmed: 9 };
    // ACT
    const $ = render({ label: 'The bench', arrivals: true, highlight: ['instruction-sheet', 'note'] });
    const actual = {
      lit: $('[data-bench-item][data-lit]')
        .toArray()
        .map((item) => $(item).attr('data-bench-item')),
      dimmed: $('[data-bench-item][data-dimmed]').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('names the drawing for screen readers by its label', () => {
    // ARRANGE
    const expected = { role: 'img', label: 'The bench before the shift' };
    // ACT
    const svg = render({ label: 'The bench before the shift' })('svg');
    // ASSERT
    expect({ role: svg.attr('role'), label: svg.attr('aria-label') }).toEqual(expected);
  });
});
