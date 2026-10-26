import { describe, expect, it } from 'vitest';
import { parseDashboardPipeline, projectDashboard } from './dashboard-projection.pure';
import { fold } from './run-log.pure';
import type { RunLogLine } from './run-log.schema.pure';

/*
 * Monitoring chips per Job (design-ADR 0009): every skill and check `pipeline.yml` names for a Job, read from the
 * Job's current Run and latest Attempt through the projection the dashboard renders. The replay cutoff's share is
 * tested through the Dashboard timeline.
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

const orchestrated = parseDashboardPipeline(
  JSON.stringify({
    status: 'approved',
    jobs: [
      {
        id: 'write',
        needs: [],
        outputs: [],
        checks: [],
        retries: 2,
        agents: [
          { ...implementor, skills: ['grilling'], session: 'orchestrator' },
          { ...reviewer, skills: ['grilling'] },
        ],
      },
    ],
  }),
);

type Fields = Omit<RunLogLine, 't' | 'seq' | 'trace_id'> & { trace_id?: string };
const lines = (...entries: [number, Fields][]): RunLogLine[] =>
  entries.map(
    ([time, fields], index) => ({ trace_id: 'trace', ...fields, t: minute(time), seq: index + 1 }) as RunLogLine,
  );
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
const skill = (span_id: string, name: string): Fields => ({
  kind: 'event',
  span_id,
  name: 'skill.invoke',
  source: 'measured',
  attributes: { 'skill.name': name },
});
const check = (span_id: string, name: string, value: string): Fields => ({
  kind: 'score',
  span_id,
  name: 'check',
  value,
  source: `check:${name}`,
});
const ended = (span_id: string, skills_invoked?: string[]): Fields =>
  ({ kind: 'end', span_id, status: 'ok', ...(skills_invoked && { skills_invoked }) }) as Fields;

/** Each agent row as `<type>:<skill>=<state>`, then the Job box's aggregate as `job:<skill>=<state>`. */
const rowsOf = (log: RunLogLine[], source = pipeline) => {
  const { chips } = projectDashboard(source, fold(log, { live: 'unfinished' })).jobs[0];
  return [
    ...chips.agents.flatMap((row) => row.skills.map((chip) => `${row.type}:${chip.name}=${chip.state}`)),
    ...chips.skills.map((chip) => `job:${chip.name}=${chip.state}`),
  ];
};

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
    const expected = { skills: ['research:pending', 'tdd:pending'], checks: ['mh:pass', 'vitest:fail'] };
    const row = 'implementor:tdd=run';
    // ACT
    const chips = chipsOf(log);
    const rows = rowsOf(log);
    // ASSERT
    expect(chips).toEqual(expected);
    expect(rows).toContain(row);
  });

  it('reads each agent row on its own, the Job box green only once every agent listing a skill ran it', () => {
    // ARRANGE
    const log = lines(
      [0, runStart],
      [1, jobStart],
      [2, agent('impl', 'implementor', 'write')],
      [3, ended('impl', ['research', 'tdd'])],
    );
    const expected = [
      'implementor:research=run',
      'implementor:tdd=run',
      'reviewer:tdd=pending',
      'job:research=run',
      'job:tdd=pending',
    ];
    // ACT
    const rows = rowsOf(log);
    // ASSERT
    expect(rows).toEqual(expected);
  });

  it("counts the orchestrator's own skill calls on the Job span for its orchestrator-session agent only", () => {
    // ARRANGE
    const log = lines([0, runStart], [1, jobStart], [2, skill('write', 'grilling')]);
    const expected = ['implementor:grilling=run', 'reviewer:grilling=pending', 'job:grilling=pending'];
    // ACT
    const rows = rowsOf(log, orchestrated);
    // ASSERT
    expect(rows).toEqual(expected);
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
    const expected = { skills: ['research:skipped', 'tdd:pending'], checks: ['mh:pending', 'vitest:pending'] };
    // ACT
    const chips = chipsOf(log);
    // ASSERT
    expect(chips).toEqual(expected);
  });

  it('turns the Job box red when any agent listing a skill skipped it, though another ran it', () => {
    // ARRANGE
    const log = lines(
      [0, runStart],
      [1, jobStart],
      [2, agent('impl', 'implementor', 'write')],
      [3, ended('impl', ['tdd'])],
      [4, agent('rev', 'reviewer', 'write')],
      [5, ended('rev', [])],
    );
    const expected = [
      'implementor:research=skipped',
      'implementor:tdd=run',
      'reviewer:tdd=skipped',
      'job:research=skipped',
      'job:tdd=skipped',
    ];
    // ACT
    const rows = rowsOf(log);
    // ASSERT
    expect(rows).toEqual(expected);
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

  it("counts the Job span's skill calls only from the latest Attempt's start", () => {
    // ARRANGE
    const before = lines(
      [0, runStart],
      [1, jobStart],
      [1, attempt(1)],
      [2, skill('write', 'grilling')],
      [3, attempt(2)],
    );
    const after = lines(
      [0, runStart],
      [1, jobStart],
      [1, attempt(1)],
      [3, attempt(2)],
      [4, skill('write', 'grilling')],
    );
    const expected = { before: ['implementor:grilling=pending'], after: ['implementor:grilling=run'] };
    // ACT
    const rows = { before: rowsOf(before, orchestrated).slice(0, 1), after: rowsOf(after, orchestrated).slice(0, 1) };
    // ASSERT
    expect(rows).toEqual(expected);
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
});
