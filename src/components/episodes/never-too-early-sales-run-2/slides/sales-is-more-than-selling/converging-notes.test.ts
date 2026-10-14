import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ConvergingNotes } from './converging-notes';

const props = {
  label: 'Three payoffs lead to trust.',
  notes: [
    {
      slug: 'market-insight',
      label: 'Market insight',
      line: 'Talks are research.',
      target: { 'data-target': 'market-insight' },
    },
    { slug: 'trust', label: 'Trust', line: 'A deal is proof.', target: { 'data-target': 'trust' } },
    {
      slug: 'repeatable-process',
      label: 'Repeatable process',
      line: 'Steps that work.',
      target: { 'data-target': 'repeatable-process' },
    },
  ],
  outcome: { label: 'Increase trust', line: 'A company others dare to bet on.' },
};

function render() {
  return load(renderToStaticMarkup(createElement(ConvergingNotes, props)));
}

describe('success cases', () => {
  it('names the board, and lets the payoffs, their arrows and then the outcome land in reading order', () => {
    // ARRANGE
    const expected = {
      label: 'Three payoffs lead to trust.',
      notes: ['Market insight:0', 'Trust:1', 'Repeatable process:2', 'Increase trust:6'],
      arrows: ['3', '4', '5'],
    };
    // ACT
    const $ = render();
    const actual = {
      label: $('[data-board]').attr('aria-label'),
      notes: $('[data-board-note]')
        .toArray()
        .map((note) => `${$(note).children().first().text()}:${$(note).css('--i')}`),
      arrows: $('[data-board-arrow]')
        .toArray()
        .map((arrow) => $(arrow).css('--i')),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('marks each payoff note as the target of its Speaker note', () => {
    // ARRANGE
    const expected = ['market-insight', 'trust', 'repeatable-process'];
    // ACT
    const $ = render();
    // ASSERT
    expect(
      $('[data-board-note]:not([data-primary])')
        .toArray()
        .map((note) => $(note).attr('data-target')),
    ).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('gives the outcome note no target, since no Speaker note explains it', () => {
    // ARRANGE
    const expected = undefined;
    // ACT
    const $ = render();
    // ASSERT
    expect($('[data-board-note][data-primary]').attr('data-target')).toBe(expected);
  });
});

describe('edge cases', () => {
  it('rings only the outcome note, which fills all three rows on the right', () => {
    // ARRANGE
    const expected = { labels: ['Increase trust'], cell: ['col-start-3', 'row-span-3', 'row-start-1'] };
    // ACT
    const $ = render();
    const primary = $('[data-board-note][data-primary]');
    const actual = {
      labels: primary.toArray().map((note) => $(note).children().first().text()),
      cell: (primary.parent().attr('class') ?? '').split(' ').sort(),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('points every arrow right, at the outcome, as a drawing hidden from assistive tech', () => {
    // ARRANGE
    const expected = [
      ['right', 'true'],
      ['right', 'true'],
      ['right', 'true'],
    ];
    // ACT
    const $ = render();
    // ASSERT
    expect(
      $('[data-board-arrow]')
        .toArray()
        .map((arrow) => [$(arrow).attr('data-direction'), $(arrow).attr('aria-hidden')]),
    ).toEqual(expected);
  });
});
