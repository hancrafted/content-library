import { describe, expect, it } from 'vitest';
import { DEALS, dealColumns, type Deal } from './deal-board.pure';

/** Intl separates a German amount from its symbol with a no-break space. */
const NBSP = '\u00a0';

describe('success cases', () => {
  it('totals and counts the deals of every column, in board order', () => {
    // ARRANGE
    const expected = [
      { column: 'lead-in', total: 26_000, count: 3 },
      { column: 'contact-made', total: 9_000, count: 1 },
      { column: 'needs-defined', total: 4_000, count: 1 },
      { column: 'proposal-made', total: 28_000, count: 2 },
      { column: 'negotiations-started', total: 21_500, count: 2 },
    ];
    // ACT
    const columns = dealColumns(DEALS, 'en').map(({ column, total, count }) => ({ column, total, count }));
    // ASSERT
    expect(columns).toEqual(expected);
  });

  it('writes every amount in the page locale, the total and each deal', () => {
    // ARRANGE
    const expectedEnTotal = '$28,000';
    const expectedEnDeal = '$18,000';
    const expectedDeTotal = `28.000${NBSP}$`;
    const expectedDeDeal = `18.000${NBSP}$`;
    // ACT
    const en = dealColumns(DEALS, 'en').find(({ column }) => column === 'proposal-made');
    const de = dealColumns(DEALS, 'de').find(({ column }) => column === 'proposal-made');
    // ASSERT
    expect(en?.totalText).toBe(expectedEnTotal);
    expect(en?.deals[0]?.amountText).toBe(expectedEnDeal);
    expect(de?.totalText).toBe(expectedDeTotal);
    expect(de?.deals[0]?.amountText).toBe(expectedDeDeal);
  });
});

describe('failure cases', () => {
  it('leaves a column with no deals at zero rather than dropping it', () => {
    // ARRANGE
    const deals: readonly Deal[] = [{ slug: 'solo', column: 'lead-in', company: 'Solo', amount: 1_000 }];
    const expectedColumns = 5;
    const expectedEmpty = { total: 0, count: 0, totalText: '$0' };
    // ACT
    const columns = dealColumns(deals, 'en');
    const empty = columns.find(({ column }) => column === 'negotiations-started');
    // ASSERT
    expect(columns).toHaveLength(expectedColumns);
    expect(empty).toMatchObject(expectedEmpty);
  });
});

describe('edge cases', () => {
  it('keeps the moved deal flagged in the column it moved to, and only that one', () => {
    // ARRANGE
    const expected = [{ slug: 'nordwerk', column: 'proposal-made' }];
    // ACT
    const moved = dealColumns(DEALS, 'en').flatMap(({ column, deals }) =>
      deals.filter((deal) => deal.moved).map(({ slug }) => ({ slug, column })),
    );
    // ASSERT
    expect(moved).toEqual(expected);
  });
});
