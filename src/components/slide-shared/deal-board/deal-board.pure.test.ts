import { describe, expect, it } from 'vitest';
import { checkDealBoard, dealCount, laneTotal, pipelineTotal, type DealLane } from './deal-board.pure';

/** Two lanes of Slide 4's Monday board: Lead in with three deals, Contact made with two. */
const LANES: readonly DealLane[] = [
  {
    slug: 'lead-in',
    label: 'Lead in',
    deals: [
      { slug: 'brightfield', company: 'Brightfield', value: 12000 },
      { slug: 'kestrel', company: 'Kestrel Labs', value: 8500 },
      { slug: 'larchwood', company: 'Larchwood Foods', value: 4000 },
    ],
  },
  {
    slug: 'contact-made',
    label: 'Contact made',
    deals: [
      { slug: 'orbit', company: 'Orbit Logistics', value: 15000 },
      { slug: 'pinecrest', company: 'Pinecrest Clinic', value: 6000 },
    ],
  },
];

describe('success cases', () => {
  it("adds a lane's deal values into its total, as the Spec's Lead in reads €24,500", () => {
    // ARRANGE
    const expected = 24500;
    // ACT
    const total = laneTotal(LANES[0]);
    // ASSERT
    expect(total).toBe(expected);
  });

  it('adds every lane into the open pipeline and counts its deals', () => {
    // ARRANGE
    const expected = { total: 45500, deals: 5 };
    // ACT
    const read = { total: pipelineTotal(LANES), deals: dealCount(LANES) };
    // ASSERT
    expect(read).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses an emphasis on a lane the board does not have', () => {
    // ARRANGE
    const expected = /no lane "proposal-made"/;
    // ACT
    const check = () => checkDealBoard({ lanes: LANES, emphasis: 'proposal-made' });
    // ASSERT
    expect(check).toThrow(expected);
  });

  it('refuses a bracket that reaches past the last lane', () => {
    // ARRANGE
    const expected = /lane 3/;
    // ACT
    const check = () => checkDealBoard({ lanes: LANES, bracket: { from: 2, to: 3 } });
    // ASSERT
    expect(check).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('reads a deal with no value, as the compact board draws it, as nothing', () => {
    // ARRANGE
    const expected = 0;
    const lane: DealLane = { slug: 'needs', label: 'Needs', deals: [{ slug: 'quarry', company: 'Quarry' }] };
    // ACT
    const total = laneTotal(lane);
    // ASSERT
    expect(total).toBe(expected);
  });
});
