import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { OutcomeBoard, type PrecisionOutcome } from './outcome-board';

/*
 * One of the four precision-and-accuracy outcomes as a dartboard: tight or loose darts, on the bull or off it, each
 * outcome in one dart colour wherever a Slide draws it.
 */

const throwOf = (outcome: PrecisionOutcome) => {
  const $ = load(renderToStaticMarkup(createElement(OutcomeBoard, { outcome })));
  const darts = $('[data-dart]').toArray();
  return {
    outcome: $('svg').attr('data-outcome-board'),
    boards: $('[data-dartboard]').length,
    darts: darts.length,
    tones: [...new Set(darts.map((dart) => $(dart).attr('class')))],
  };
};

describe('success cases', () => {
  it('lands four tight darts on the bull in primary', () => {
    // ARRANGE
    const expected = { outcome: 'precise-accurate', boards: 1, darts: 4, tones: ['fill-primary stroke-card'] };
    // ACT
    const actual = throwOf('precise-accurate');
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws a loose cluster around the bull dulled toward muted-foreground, never a hue', () => {
    // ARRANGE
    const expected = {
      outcome: 'accurate-scattered',
      boards: 1,
      darts: 4,
      tones: ['fill-muted-foreground stroke-card'],
    };
    // ACT
    const actual = throwOf('accurate-scattered');
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it.each(['precise-off', 'neither'] as const)('draws the off-target outcome %s in warning', (outcome) => {
    // ARRANGE
    const expected = { outcome, boards: 1, darts: 4, tones: ['fill-(--warning) stroke-card'] };
    // ACT
    const actual = throwOf(outcome);
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('dulls the bull, so darts in primary still read where they land on it', () => {
    // ARRANGE
    const expected = 'fill-muted-foreground/40';
    // ACT
    const $ = load(renderToStaticMarkup(createElement(OutcomeBoard, { outcome: 'precise-accurate' })));
    const actual = $('[data-bull]').attr('class');
    // ASSERT
    expect(actual).toBe(expected);
  });

  it('sizes the board by the class the Slide gives it', () => {
    // ARRANGE
    const expected = 'size-20';
    // ACT
    const $ = load(renderToStaticMarkup(createElement(OutcomeBoard, { outcome: 'neither', className: 'size-20' })));
    const actual = $('svg').attr('class');
    // ASSERT
    expect(actual).toBe(expected);
  });
});
