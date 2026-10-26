import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ThreadPair, type ThreadPairCopy } from './thread-pair';

const lines = (side: string, count: number) => Array.from({ length: count }, (_, i) => `${side}${i}`);

const band = (name: string, left: number, right: number) => ({
  pill: name,
  marker: createElement('button', { 'data-marker': name }),
  target: { 'data-target': name },
  left: lines(`${name}-l`, left),
  right: lines(`${name}-r`, right),
});

const COPY: ThreadPairCopy = {
  sister: { name: 'Sister', meta: 'Call · 1:21:40' },
  ai: { name: 'Summer party', meta: 'Chat with AI · one hour' },
  bands: {
    start: band('start', 2, 2),
    middle: band('middle', 3, 3),
    end: band('end', 2, 2),
  },
  bottomLine: 'With a deadline, it is expensive.',
};

const render = (copy: ThreadPairCopy = COPY) => load(renderToStaticMarkup(createElement(ThreadPair, { copy })));

describe('success cases', () => {
  it('sets the three bands side by side in order, each with a pill between the sister and the AI thread', () => {
    // ARRANGE
    const expected = ['start', 'middle', 'end'];
    // ACT
    const $ = render();
    const bands = $('[data-band]')
      .map((_, el) => $(el).attr('data-band'))
      .get();
    const pills = $('[data-pill]')
      .map((_, el) => $(el).text())
      .get();
    // ASSERT
    expect(bands).toEqual(expected);
    expect(pills).toEqual(expected);
  });

  it('draws the AI thread as the summer-party chat: your messages, its replies and its tool work, lit by band', () => {
    // ARRANGE
    const expected = [
      ['you', 'lit'],
      ['ai', 'lit'],
      ['you', 'faded'],
      ['ai', 'faded'],
      ['tool', 'faded'],
      ['you', 'lit'],
      ['ai', 'lit'],
    ];
    // ACT
    const $ = render();
    const right = $('[data-side="ai"] [data-light]')
      .map((_, el) => [[$(el).attr('data-who'), $(el).attr('data-light')]])
      .get();
    // ASSERT
    expect(right).toEqual(expected);
  });

  it('gives each of the three pills a Context marker', () => {
    // ARRANGE
    const expected = ['start', 'middle', 'end'];
    // ACT
    const $ = render();
    const markers = $('[data-pill] [data-marker]')
      .map((_, el) => $(el).attr('data-marker'))
      .get();
    // ASSERT
    expect(markers).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a band whose lines do not match the thread it is drawn over', () => {
    // ARRANGE
    const copy = { ...COPY, bands: { ...COPY.bands, middle: band('middle', 3, 2) } };
    const expected = /middle/;
    // ACT
    const draw = () => render(copy);
    // ASSERT
    expect(draw).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('draws no standout line and no ring', () => {
    // ARRANGE
    const expected = { standouts: 0, band: 0 };
    // ACT
    const $ = render();
    // ASSERT
    expect($('[data-light="standout"]').length).toBe(expected.standouts);
    expect($('[data-band="standout"]').length).toBe(expected.band);
  });

  it('shows everything at rest, with no lighting steps', () => {
    // ARRANGE
    const expected = { steps: 0, bottomLine: COPY.bottomLine };
    // ACT
    const $ = render();
    // ASSERT
    expect($('[data-step]').length).toBe(expected.steps);
    expect($('[data-bottom-line]').text()).toBe(expected.bottomLine);
  });
});
