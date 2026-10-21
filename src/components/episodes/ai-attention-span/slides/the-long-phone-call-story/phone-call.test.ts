import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PhoneCall, type PhoneCallCopy } from './phone-call';

const BUBBLES = ['b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9'];

const effect = (kicker: string) => ({
  title: `${kicker} title`,
  term: `${kicker} term`,
  termHref: `https://en.wikipedia.org/wiki/${kicker}`,
  explanation: `${kicker} explanation`,
  newTabHint: 'opens in a new tab',
  marker: createElement('button', { 'data-marker': kicker }),
  target: { 'data-target': kicker },
});

const COPY: PhoneCallCopy = {
  name: 'Sister',
  duration: 'Call ended · 1:21:40',
  stepsLabel: 'The call, step by step',
  bubbles: BUBBLES,
  punchline: '…wait, we never fixed the date.',
  effects: {
    start: effect('start'),
    middle: effect('middle'),
    standout: effect('standout'),
    end: effect('end'),
  },
};

const render = (copy: PhoneCallCopy = COPY) => load(renderToStaticMarkup(createElement(PhoneCall, { copy })));

describe('success cases', () => {
  it('draws the ten lines of the call in order: the start and end lit, the middle faded, the cake standing out', () => {
    // ARRANGE
    const expected = [
      ['b0', 'you', 'lit'],
      ['b1', 'sister', 'lit'],
      ['b2', 'you', 'faded'],
      ['b3', 'sister', 'faded'],
      ['b4', 'you', 'faded'],
      ['b5', 'sister', 'faded'],
      ['b6', 'sister', 'standout'],
      ['b7', 'you', 'faded'],
      ['b8', 'sister', 'lit'],
      ['b9', 'you', 'lit'],
    ];
    // ACT
    const $ = render();
    const lines = $('[data-light]')
      .map((_, el) => [[$(el).text(), $(el).attr('data-who'), $(el).attr('data-light')]])
      .get();
    // ASSERT
    expect(lines).toEqual(expected);
  });

  it('brackets the start, middle, standout and end, each with its Context marker and note target', () => {
    // ARRANGE
    const expected = [
      ['start title', 'start', 'start'],
      ['middle title', 'middle', 'middle'],
      ['standout title', 'standout', 'standout'],
      ['end title', 'end', 'end'],
    ];
    // ACT
    const $ = render();
    const labels = $('[data-effect-label]')
      .map((_, el) => [
        [$(el).find('[data-title]').text(), $(el).find('[data-marker]').attr('data-marker'), $(el).attr('data-target')],
      ])
      .get();
    // ASSERT
    expect(labels).toEqual(expected);
  });

  it('names each effect by its cognitive-science term in bold with a colon, then the explanation in plain weight', () => {
    // ARRANGE
    const expected = {
      term: 'start term',
      lead: 'start term (opens in a new tab):',
      explanation: ' start explanation',
    };
    // ACT
    const $ = render();
    const line = $('[data-effect-label]').first().find('[data-term-line]');
    // ASSERT
    expect(line.find('strong').text()).toBe(expected.lead);
    expect(line.find('strong a').clone().children('.sr-only').remove().end().text()).toBe(expected.term);
    expect(line.find('[data-explanation]').text()).toBe(expected.explanation.trim());
  });

  it('links each term to its Wikipedia article in a new tab, without a referrer, and says so to screen readers', () => {
    // ARRANGE
    const expected = {
      href: 'https://en.wikipedia.org/wiki/start',
      target: '_blank',
      rel: 'noopener noreferrer',
      hint: ' (opens in a new tab)',
    };
    // ACT
    const $ = render();
    const link = $('[data-effect-label]').first().find('a');
    // ASSERT
    expect({
      href: link.attr('href'),
      target: link.attr('target'),
      rel: link.attr('rel'),
      hint: link.find('.sr-only').text(),
    }).toEqual(expected);
  });

  it('ends on the punchline, outside the call, and renders the end state in the static HTML', () => {
    // ARRANGE
    const expected = { step: '3', punchline: COPY.punchline };
    // ACT
    const $ = render();
    // ASSERT
    expect($('[data-step]').attr('data-step')).toBe(expected.step);
    expect($('[data-punchline]').text()).toBe(expected.punchline);
    expect($('[data-punchline]').attr('data-light')).toBeUndefined();
  });
});

describe('failure cases', () => {
  it('refuses a call that does not hold exactly ten lines, since its brackets are drawn over them', () => {
    // ARRANGE
    const copy = { ...COPY, bubbles: BUBBLES.slice(0, 9) };
    const expected = /ten lines/;
    // ACT
    const draw = () => render(copy);
    // ASSERT
    expect(draw).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('draws a bracket with no label over the faded line after the cake, so the middle reads unbroken', () => {
    // ARRANGE
    const expected = { brackets: 5, labels: 4 };
    // ACT
    const $ = render();
    // ASSERT
    expect($('[data-effect]')).toHaveLength(expected.brackets);
    expect($('[data-effect-label]')).toHaveLength(expected.labels);
  });
});
