import { load, type CheerioAPI } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CashflowBoard, CashflowMonth, CashflowPaper, CashflowStamp } from './cashflow-board';

/*
 * The cashflow board several Slides share: a labelled figure of month cards,
 * each holding sticky-note papers, with a rule and free rows above and below.
 * Every string arrives as a plain prop; a tone or state always comes with the
 * words that carry its meaning.
 */

/** An element's words as a reader meets them: text nodes in document order, one space apart. */
function wordsOf($: CheerioAPI, element: Parameters<CheerioAPI>[0]): string {
  const parts: string[] = [];
  const walk = (node: { type: string; data?: string; children?: unknown[] }): void => {
    if (node.type === 'text') parts.push(node.data ?? '');
    if (node.type === 'tag') (node.children as (typeof node)[] | undefined)?.forEach(walk);
  };
  $(element)
    .toArray()
    .forEach((node) => walk(node as unknown as { type: string }));
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/** A board of two months, a rule, an `above` row and a `below` row, rendered as static HTML. */
function twoMonthBoard() {
  return load(
    renderToStaticMarkup(
      createElement(CashflowBoard, {
        label: 'Fictional example',
        rule: 'Closing = opening + receipts − payments',
        above: createElement('p', null, 'Start when?'),
        below: createElement(CashflowStamp, null, 'Bankrupt'),
        labelTarget: { 'data-target': 'basis' },
        ruleTarget: { 'data-target': 'rule' },
        children: [
          createElement(
            CashflowMonth,
            { name: 'January', key: 'january' },
            createElement(CashflowPaper, { label: 'Opening cash', amount: '$100,000' }),
          ),
          createElement(
            CashflowMonth,
            { name: 'February', badge: 'Zero-cash month', tone: 'warning', key: 'february' },
            createElement(CashflowPaper, { label: 'Closing cash', amount: '$0', tone: 'warning' }),
          ),
        ],
      }),
    ),
  );
}

describe('success cases', () => {
  it('reads label, above row, months, rule and below row in that order inside one figure', () => {
    // ARRANGE
    const expected = [
      'Fictional example',
      'Start when?',
      'January Opening cash $100,000',
      'February Zero-cash month Closing cash $0',
      'Closing = opening + receipts − payments',
      'Bankrupt',
    ];
    const $ = twoMonthBoard();
    // ACT
    const rows = $('figure')
      .children()
      .toArray()
      .flatMap((row) =>
        row.tagName === 'ol'
          ? $(row)
              .children('li')
              .toArray()
              .map((month) => wordsOf($, month))
          : [wordsOf($, row)],
      );
    // ASSERT
    expect(rows).toEqual(expected);
  });

  it('marks the label and the rule as the targets the Slide names', () => {
    // ARRANGE
    const expected = { basis: 'Fictional example', rule: 'Closing = opening + receipts − payments' };
    const $ = twoMonthBoard();
    // ACT
    const targets = { basis: wordsOf($, '[data-target="basis"]'), rule: wordsOf($, '[data-target="rule"]') };
    // ASSERT
    expect(targets).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('shows a status tone only beside the words that name it', () => {
    // ARRANGE
    const expected = [{ tone: 'warning', text: 'February Zero-cash month Closing cash $0' }];
    const $ = twoMonthBoard();
    // ACT
    const toned = $('li[data-tone]')
      .toArray()
      .filter((month) => $(month).attr('data-tone') !== 'neutral')
      .map((month) => ({ tone: $(month).attr('data-tone'), text: wordsOf($, month) }));
    // ASSERT
    expect(toned).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('renders a counterfactual or vacated paper with its state exposed and its words intact', () => {
    // ARRANGE
    const expected = [
      { state: 'counterfactual', tone: 'neutral', text: 'If funded: April $900,000' },
      { state: 'vacated', tone: 'neutral', text: 'Original receipt date' },
    ];
    const html = renderToStaticMarkup(
      createElement(
        'div',
        null,
        createElement(CashflowPaper, { label: 'If funded: April $900,000', state: 'counterfactual' }),
        createElement(CashflowPaper, { label: 'Original receipt date', state: 'vacated' }),
      ),
    );
    const $ = load(html);
    // ACT
    const papers = $('[data-state]')
      .toArray()
      .map((paper) => ({
        state: $(paper).attr('data-state'),
        tone: $(paper).attr('data-tone'),
        text: wordsOf($, paper),
      }));
    // ASSERT
    expect(papers).toEqual(expected);
  });
});
