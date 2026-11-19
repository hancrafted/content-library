import { describe, expect, it } from 'vitest';
import { branchPrState, missingCloses, openingBody, refuseMerged, skipPrLookup } from './push-pr.pure.ts';

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

describe('skipPrLookup', () => {
  it('skips the merged-PR check with a note for a remote not on GitHub, and asks GitHub otherwise', () => {
    // ARRANGE
    const github = [
      'git@github.com:o/r.git',
      'https://github.com/o/r',
      'https://tok@github.com/o/r.git',
      'ssh://git@github.com/o/r.git',
    ];
    const elsewhere = ['/tmp/origin.git', 'https://gitlab.com/o/r.git', 'git@notgithub.com:o/r.git'];
    // ACT
    const asked = github.map((url) => skipPrLookup(url, 'origin'));
    const skipped = elsewhere.map((url) => skipPrLookup(url, 'origin'));
    // ASSERT
    expect(asked).toEqual([null, null, null, null]);
    for (const note of skipped) expect(note).toContain('skipped the merged-PR check');
    expect(skipped[0]).toContain('/tmp/origin.git');
  });
});
