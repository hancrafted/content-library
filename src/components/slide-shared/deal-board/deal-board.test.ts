import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DealBoard, OpenPipeline, type DealBoardProps } from './deal-board';

/** A two-lane board with values, enough to read a total, a count and a deal note. */
function board(extra: Partial<DealBoardProps> = {}): string {
  return renderToStaticMarkup(
    createElement(DealBoard, {
      label: 'Deal board',
      locale: 'en',
      countLabel: (count: number) => `${count} deals`,
      lanes: [
        {
          slug: 'lead-in',
          label: 'Lead in',
          deals: [
            { slug: 'brightfield', company: 'Brightfield', contact: 'Jonas Weber', value: 12000 },
            { slug: 'kestrel', company: 'Kestrel Labs', contact: 'Mia Novak', value: 8500 },
          ],
        },
        {
          slug: 'proposal-made',
          label: 'Proposal made',
          deals: [{ slug: 'saltmarsh', company: 'Saltmarsh Energy', contact: 'Nora Fischer', value: 40000 }],
        },
      ],
      ...extra,
    }),
  );
}

/** The visible text of rendered markup, tags dropped and whitespace collapsed. */
function textOf(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

describe('success cases', () => {
  it('heads each lane with its pill, its computed total and its count, then its deal notes', () => {
    // ARRANGE
    const expected = 'Lead in €20,500 2 deals Brightfield Jonas Weber €12,000 Kestrel Labs Mia Novak €8,500';
    // ACT
    const text = textOf(board());
    // ASSERT
    expect(text).toContain(expected);
  });

  it('rings the emphasised lane and draws the annotation and the two ends it is given', () => {
    // ARRANGE
    const expected = ['data-emphasis="true"', 'Where your week goes', 'A name on your list', 'A signed contract'];
    // ACT
    const html = board({
      emphasis: 'proposal-made',
      annotation: 'Where your week goes',
      ends: ['A name on your list', 'A signed contract'],
    });
    // ASSERT
    expect(expected.filter((part) => !html.includes(part))).toEqual([]);
  });

  it('pins the open pipeline as a note: its label, its euro sum and its deal count', () => {
    // ARRANGE
    const expected = 'Monday · open pipeline €60,500 3 deals in 2 stages';
    // ACT
    const text = textOf(
      renderToStaticMarkup(
        createElement(OpenPipeline, {
          label: 'Monday · open pipeline',
          total: 60500,
          deals: '3 deals in 2 stages',
          locale: 'en',
        }),
      ),
    );
    // ASSERT
    expect(text).toBe(expected);
  });

  it('draws the compact board as company names, the incoming notes first in the emphasised lane, and the bracket', () => {
    // ARRANGE
    const expected =
      'Lead in inbound A form sent Brightfield Kestrel Labs Proposal made Saltmarsh Energy A defined stage Sales works what lands here';
    // ACT
    const text = textOf(
      board({
        compact: true,
        emphasis: 'lead-in',
        incoming: [{ slug: 'form', tag: 'inbound', text: 'A form sent' }],
        bracket: { stage: 'A defined stage', label: 'Sales works what lands here', from: 2, to: 2 },
      }),
    );
    // ASSERT
    expect(text).toBe(expected);
  });

  it('closes a lane with its dashed slot, its text read after the notes, and wraps the lanes when asked', () => {
    // ARRANGE
    const expected = ['data-deal="slot"', 'data-kind="payment"', 'data-kind="open"', 'too late?', 'data-wrap="true"'];
    const expectedText = 'Leads Payment too late?';
    // ACT
    const html = board({
      countLabel: undefined,
      wrap: true,
      lanes: [
        { slug: 'leads', label: 'Leads', deals: [], slot: { kind: 'open' } },
        { slug: 'payment', label: 'Payment', deals: [], slot: { kind: 'payment', text: 'too late?' } },
      ],
    });
    // ASSERT
    expect(expected.filter((part) => !html.includes(part))).toEqual([]);
    expect(textOf(html)).toBe(expectedText);
  });

  it('draws a tagged deal as its tag over its company, ringed when the board points at it', () => {
    // ARRANGE
    const expected = 'Leads Lead Your first lead';
    const ring = 'data-ringed="true"';
    // ACT
    const html = board({
      countLabel: undefined,
      lanes: [
        {
          slug: 'leads',
          label: 'Leads',
          deals: [{ slug: 'first-lead', tag: 'Lead', company: 'Your first lead', ringed: true }],
        },
      ],
    });
    // ASSERT
    expect(textOf(html)).toBe(expected);
    expect(html).toContain(ring);
  });
});

describe('failure cases', () => {
  it('refuses to emphasise a lane the board does not have', () => {
    // ARRANGE
    const expected = /no lane "negotiation"/;
    // ACT
    const render = () => board({ emphasis: 'negotiation' });
    // ASSERT
    expect(render).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('names the board for a screen reader and draws nothing it was not given', () => {
    // ARRANGE
    const expected = 'aria-label="Deal board"';
    const absent = [
      'data-emphasis',
      'data-deal="annotation"',
      'data-deal="ends"',
      'data-deal="bracket"',
      'data-deal="slot"',
      'data-wrap',
    ];
    // ACT
    const html = board();
    // ASSERT
    expect(html).toContain(expected);
    expect(absent.filter((part) => html.includes(part))).toEqual([]);
  });
});
