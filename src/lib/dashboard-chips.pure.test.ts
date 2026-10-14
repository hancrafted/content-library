import { describe, expect, it } from 'vitest';
import { fold } from '../../skills/new-episode/scripts/run-log.pure';
import type { RunLogLine } from '../../skills/new-episode/scripts/run-log.schema.pure';
import type { DashboardEvent } from './dashboard-events.pure';
import { parseDashboardPipeline, projectDashboard } from './dashboard-projection.pure';
import { replayDashboard } from './dashboard-replay.pure';

/*
 * Monitoring chips per Job (design-ADR 0009): every skill and check `pipeline.yml` names for a Job, read from the
 * Job's current Run and latest Attempt through the projection the dashboard renders, and through the replay cutoff.
 */

const RUN_START = Date.parse('2026-10-14T10:00:00Z');
const minute = (count: number) => new Date(RUN_START + count * 60_000).toISOString();

const implementor = { type: 'implementor', skills: ['research', 'tdd'], references: [], model: 'opus' };
const reviewer = { type: 'reviewer', skills: ['tdd'], references: [], model: 'sonnet', rubric: 'r.md' };
const pipeline = parseDashboardPipeline(
  JSON.stringify({
    status: 'approved',
    jobs: [
      { id: 'write', needs: [], outputs: [], checks: ['mh', 'vitest'], retries: 2, agents: [implementor, reviewer] },
    ],
  }),
);

type Fields = Omit<RunLogLine, 't' | 'seq' | 'trace_id'> & { trace_id?: string };
const lines = (...entries: [number, Fields][]): RunLogLine[] =>
  entries.map(
    ([time, fields], index) => ({ trace_id: 'trace', ...fields, t: minute(time), seq: index + 1 }) as RunLogLine,
  );
const toEvents = (log: RunLogLine[]): DashboardEvent[] =>
  log.map((line, index) => ({ number: index + 1, raw: JSON.stringify(line), line }));

const runStart: Fields = { kind: 'start-run', span_id: 'run', run_id: 'run-1' };
const jobStart: Fields = {
  kind: 'start',
  span_id: 'write',
  type: 'job',
  name: 'write',
  job: 'write',
  parent_span_id: 'run',
};
const attempt = (n: number): Fields => ({
  kind: 'start',
  span_id: `attempt-${n}`,
  type: 'attempt',
  name: `write#${n}`,
  job: 'write',
  attempt: n,
  parent_span_id: 'write',
});
const agent = (id: string, role: string, parent: string): Fields => ({
  kind: 'start',
  span_id: id,
  type: 'agent',
  name: `write/${role}`,
  job: 'write',
  role,
  parent_span_id: parent,
});
const skill = (span_id: string, name: string): Fields => ({ kind: 'skill', span_id, name, source: 'measured' });
const check = (span_id: string, name: string, value: string): Fields => ({
  kind: 'score',
  span_id,
  name: 'check',
  value,
  source: `check:${name}`,
});
const ended = (span_id: string, skills_invoked?: string[]): Fields =>
  ({ kind: 'end', span_id, status: 'ok', ...(skills_invoked && { skills_invoked }) }) as Fields;

const chipsOf = (log: RunLogLine[]) => {
  const job = projectDashboard(pipeline, fold(log, { live: 'unfinished' })).jobs[0];
  return {
    skills: job.chips.skills.map((chip) => `${chip.name}:${chip.state}`),
    checks: job.chips.checks.map((chip) => `${chip.name}:${chip.state}`),
  };
};

describe('success cases', () => {
  it('lists every skill once and every check, pending before the Job has run', () => {
    // ARRANGE
    const expected = { skills: ['research:pending', 'tdd:pending'], checks: ['mh:pending', 'vitest:pending'] };
    // ACT
    const chips = chipsOf(lines([0, runStart]));
    // ASSERT
    expect(chips).toEqual(expected);
  });

  it('marks a skill run on a live skill line and a check by its latest Score', () => {
    // ARRANGE
    const log = lines(
      [0, runStart],
      [1, jobStart],
      [1, attempt(1)],
      [2, agent('impl', 'implementor', 'attempt-1')],
      [3, skill('impl', 'tdd')],
      [4, check('write', 'mh', 'fail')],
      [5, check('write', 'mh', 'pass')],
      [5, check('write', 'vitest', 'fail')],
    );
    const expected = { skills: ['research:pending', 'tdd:run'], checks: ['mh:pass', 'vitest:fail'] };
    // ACT
    const chips = chipsOf(log);
    // ASSERT
    expect(chips).toEqual(expected);
  });

  it('marks a skill run from skills_invoked on an ended agent, and the agents it groups under', () => {
    // ARRANGE
    const log = lines(
      [0, runStart],
      [1, jobStart],
      [2, agent('impl', 'implementor', 'write')],
      [3, ended('impl', ['research', 'tdd'])],
    );
    const expected = [
      { name: 'research', state: 'run', agents: ['implementor'] },
      { name: 'tdd', state: 'run', agents: ['implementor', 'reviewer'] },
    ];
    // ACT
    const job = projectDashboard(pipeline, fold(log, { live: 'unfinished' })).jobs[0];
    // ASSERT
    expect(job.chips.skills).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('marks a skill skipped once every agent it is listed for ended knowing its skills and none named it', () => {
    // ARRANGE
    const log = lines(
      [0, runStart],
      [1, jobStart],
      [2, agent('impl', 'implementor', 'write')],
      [3, ended('impl', ['tdd'])],
    );
    const expected = { skills: ['research:skipped', 'tdd:run'], checks: ['mh:pending', 'vitest:pending'] };
    // ACT
    const chips = chipsOf(log);
    // ASSERT
    expect(chips).toEqual(expected);
  });

  it('keeps a skill pending when the agent ended without a readable transcript', () => {
    // ARRANGE
    const log = lines([0, runStart], [1, jobStart], [2, agent('impl', 'implementor', 'write')], [3, ended('impl')]);
    const expected = ['research:pending', 'tdd:pending'];
    // ACT
    const chips = chipsOf(log);
    // ASSERT
    expect(chips.skills).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('reads only the latest Attempt: a retry starts its chips over', () => {
    // ARRANGE
    const log = lines(
      [0, runStart],
      [1, jobStart],
      [1, attempt(1)],
      [2, agent('impl-1', 'implementor', 'attempt-1')],
      [3, skill('impl-1', 'tdd')],
      [4, check('attempt-1', 'mh', 'fail')],
      [5, ended('impl-1', ['tdd'])],
      [6, attempt(2)],
      [7, agent('impl-2', 'implementor', 'attempt-2')],
      [8, skill('impl-2', 'research')],
    );
    const expected = { skills: ['research:run', 'tdd:pending'], checks: ['mh:pending', 'vitest:pending'] };
    // ACT
    const chips = chipsOf(log);
    // ASSERT
    expect(chips).toEqual(expected);
  });

  it('reads only the current Run: an earlier Run that passed leaves the chips pending', () => {
    // ARRANGE
    const earlier = lines(
      [0, runStart],
      [1, jobStart],
      [2, check('write', 'mh', 'pass')],
      [3, { kind: 'end', span_id: 'write', status: 'ok' } as Fields],
      [4, { kind: 'end-run', span_id: 'run', status: 'ok' } as Fields],
    );
    const later = lines(
      [10, { ...runStart, span_id: 'run-2', run_id: 'run-2', trace_id: 'trace-2' }],
      [
        11,
        {
          ...jobStart,
          span_id: 'write-2',
          parent_span_id: 'run-2',
          trace_id: 'trace-2',
        },
      ],
    ).map((line) => ({ ...line, seq: line.seq + earlier.length }));
    const expected = ['mh:pending', 'vitest:pending'];
    // ACT
    const chips = chipsOf([...earlier, ...later]);
    // ASSERT
    expect(chips.checks).toEqual(expected);
  });

  it('respects the replay cutoff: a skill line and a Score after it are not yet seen', () => {
    // ARRANGE
    const log = lines(
      [0, runStart],
      [1, jobStart],
      [2, agent('impl', 'implementor', 'write')],
      [3, skill('impl', 'tdd')],
      [6, skill('impl', 'research')],
      [7, check('write', 'mh', 'pass')],
    );
    const cutoff = RUN_START + 4 * 60_000;
    const expected = { skills: ['research:pending', 'tdd:run'], checks: ['mh:pending', 'vitest:pending'] };
    // ACT
    const job = replayDashboard(pipeline, toEvents(log), cutoff).jobs[0];
    const chips = {
      skills: job.chips.skills.map((chip) => `${chip.name}:${chip.state}`),
      checks: job.chips.checks.map((chip) => `${chip.name}:${chip.state}`),
    };
    // ASSERT
    expect(chips).toEqual(expected);
  });
});
