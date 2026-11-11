import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FactoryLine, type FactoryLineProps, type Station } from './factory-line';

/*
 * The factory line the Episode redraws on every Slide it fits: stations joined by belts, documents riding the belts,
 * queues piling up in front of a station that cannot keep pace, and the customer at both ends when the Slide has room.
 */

const STATIONS: readonly Station[] = [
  { id: 'sales', label: 'Sales', queue: 0, state: 'ok' },
  { id: 'design', label: 'Design', queue: 4, state: 'jam' },
  { id: 'build', label: 'Build', queue: 0, state: 'ok' },
  { id: 'review', label: 'Review', queue: 5, state: 'jam' },
  { id: 'delivery', label: 'Delivery', queue: 0, state: 'ok' },
];

const render = (props: FactoryLineProps) => load(renderToStaticMarkup(createElement(FactoryLine, props)));

describe('success cases', () => {
  it('draws the stations in line order under their labels', () => {
    // ARRANGE
    const expected = ['Sales', 'Design', 'Build', 'Review', 'Delivery'];
    // ACT
    const $ = render({ label: 'Line out of balance', stations: STATIONS, beltDocs: 1 });
    const labels = $('[data-station]')
      .toArray()
      .map((station) => $(station).text());
    // ASSERT
    expect(labels).toEqual(expected);
  });

  it('piles each queue in front of its station, in warning where the station jams', () => {
    // ARRANGE
    const expected = { design: 4, review: 5, warning: 9 };
    // ACT
    const $ = render({ label: 'Line out of balance', stations: STATIONS, beltDocs: 1 });
    const actual = {
      design: $('[data-queue-for="design"] [data-queued]').length,
      review: $('[data-queue-for="review"] [data-queued]').length,
      warning: $('[data-queued][data-tone="queued"]').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('puts the customer at both ends, the request in and the result out, when the Slide has room', () => {
    // ARRANGE
    const customer = { request: '“A swing for my kids”', result: 'The tire swing', label: 'Customer' };
    const expected = [customer.request, customer.result];
    // ACT
    const $ = render({ label: 'Balanced', stations: STATIONS, beltDocs: 2, customer });
    const ends = $('[data-customer]')
      .toArray()
      .map((end) => $(end).find('[data-bubble]').text());
    // ASSERT
    expect(ends).toEqual(expected);
  });

  it('marks every AI station with its chip', () => {
    // ARRANGE
    const stations = STATIONS.map((station) => ({ ...station, ai: true }));
    const expected = stations.length;
    // ACT
    const $ = render({ label: 'With AI', stations, beltDocs: 1, aiLabel: 'AI' });
    const chips = $('[data-ai-chip]').length;
    // ASSERT
    expect(chips).toBe(expected);
  });
});

describe('failure cases', () => {
  it('draws no customer ends in the compact preset', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const $ = render({ label: 'Balanced', stations: STATIONS, beltDocs: 1 });
    const ends = $('[data-customer]').length;
    // ASSERT
    expect(ends).toBe(expected);
  });
});

describe('edge cases', () => {
  it('lets the output belt run empty when the line delivers nothing new', () => {
    // ARRANGE
    const belts = STATIONS.length + 1;
    const expected = { riding: belts - 1, out: 0 };
    // ACT
    const $ = render({ label: 'Line out of balance', stations: STATIONS, beltDocs: 1, outputDocs: 0 });
    const actual = {
      riding: $('[data-belt-doc]').length,
      out: $('[data-belt]').last().find('[data-belt-doc]').length,
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
