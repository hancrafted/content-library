import { describe, expect, it } from 'vitest';
import { branchPrState, missingCloses, openingBody, refuseMerged } from './push-pr.pure.ts';

describe('branchPrState', () => {
  it('is none without PRs, open when any is open, merged when only merged ones exist', () => {
    // ARRANGE
    const merged = { number: 1, state: 'MERGED' };
    const open = { number: 2, state: 'OPEN' };
    const closed = { number: 3, state: 'CLOSED' };
    // ACT
    const states = [
      branchPrState([]),
      branchPrState([merged, open]),
      branchPrState([closed, merged]),
      branchPrState([closed]),
    ];
    // ASSERT
    expect(states).toEqual(['none', 'open', 'merged', 'none']);
  });
});

describe('refuseMerged', () => {
  it('tells the agent to branch anew when the branch merged', () => {
    // ARRANGE
    // ACT
    const messages = [refuseMerged('feat/x', 'merged'), refuseMerged('feat/x', 'open')];
    // ASSERT
    expect(messages[0]).toContain('feat/x');
    expect(messages[0]).toContain('branch anew');
    expect(messages[1]).toBeNull();
  });
});

describe('openingBody', () => {
  it('has a Closes line for every ticket and names the spec', () => {
    // ARRANGE
    // ACT
    const body = openingBody(789, [790, 791]);
    // ASSERT
    expect(body).toContain('Closes #790');
    expect(body).toContain('Closes #791');
    expect(body).toContain('#789');
  });
});

describe('missingCloses', () => {
  it('names the tickets the body does not close, and none when all are there', () => {
    // ARRANGE
    const body = 'Closes #790\nfixes #791 and closes #7920';
    // ACT
    const missing = missingCloses(body, [790, 791, 792]);
    const none = missingCloses(openingBody(1, [5, 6]), [5, 6]);
    // ASSERT
    expect(missing).toEqual([791, 792]);
    expect(none).toEqual([]);
  });
});
