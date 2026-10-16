import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CashflowBoard, CashLeft, type CashflowBoardProps } from './cashflow-board';

const LABELS = { board: 'Cashflow board', cash: 'Cash', cost: 'Cost', revenue: 'Revenue', ghost: 'Was here' };

/** A two-month board with a cost, a big targeted note and a ghost, enough to see every kind drawn. */
function board(extra: Partial<CashflowBoardProps> = {}): string {
  return renderToStaticMarkup(
    createElement(CashflowBoard, {
      locale: 'en',
      labels: LABELS,
      columns: [
        {
          label: 'Jan',
          notes: [
            { kind: 'cash', amount: 100000 },
            { kind: 'cost', amount: 50000 },
            { kind: 'cash', amount: 0, big: true, target: 'zero-cash' },
          ],
        },
        { label: 'Feb', notes: [null, { kind: 'ghost' }, null] },
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
  it('writes each note as its kind over its euro amount, a cost with its minus', () => {
    // ARRANGE
    const expected = 'Jan Cash €100,000 Cost −€50,000 Cash €0';
    // ACT
    const text = textOf(board());
    // ASSERT
    expect(text).toContain(expected);
  });

  it("puts the Slide's target on the note it names, for the Context drawer", () => {
    // ARRANGE
    const expected = 'data-target="zero-cash"';
    // ACT
    const html = board();
    // ASSERT
    expect(html).toContain(expected);
  });

  it('shows the stamp, the ringed column, the arrow label and the annotations it is given', () => {
    // ARRANGE
    const expected = ['Bankrupt', 'data-highlight="true"', 'One month earlier', 'Two months of cash', 'Zero cash'];
    // ACT
    const html = board({
      stamp: { label: 'Bankrupt', column: 2 },
      highlight: 2,
      arrow: { from: [2, 2], to: [1, 2], label: 'One month earlier' },
      annotations: [
        { column: 1, span: 2, kind: 'bracket', text: 'Two months of cash' },
        { column: 1, kind: 'callout', text: 'Zero cash' },
      ],
    });
    // ASSERT
    expect(expected.filter((part) => !html.includes(part))).toEqual([]);
  });

  it('draws a curved arrow as a stroked path, its label on a pill in the slot under its start', () => {
    // ARRANGE
    const expected = [
      'data-cashflow="arrow" data-variant="curve"',
      '<path',
      'data-cashflow="arrow-label"',
      'One month earlier',
    ];
    // ACT
    const html = board({ arrow: { from: [2, 2], to: [1, 2], label: 'One month earlier', variant: 'curve' } });
    // ASSERT
    expect(expected.filter((part) => !html.includes(part))).toEqual([]);
  });

  it("stands a shaft's label on its own in the gap after the column it is told, outside the shaft", () => {
    // ARRANGE
    const expected =
      /<p data-cashflow="arrow-label" data-variant="shaft" data-gap="1"[^>]*><span[^>]*>Start early!<\/span>/;
    // ACT
    const html = board({ arrow: { from: [2, 2], to: [1, 2], label: 'Start early!', labelGap: 1 } });
    // ASSERT
    expect(html).toMatch(expected);
    expect(html.match(/Start early!/g)?.length).toBe(1);
  });

  it("stops a shaft's head beside the note it points at when told, and marks no stop by default", () => {
    // ARRANGE
    const expected = /data-cashflow="arrow" data-variant="shaft"[^>]*data-stop="beside"/;
    // ACT
    const html = board({ arrow: { from: [2, 2], to: [1, 2], stop: 'beside' } });
    const plain = board({ arrow: { from: [2, 2], to: [1, 2] } });
    // ASSERT
    expect(html).toMatch(expected);
    expect(plain).not.toContain('data-stop');
  });

  it("gives a standing shaft label a head toward the arrow's end, for a narrow board that cannot draw the shaft", () => {
    // ARRANGE
    const expected = /data-cashflow="arrow-label"[^>]*data-points="up"[^>]*><span[^>]*><svg[^>]*aria-hidden="true"/;
    const lane = (label: string) => ({ label, notes: [null, { kind: 'cost', amount: 50000 } as const, null] });
    // ACT
    const html = board({
      columns: [lane('Q1'), lane('Q2'), lane('Q3')],
      arrow: { from: [3, 2], to: [1, 2], label: 'Start early!', labelGap: 2 },
    });
    // ASSERT
    expect(html).toMatch(expected);
  });

  it('rings a note it is told to ring in primary, and only that note', () => {
    // ARRANGE
    const expected = 1;
    // ACT
    const html = board({
      columns: [{ label: 'March', notes: [{ kind: 'cost', amount: 50000 }, { kind: 'revenue', ring: true }, null] }],
    });
    // ASSERT
    expect(html.match(/data-ring="true"[^>]*ring-primary/g)?.length).toBe(expected);
  });

  it("draws a column's footer under its lane, the cash left line the Slides pass", () => {
    // ARRANGE
    const footer = createElement(CashLeft, { label: 'Cash left', amount: -50000, locale: 'en' });
    const expected = 'Cash left −€50,000';
    // ACT
    const text = textOf(board({ columns: [{ label: 'March', notes: [null, null, null], footer }] }));
    // ASSERT
    expect(text).toContain(expected);
  });
});

describe('failure cases', () => {
  it('refuses a stamp on a column the board does not have', () => {
    // ARRANGE
    const expected = /column 5/;
    // ACT
    const render = () => board({ stamp: { label: 'Bankrupt', column: 5 } });
    // ASSERT
    expect(render).toThrow(expected);
  });

  it('refuses an arrow that starts in a slot past the third', () => {
    // ARRANGE
    const expected = /slot 4/;
    // ACT
    const render = () => board({ arrow: { from: [1, 4], to: [2, 1] } });
    // ASSERT
    expect(render).toThrow(expected);
  });

  it("refuses a shaft label in the gap after the board's last column", () => {
    // ARRANGE
    const expected = /column 3/;
    // ACT
    const render = () => board({ arrow: { from: [2, 2], to: [1, 2], label: 'Start early!', labelGap: 2 } });
    // ASSERT
    expect(render).toThrow(expected);
  });
});

describe('edge cases', () => {
  it("writes a ghost as the outline's label and an empty slot as nothing", () => {
    // ARRANGE
    const expected = 'Feb Was here';
    // ACT
    const text = textOf(board());
    // ASSERT
    expect(text).toContain(expected);
  });

  it('draws an arrow given no variant as the straight shaft, its label on the shaft', () => {
    // ARRANGE
    const expected = 'data-cashflow="arrow" data-variant="shaft"';
    const absent = 'data-cashflow="arrow-label"';
    // ACT
    const html = board({ arrow: { from: [2, 2], to: [1, 2], label: 'One month earlier' } });
    // ASSERT
    expect(html).toContain(expected);
    expect(html).not.toContain(absent);
  });

  it('names the board for a screen reader and draws nothing it was not given', () => {
    // ARRANGE
    const expected = 'aria-label="Cashflow board"';
    const absent = ['data-highlight', 'data-cashflow="stamp"', 'data-cashflow="arrow"', 'data-cashflow="annotation"'];
    // ACT
    const html = board();
    // ASSERT
    expect(html).toContain(expected);
    expect(absent.filter((part) => html.includes(part))).toEqual([]);
  });
});
