import { describe, expect, it } from 'vitest';
import {
  closesIn,
  DRIVE_MARKER,
  idsOf,
  judge,
  judgeIntegration,
  parseReviewComments,
  parseView,
  ticketsLine,
  type PullRequestView,
} from './pr-watch.pure.ts';
import { watchPullRequest } from './pr-watch.ts';

const open = (over: Partial<PullRequestView> = {}): PullRequestView => ({
  state: 'OPEN',
  mergeCommit: null,
  reviews: [],
  comments: [],
  reviewComments: [],
  ...over,
});

describe('judge', () => {
  it('ends 0 with the merge commit when merged and 2 when closed', () => {
    // ARRANGE
    const merged = open({ state: 'MERGED', mergeCommit: { oid: 'abc123' } });
    const closed = open({ state: 'CLOSED' });
    // ACT
    const verdicts = [judge(merged, new Set()), judge(closed, new Set())];
    // ASSERT
    expect(verdicts).toEqual([
      { exit: 0, line: 'merged abc123' },
      { exit: 2, line: 'closed' },
    ]);
  });

  it('ends 3 with the bodies of reviews and comments that appeared after the start', () => {
    // ARRANGE
    const view = open({
      reviews: [
        { id: 'r1', body: 'old review' },
        { id: 'r2', body: 'fix the title' },
      ],
      comments: [{ id: 'c1', body: 'and this' }],
    });
    // ACT
    const verdict = judge(view, new Set(['r1']));
    // ASSERT
    expect(verdict).toEqual({ exit: 3, line: 'fix the title\n---\nand this' });
  });

  it('keeps waiting when nothing is new or the only new comment carries the drive marker', () => {
    // ARRANGE
    const own = open({
      comments: [{ id: 'c1', body: `${DRIVE_MARKER}\nrevised` }],
    });
    // ACT
    const verdicts = [judge(open(), new Set()), judge(own, new Set())];
    // ASSERT
    expect(verdicts).toEqual([null, null]);
  });
});

describe('inline review comments', () => {
  it('reports a new inline comment with its file and line', () => {
    // ARRANGE
    const view = open({
      reviewComments: [{ id: 'rc9', body: 'rename this', path: 'a/b.ts', line: 12 }],
    });
    // ACT
    const verdict = judge(view, new Set());
    // ASSERT
    expect(verdict).toEqual({ exit: 3, line: 'a/b.ts:12 rename this' });
  });

  it('parses the API list, flattening pages and skipping the drive marker', () => {
    // ARRANGE
    const pages = JSON.stringify([
      [{ id: 1, body: 'one', path: 'x.ts', line: 3 }],
      [
        {
          id: 2,
          body: '<!-- drive -->\nreply',
          path: 'x.ts',
          line: null,
          original_line: 4,
        },
      ],
    ]);
    // ACT
    const parsed = parseReviewComments(pages);
    // ASSERT
    expect(parsed).toEqual([
      { id: 'rc1', body: 'one', path: 'x.ts', line: 3 },
      { id: 'rc2', body: '<!-- drive -->\nreply', path: 'x.ts', line: 4 },
    ]);
    expect(judge(open({ reviewComments: parsed as never }), new Set(['rc1']))).toBeNull();
  });
});

describe('parseView', () => {
  it('fills missing lists and reports invalid JSON', () => {
    // ARRANGE
    // ACT
    const view = parseView('{"state":"OPEN"}');
    const broken = parseView('nope');
    // ASSERT
    expect(view).toEqual(open());
    expect(broken).toHaveProperty('error');
  });
});

describe('watchPullRequest', () => {
  const watch = (views: PullRequestView[]) => {
    const queue = [...views];
    return watchPullRequest({
      view: () => queue.shift() ?? open({ state: 'CLOSED' }),
      sleep: () => Promise.resolve(),
      timing: { pollMilliseconds: 1 },
    });
  };

  it('treats what is on the PR at the start as seen and reports the first newcomer', async () => {
    // ARRANGE
    const before = open({ comments: [{ id: 'c1', body: 'earlier' }] });
    const after = open({
      comments: [
        { id: 'c1', body: 'earlier' },
        { id: 'c2', body: 'new one' },
      ],
    });
    // ACT
    const outcome = await watch([before, before, after]);
    // ASSERT
    expect(outcome).toEqual({ exit: 3, line: 'new one' });
    expect(idsOf(after).size).toBe(2);
  });

  it('survives one failed poll and then reports the merge', async () => {
    // ARRANGE
    const views = [open(), open(), open({ state: 'MERGED', mergeCommit: { oid: 'f00' } })];
    let calls = 0;
    // ACT
    const outcome = await watchPullRequest({
      view: () => (calls++ === 1 ? { error: 'network' } : (views.shift() ?? open())),
      sleep: () => Promise.resolve(),
      timing: { pollMilliseconds: 1 },
    });
    // ASSERT
    expect(outcome).toEqual({ exit: 0, line: 'merged f00' });
  });
});

describe('judgeIntegration', () => {
  const view = (over: Partial<PullRequestView> = {}) => open({ mergeable: 'MERGEABLE', checks: [], ...over });

  it('ends 12 on merge listing nothing itself, 13 on close', () => {
    // ARRANGE
    // ACT
    const verdicts = [
      judgeIntegration(view({ state: 'MERGED', mergeCommit: { oid: 'abc' } })),
      judgeIntegration(view({ state: 'CLOSED' })),
    ];
    // ASSERT
    expect(verdicts).toEqual([
      { exit: 12, line: 'merged abc' },
      { exit: 13, line: 'closed' },
    ]);
  });

  it('ends 11 on a merge conflict and 10 naming the failing checks', () => {
    // ARRANGE
    const conflict = view({ mergeable: 'CONFLICTING' });
    const red = view({
      checks: [
        { name: 'lint', conclusion: 'FAILURE' },
        { name: 'test', conclusion: 'SUCCESS' },
        { name: 'build', state: 'ERROR' },
      ],
    });
    // ACT
    const verdicts = [judgeIntegration(conflict), judgeIntegration(red)];
    // ASSERT
    expect(verdicts[0]).toEqual({
      exit: 11,
      line: 'merge conflict with the base branch',
    });
    expect(verdicts[1]).toEqual({
      exit: 10,
      line: 'failing checks: lint, build',
    });
  });

  it('keeps waiting on pending checks, unknown mergeability and green', () => {
    // ARRANGE
    const pending = view({
      checks: [{ name: 'lint', status: 'IN_PROGRESS', conclusion: '' }],
    });
    const unknown = view({ mergeable: 'UNKNOWN' });
    // ACT
    const verdicts = [judgeIntegration(pending), judgeIntegration(unknown), judgeIntegration(view())];
    // ASSERT
    expect(verdicts).toEqual([null, null, null]);
  });
});

describe('tickets', () => {
  it('reads Closes numbers from a PR body, once each', () => {
    // ARRANGE
    const body = 'Closes #3\nCloses #4\nclosed #3\nRefs #9';
    // ACT
    const numbers = closesIn(body);
    // ASSERT
    expect(numbers).toEqual([3, 4]);
  });

  it('lists the still open tickets, or says all are closed', () => {
    // ARRANGE
    // ACT
    const lines = [ticketsLine([4, 7]), ticketsLine([])];
    // ASSERT
    expect(lines).toEqual(['tickets still open: #4, #7', 'all tickets closed']);
  });
});
