import { describe, expect, it } from 'vitest';
import { analyzeLoad, type SessionLog } from './load.pure.ts';

const WINDOW = { since: new Date('2026-11-15T08:00:00Z'), until: new Date('2026-11-16T08:00:00Z') };

/** An assistant line calling Bash with `command`, as Claude Code logs it. */
function bash(id: string, timestamp: string, command: string): string {
  return JSON.stringify({
    type: 'assistant',
    timestamp,
    message: { content: [{ type: 'tool_use', id, name: 'Bash', input: { command } }] },
  });
}

/** A user line carrying the result of tool call `id`, as Claude Code logs it. */
function resultLine({
  id,
  timestamp,
  text,
  isError,
}: {
  id: string;
  timestamp: string;
  text: string;
  isError: boolean;
}) {
  return JSON.stringify({
    type: 'user',
    timestamp,
    message: { content: [{ type: 'tool_result', tool_use_id: id, content: text, is_error: isError }] },
  });
}

/** The result of tool call `id` that succeeded with `text`. */
function result(id: string, timestamp: string, text: string): string {
  return resultLine({ id, timestamp, text, isError: false });
}

/** The result of tool call `id` that failed with `text`. */
function failed(id: string, timestamp: string, text: string): string {
  return resultLine({ id, timestamp, text, isError: true });
}

describe('success cases', () => {
  it('reports each verify step’s durations as p50, p90 and max in seconds', () => {
    // ARRANGE
    const logs: SessionLog[] = [
      {
        subagent: false,
        lines: [
          bash('a', '2026-11-15T09:00:00Z', 'npm run verify:quick'),
          result('a', '2026-11-15T09:01:00Z', '✔ lint (2.0s)\n✔ typecheck (10.0s)\n✔ verify:quick: PASS'),
          bash('b', '2026-11-15T10:00:00Z', 'npm run verify:quick'),
          result('b', '2026-11-15T10:01:00Z', '✔ typecheck (46.0s)\n✖ test (30.5s)\nFAIL output'),
        ],
      },
      {
        subagent: true,
        lines: [
          bash('c', '2026-11-15T11:00:00Z', 'npm run verify:quick'),
          result('c', '2026-11-15T11:01:00Z', '✔ typecheck (20.0s)'),
        ],
      },
    ];
    const expected = {
      lint: { runs: 1, p50: 2, p90: 2, max: 2 },
      test: { runs: 1, p50: 30.5, p90: 30.5, max: 30.5 },
      typecheck: { runs: 3, p50: 20, p90: 46, max: 46 },
    };
    // ACT
    const report = analyzeLoad(logs, WINDOW);
    // ASSERT
    expect(report.steps).toEqual(expected);
  });

  it('counts failed hooks by hook, and timed-out tests by test file', () => {
    // ARRANGE
    const staging = 'tests/docs/episode-staging.test.ts';
    const tour = 'src/explorables/software-ecology/factory-tour.pure.test.ts';
    const commitOutput = [
      ' ❯ tests/docs/episode-staging.test.ts (20 tests | 2 failed) 54960ms',
      `     × finds no disagreement 9061ms`,
      ` FAIL  ${staging} > success cases > finds no disagreement`,
      'Error: Test timed out in 5000ms.',
      ` FAIL  ${staging} > success cases > finds every pipeline well formed`,
      'Error: Test timed out in 5000ms.',
      ` FAIL  ${tour} > success cases > tire ai-spiral`,
      'AssertionError: expected 3 to be 4',
      '✖ verify:commit: FAIL in test',
      'husky - pre-commit script failed (code 1)',
    ].join('\n');
    const pushOutput = [
      ` FAIL  ${tour} > success cases > tire clear-requirements`,
      'Error: Test timed out in 5000ms.',
      'husky - pre-push script failed (code 1)',
    ].join('\n');
    const logs: SessionLog[] = [
      {
        subagent: true,
        lines: [
          bash('a', '2026-11-15T09:00:00Z', 'git commit -m "feat: x"'),
          failed('a', '2026-11-15T09:02:00Z', commitOutput),
          bash('b', '2026-11-15T09:10:00Z', 'git push'),
          failed('b', '2026-11-15T09:15:00Z', pushOutput),
        ],
      },
    ];
    const expected = {
      hookFailures: { 'pre-commit': 1, 'pre-push': 1 },
      timeouts: { [staging]: 2, [tour]: 1 },
    };
    // ACT
    const report = analyzeLoad(logs, WINDOW);
    // ASSERT
    expect({ hookFailures: report.hookFailures, timeouts: report.timeouts }).toEqual(expected);
  });

  it('counts commits, pushes and verify runs by main session and subagent, with how long each took', () => {
    // ARRANGE
    const logs: SessionLog[] = [
      {
        subagent: false,
        lines: [
          bash('a', '2026-11-15T09:00:00Z', 'git commit -F msg.txt'),
          result('a', '2026-11-15T09:01:00Z', '[main abc123] feat: x'),
          bash('b', '2026-11-15T09:05:00Z', 'npm run verify 2>&1 | tail -20'),
          result('b', '2026-11-15T09:08:20Z', '✔ verify: PASS'),
        ],
      },
      {
        subagent: true,
        lines: [
          bash('c', '2026-11-15T10:00:00Z', 'cd /repo/.worktrees/x && git commit -m "fix: y"'),
          failed('c', '2026-11-15T10:02:00Z', 'husky - pre-commit script failed (code 1)'),
          bash('d', '2026-11-15T10:10:00Z', 'git -C /repo commit -m "fix: y"'),
          result('d', '2026-11-15T10:13:20Z', '[x def456] fix: y'),
          bash('e', '2026-11-15T10:20:00Z', 'git push -u origin x'),
          result('e', '2026-11-15T10:20:30Z', 'branch set up to track'),
          bash('f', '2026-11-15T10:30:00Z', 'npm run verify:quick'),
          result('f', '2026-11-15T10:30:40Z', '✔ verify:quick: PASS'),
        ],
      },
    ];
    const expected = {
      commit: { main: 1, subagent: 2, failed: 1, took: { runs: 3, p50: 120, p90: 200, max: 200 } },
      push: { main: 0, subagent: 1, failed: 0, took: { runs: 1, p50: 30, p90: 30, max: 30 } },
      verify: { main: 1, subagent: 0, failed: 0, took: { runs: 1, p50: 200, p90: 200, max: 200 } },
      'verify:quick': { main: 0, subagent: 1, failed: 0, took: { runs: 1, p50: 40, p90: 40, max: 40 } },
    };
    // ACT
    const report = analyzeLoad(logs, WINDOW);
    // ASSERT
    expect(report.commands).toEqual(expected);
  });

  it('reports the most logs open at once, and the most main sessions open at once', () => {
    // ARRANGE
    /** A log stamped once at `from` and once at `to`. */
    const span = (subagent: boolean, from: string, to: string): SessionLog => ({
      subagent,
      lines: [JSON.stringify({ type: 'user', timestamp: from }), JSON.stringify({ type: 'user', timestamp: to })],
    });
    const logs = [
      span(false, '2026-11-15T09:00:00Z', '2026-11-15T12:00:00Z'),
      span(false, '2026-11-15T10:00:00Z', '2026-11-15T11:00:00Z'),
      span(true, '2026-11-15T10:30:00Z', '2026-11-15T10:45:00Z'),
      span(true, '2026-11-15T13:00:00Z', '2026-11-15T14:00:00Z'),
    ];
    const expected = { all: 3, main: 2 };
    // ACT
    const report = analyzeLoad(logs, WINDOW);
    // ASSERT
    expect(report.peak).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('skips a line that is not JSON and keeps reading the log', () => {
    // ARRANGE
    const logs: SessionLog[] = [
      {
        subagent: false,
        lines: ['{"type":"user","timest', result('a', '2026-11-15T09:01:00Z', '✔ lint (2.0s)')],
      },
    ];
    const expected = { lint: { runs: 1, p50: 2, p90: 2, max: 2 } };
    // ACT
    const report = analyzeLoad(logs, WINDOW);
    // ASSERT
    expect(report.steps).toEqual(expected);
  });

  it('counts a call whose result was never logged, without a duration', () => {
    // ARRANGE
    const logs: SessionLog[] = [{ subagent: true, lines: [bash('a', '2026-11-15T09:00:00Z', 'git push')] }];
    const expected = { main: 0, subagent: 1, failed: 0, took: { runs: 0, p50: 0, p90: 0, max: 0 } };
    // ACT
    const report = analyzeLoad(logs, WINDOW);
    // ASSERT
    expect(report.commands.push).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('ignores lines stamped outside the window', () => {
    // ARRANGE
    const logs: SessionLog[] = [
      {
        subagent: false,
        lines: [
          bash('a', '2026-11-15T07:59:00Z', 'git commit -m x'),
          failed('a', '2026-11-15T07:59:30Z', 'husky - pre-commit script failed (code 1)'),
          result('b', '2026-11-16T08:00:01Z', '✔ lint (2.0s)'),
        ],
      },
    ];
    const expected = { steps: {}, hookFailures: {}, commits: 0, peak: { all: 0, main: 0 } };
    // ACT
    const report = analyzeLoad(logs, WINDOW);
    // ASSERT
    expect({
      steps: report.steps,
      hookFailures: report.hookFailures,
      commits: report.commands.commit.main,
      peak: report.peak,
    }).toEqual(expected);
  });

  it('does not count a log that opens the moment another closes as running beside it', () => {
    // ARRANGE
    const stamped = (timestamp: string) => JSON.stringify({ type: 'user', timestamp });
    const logs: SessionLog[] = [
      { subagent: false, lines: [stamped('2026-11-15T09:00:00Z'), stamped('2026-11-15T10:00:00Z')] },
      { subagent: false, lines: [stamped('2026-11-15T10:00:00Z'), stamped('2026-11-15T11:00:00Z')] },
    ];
    const expected = { all: 1, main: 1 };
    // ACT
    const report = analyzeLoad(logs, WINDOW);
    // ASSERT
    expect(report.peak).toEqual(expected);
  });

  it('counts a background verify run without timing it, as its result arrives before the run ends', () => {
    // ARRANGE
    const background = JSON.stringify({
      type: 'assistant',
      timestamp: '2026-11-15T09:00:00Z',
      message: {
        content: [
          { type: 'tool_use', id: 'a', name: 'Bash', input: { command: 'npm run verify', run_in_background: true } },
        ],
      },
    });
    const logs: SessionLog[] = [
      { subagent: false, lines: [background, result('a', '2026-11-15T09:00:01Z', 'Command running in background')] },
    ];
    const expected = { main: 1, subagent: 0, failed: 0, took: { runs: 0, p50: 0, p90: 0, max: 0 } };
    // ACT
    const report = analyzeLoad(logs, WINDOW);
    // ASSERT
    expect(report.commands.verify).toEqual(expected);
  });
});
