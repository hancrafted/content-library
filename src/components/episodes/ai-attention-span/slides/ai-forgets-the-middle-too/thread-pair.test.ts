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
  stepsLabel: 'Both threads, step by step',
  sister: { name: 'Sister', meta: 'Call · 1:21:40' },
  ai: { name: 'Summer party', meta: 'Chat with AI · one hour' },
  bands: {
    start: band('start', 2, 2),
    middle: band('middle', 3, 7),
    standout: { ...band('standout', 1, 1), marker: null },
    end: band('end', 2, 2),
  },
  standoutNote: 'Said four times.',
  overBudget: '12,300 over the budget',
  bottomLine: 'With a deadline, it is expensive.',
};

const render = (copy: ThreadPairCopy = COPY) => load(renderToStaticMarkup(createElement(ThreadPair, { copy })));

describe('success cases', () => {
  it('sets the four bands side by side in order, each with a pill between the sister and the AI thread', () => {
    // ARRANGE
    const expected = ['start', 'middle', 'standout', 'end'];
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
      ['tool', 'faded'],
      ['ai', 'faded'],
      ['you', 'faded'],
      ['tool', 'faded'],
      ['you', 'faded'],
      ['ai', 'faded'],
      ['ai', 'standout'],
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

  it('gives the start, middle and end pills a Context marker and the standout none', () => {
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
    const copy = { ...COPY, bands: { ...COPY.bands, middle: band('middle', 3, 6) } };
    const expected = /middle/;
    // ACT
    const draw = () => render(copy);
    // ASSERT
    expect(draw).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('renders the end state in the static HTML, with the bottom line inside the steps', () => {
    // ARRANGE
    const expected = { step: '4', bottomLine: COPY.bottomLine };
    // ACT
    const $ = render();
    // ASSERT
    expect($('[data-step]').attr('data-step')).toBe(expected.step);
    expect($('[data-step] [data-bottom-line]').text()).toBe(expected.bottomLine);
  });
});
