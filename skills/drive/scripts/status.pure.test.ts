import { describe, expect, it } from 'vitest';
import {
  derivePhase,
  type Facts,
  lastCommand,
  mergedTicketsOf,
  pickIntegrationBranch,
  renderStatus,
  ticketsOfBodies,
} from './status.pure.ts';

const base: Facts = {
  topic: 'demo',
  integrationBranch: 'chore/demo',
  pushed: true,
  decisionPr: null,
  integrationPr: null,
  tickets: [],
  mergedTickets: [],
  lastLog: null,
};
const pr = (number: number, state: 'OPEN' | 'MERGED' | 'CLOSED', isDraft = false) => ({ number, state, isDraft });

describe('derivePhase', () => {
  it.each([
    ['no Integration branch', { integrationBranch: null }, 'Define'],
    ['an unpushed Integration branch', { pushed: false }, 'Define'],
    ['a pushed branch, no Decision PR, no tickets', {}, 'Define'],
    ['an open Decision PR', { decisionPr: pr(5, 'OPEN') }, 'Reason'],
    [
      'a merged Decision PR, tickets unmerged',
      { decisionPr: pr(5, 'MERGED'), tickets: [1, 2], mergedTickets: [1] },
      'Implement',
    ],
    ['tickets but no Decision PR (chat approval)', { tickets: [1] }, 'Implement'],
    [
      'every ticket merged, no Integration PR',
      { decisionPr: pr(5, 'MERGED'), tickets: [1], mergedTickets: [1] },
      'Verify',
    ],
    ['a merged Integration PR', { integrationPr: pr(9, 'MERGED') }, 'Evolve'],
    ['a Decision PR closed unmerged', { decisionPr: pr(5, 'CLOSED') }, 'Stopped'],
    ['an Integration PR closed unmerged', { integrationPr: pr(9, 'CLOSED') }, 'Stopped'],
  ] as const)('names the phase for %s', (_name, patch, phase) => {
    // ARRANGE
    const facts: Facts = { ...base, ...patch };
    // ACT
    const standing = derivePhase(facts);
    // ASSERT
    expect(standing.phase).toBe(phase);
  });

  it('points the Verify stop at the draft, then at the Operator', () => {
    // ARRANGE
    const verified = {
      ...base,
      decisionPr: pr(5, 'MERGED'),
      tickets: [1],
      mergedTickets: [1],
    };
    // ACT
    const none = derivePhase(verified).next;
    const draft = derivePhase({
      ...verified,
      integrationPr: pr(9, 'OPEN', true),
    }).next;
    const ready = derivePhase({
      ...verified,
      integrationPr: pr(9, 'OPEN'),
    }).next;
    // ASSERT
    expect(none).toContain('drive push');
    expect(draft).toContain('drive pr ready 9');
    expect(ready).toContain('merges #9');
  });

  it('lists the unmerged tickets as the Implement stop', () => {
    // ARRANGE
    const facts = {
      ...base,
      decisionPr: pr(5, 'MERGED'),
      tickets: [1, 2, 3],
      mergedTickets: [2],
    };
    // ACT
    const { next } = derivePhase(facts);
    // ASSERT
    expect(next).toContain('#1, #3');
  });
});

describe('renderStatus', () => {
  it('prints phase, branch, both PRs, ticket count, last command and next stop', () => {
    // ARRANGE
    const facts: Facts = {
      ...base,
      decisionPr: pr(5, 'MERGED'),
      integrationPr: pr(9, 'OPEN', true),
      tickets: [1, 2],
      mergedTickets: [1],
      lastLog: { t: '2026-01-01T00:00:00Z', cmd: 'push' },
    };
    // ACT
    const text = renderStatus(facts);
    // ASSERT
    expect(text).toContain('Workflow demo: Implement');
    expect(text).toContain('Integration branch: chore/demo (pushed)');
    expect(text).toContain('Decision PR: #5 merged');
    expect(text).toContain('Integration PR: #9 draft');
    expect(text).toContain('Tickets: 1/2 merged');
    expect(text).toContain('Last command: `push`');
    expect(text).toContain('Next stop: merge #2');
  });

  it('works with no log, no PRs and no branch', () => {
    // ARRANGE
    const facts: Facts = { ...base, integrationBranch: null, pushed: false };
    // ACT
    const text = renderStatus(facts);
    // ASSERT
    expect(text).toContain('Integration branch: none');
    expect(text).toContain('Decision PR: none');
    expect(text).toContain('Last command: no log');
  });
});

describe('fact readers', () => {
  it('picks the Integration branch, never the decisions or a Task branch', () => {
    // ARRANGE
    const branches = ['decisions/demo', 'origin/chore/demo--1-x', 'origin/chore/demo'];
    // ACT
    const picked = pickIntegrationBranch(branches, 'demo');
    // ASSERT
    expect(picked).toBe('chore/demo');
    expect(pickIntegrationBranch(['decisions/demo'], 'demo')).toBeNull();
  });

  it('reads merged tickets from the merge commits of Task branches', () => {
    // ARRANGE
    const subjects = [
      "Merge branch 'chore/demo--7-store' into chore/demo",
      "Merge branch 'chore/demo--7-store' into chore/demo",
      "Merge branch 'chore/other--8-x' into chore/other",
      "Merge branch 'chore/demo--review-fix' into chore/demo",
    ];
    // ACT
    const merged = mergedTicketsOf(subjects, 'chore/demo');
    // ASSERT
    expect(merged).toEqual([7]);
  });

  it('reads tickets from the Closes lines, else the Decision PR Tickets section', () => {
    // ARRANGE
    const decision = '## Spec\n\n#1\n\n## Tickets\n\n- #4 a (Skills: tdd)\n- #5 b\n\n## Live\n\n- #99 no';
    // ACT
    const fromClose = ticketsOfBodies('Spec: #1\n\nCloses #2\nCloses #3', decision);
    const fromDecision = ticketsOfBodies(null, decision);
    // ASSERT
    expect(fromClose).toEqual([2, 3]);
    expect(fromDecision).toEqual([4, 5]);
  });

  it('takes the last log line that is a command', () => {
    // ARRANGE
    const entries = [{ t: 'a', cmd: 'push' }, { t: 'b', cmd: 'status' }, { t: 'c' }];
    // ACT
    const last = lastCommand(entries);
    // ASSERT
    expect(last).toEqual({ t: 'b', cmd: 'status' });
    expect(lastCommand([])).toBeNull();
  });
});
