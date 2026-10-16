import { describe, expect, it } from 'vitest';
import { cashLeft, formatEuro, lanePlacement, signedAmount, tiltOf, type NoteSlots } from './cashflow-board.pure';

/** Slide 1's board: the million lands in April, one month after March's cost hits an empty account. */
const SLIDE_1: readonly NoteSlots[] = [
  {
    notes: [
      { kind: 'cash', amount: 100000 },
      { kind: 'cost', amount: 50000 },
      { kind: 'cash', amount: 50000 },
    ],
  },
  {
    notes: [
      { kind: 'cash', amount: 50000 },
      { kind: 'cost', amount: 50000 },
      { kind: 'cash', amount: 0, big: true },
    ],
  },
  { notes: [{ kind: 'cost', amount: 50000 }, null, null] },
  { notes: [null, { kind: 'revenue', amount: 1000000, big: true }, null] },
];

describe('success cases', () => {
  it("reads each column's cash left as the Spec's footers give it for Slide 1", () => {
    // ARRANGE
    const expected = [50000, 0, -50000, 950000];
    // ACT
    const balances = cashLeft(SLIDE_1);
    // ASSERT
    expect(balances).toEqual(expected);
  });

  it('writes euros the way each locale writes money, with a true minus sign', () => {
    // ARRANGE
    const expected = ['€100,000', '−€50,000', '100.000 €', '−50.000 €'];
    // ACT
    const written = [
      formatEuro(100000, 'en'),
      formatEuro(-50000, 'en'),
      formatEuro(100000, 'de'),
      formatEuro(-50000, 'de'),
    ].map((text) => text.replaceAll('\u00a0', ' '));
    // ASSERT
    expect(written).toEqual(expected);
  });

  it('signs a cost negative and leaves cash and revenue as they are', () => {
    // ARRANGE
    const expected = [-50000, 100000, 1000000];
    // ACT
    const signed = [
      signedAmount({ kind: 'cost', amount: 50000 }),
      signedAmount({ kind: 'cash', amount: 100000 }),
      signedAmount({ kind: 'revenue', amount: 1000000 }),
    ];
    // ASSERT
    expect(signed).toEqual(expected);
  });

  it('places four lanes two by two when narrow and side by side when wide', () => {
    // ARRANGE
    const expected = [
      { narrowColumn: 1, narrowRow: 1, wideColumn: 1 },
      { narrowColumn: 2, narrowRow: 1, wideColumn: 2 },
      { narrowColumn: 1, narrowRow: 5, wideColumn: 3 },
      { narrowColumn: 2, narrowRow: 5, wideColumn: 4 },
    ];
    // ACT
    const placements = [1, 2, 3, 4].map((column) => lanePlacement(column));
    // ASSERT
    expect(placements).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('lets a cash note overrule the carried balance, so the footer reads what the board shows', () => {
    // ARRANGE
    const board: readonly NoteSlots[] = [
      { notes: [{ kind: 'cost', amount: 50000 }, null, null] },
      { notes: [{ kind: 'cash', amount: 20000 }, null, null] },
    ];
    const expected = [-50000, 20000];
    // ACT
    const balances = cashLeft(board);
    // ASSERT
    expect(balances).toEqual(expected);
  });

  it('counts a ghost and a note with no amount as nothing', () => {
    // ARRANGE
    const board: readonly NoteSlots[] = [
      { notes: [{ kind: 'cash', amount: 10000 }, { kind: 'ghost' }, { kind: 'revenue' }] },
    ];
    const expected = [10000];
    // ACT
    const balances = cashLeft(board);
    // ASSERT
    expect(balances).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('carries the balance through a column with no notes, as April does on Slide 6', () => {
    // ARRANGE
    const board: readonly NoteSlots[] = [
      { notes: [{ kind: 'cash', amount: 0 }, null, null] },
      { notes: [{ kind: 'cost', amount: 50000 }, { kind: 'revenue', amount: 1000000 }, null] },
      { notes: [null, { kind: 'ghost' }, null] },
    ];
    const expected = [0, 950000, 950000];
    // ACT
    const balances = cashLeft(board);
    // ASSERT
    expect(balances).toEqual(expected);
  });

  it('rests a note at the same tilt for its column and slot on every board, cycling past four columns', () => {
    // ARRANGE
    const expected = [-2, 1, -1, -2];
    // ACT
    const tilts = [tiltOf(1, 1), tiltOf(3, 2), tiltOf(1, 3), tiltOf(5, 1)];
    // ASSERT
    expect(tilts).toEqual(expected);
  });

  it('writes zero euros without a sign', () => {
    // ARRANGE
    const expected = '€0';
    // ACT
    const written = formatEuro(0, 'en');
    // ASSERT
    expect(written).toBe(expected);
  });
});
