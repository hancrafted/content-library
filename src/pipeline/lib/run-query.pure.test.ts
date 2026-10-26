import { describe, expect, it } from 'vitest';
import { fold, type RunLogLine } from './run-log.pure.ts';
import { queryRuns, runsCsv } from './run-query.pure.ts';

/*
 * The run query seam: folded spans and scores in, SQL answers and the runs CSV out.
 * The in-memory database is real; nothing here touches the disk or the clock.
 */

const T = 'a'.repeat(32);
const T2 = 'e'.repeat(32);
const ID = (n: number): string => n.toString(16).padStart(16, '0');
const line = (seq: number, t: string, rest: Partial<RunLogLine>): RunLogLine =>
  ({ seq, t, trace_id: T, ...rest }) as RunLogLine;

const RUN_ONE: RunLogLine[] = [
  line(1, '2026-10-14T09:00:00Z', { kind: 'start-run', span_id: ID(1), run_id: 'run-1', harness: 'claude-code' }),
  line(2, '2026-10-14T09:00:10Z', {
    kind: 'start',
    span_id: ID(2),
    parent_span_id: ID(1),
    type: 'job',
    name: 'write',
    job: 'write',
  }),
  line(3, '2026-10-14T09:00:20Z', {
    kind: 'start',
    span_id: ID(3),
    parent_span_id: ID(2),
    type: 'attempt',
    name: 'write#1',
    job: 'write',
    attempt: 1,
  }),
  line(4, '2026-10-14T09:00:30Z', {
    kind: 'start',
    span_id: ID(4),
    parent_span_id: ID(3),
    type: 'agent',
    name: 'write#1/implementor',
    job: 'write',
    attempt: 1,
    role: 'implementor',
    'gen_ai.request.model': 'inherit',
  }),
  line(5, '2026-10-14T09:01:30Z', {
    kind: 'end',
    span_id: ID(4),
    status: 'ok',
    'gen_ai.response.model': 'sonnet',
    'gen_ai.usage.input_tokens': 100,
    'gen_ai.usage.output_tokens': 20,
    'gen_ai.usage.cache_read.input_tokens': 4000,
  }),
  line(6, '2026-10-14T09:01:40Z', {
    kind: 'score',
    span_id: ID(3),
    name: 'rubric',
    value: 'fail',
    source: 'agent:write/reviewer',
    rubric: 'The Answer answers the h1 question.',
  }),
  line(7, '2026-10-14T09:01:50Z', { kind: 'end', span_id: ID(3), status: 'error' }),
  line(8, '2026-10-14T09:02:00Z', {
    kind: 'start',
    span_id: ID(5),
    parent_span_id: ID(2),
    type: 'attempt',
    name: 'write#2',
    job: 'write',
    attempt: 2,
    retry_of: ID(3),
  }),
  line(9, '2026-10-14T09:02:10Z', {
    kind: 'start',
    span_id: ID(6),
    parent_span_id: ID(5),
    type: 'agent',
    name: 'write#2/implementor',
    job: 'write',
    attempt: 2,
    role: 'implementor',
    'gen_ai.request.model': 'inherit',
  }),
  line(10, '2026-10-14T09:03:10Z', {
    kind: 'end',
    span_id: ID(6),
    status: 'ok',
    'gen_ai.response.model': 'opus',
    'gen_ai.usage.input_tokens': 300,
    'gen_ai.usage.output_tokens': 50,
  }),
];
const RUN_TWO: RunLogLine[] = [
  line(1, '2026-10-15T09:00:00Z', {
    kind: 'start-run',
    span_id: ID(11),
    run_id: 'run-2',
    harness: 'copilot',
    trace_id: T2,
  }),
  line(2, '2026-10-15T09:00:10Z', {
    kind: 'start',
    span_id: ID(12),
    parent_span_id: ID(11),
    type: 'agent',
    name: 'plan, "quoted"',
    job: 'plan',
    attempt: 1,
    role: 'implementor',
    trace_id: T2,
  }),
];

const ONE = { episode: 'alpha', folded: fold(RUN_ONE) };
const TWO = { episode: 'beta', folded: fold(RUN_TWO) };
describe('success cases', () => {
  it('answers SQL over the spans table across two logs', () => {
    // ARRANGE
    const sql = "SELECT episode, count(*) AS n FROM spans WHERE type = 'agent' GROUP BY episode ORDER BY episode";
    const expected = {
      ok: true,
      columns: ['episode', 'n'],
      rows: [
        { episode: 'alpha', n: 2 },
        { episode: 'beta', n: 1 },
      ],
    };
    // ACT
    const result = queryRuns([ONE, TWO], sql);
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('compares the model asked for with the model an agent ran on, and sums tokens by model', () => {
    // ARRANGE
    const sql =
      "SELECT gen_ai_request_model AS asked, gen_ai_response_model AS ran, sum(gen_ai_usage_input_tokens + gen_ai_usage_output_tokens) AS tokens FROM spans WHERE role = 'implementor' AND status = 'ok' GROUP BY 1, 2 ORDER BY ran";
    const expected = {
      ok: true,
      columns: ['asked', 'ran', 'tokens'],
      rows: [
        { asked: 'inherit', ran: 'opus', tokens: 350 },
        { asked: 'inherit', ran: 'sonnet', tokens: 120 },
      ],
    };
    // ACT
    const result = queryRuns([ONE], sql);
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('counts the failed rubric lines from the scores table, and holds only the selected columns', () => {
    // ARRANGE
    const sql = "SELECT rubric, count(*) AS fails FROM scores WHERE name = 'rubric' AND value = 'fail' GROUP BY rubric";
    const expected = {
      ok: true,
      columns: ['rubric', 'fails'],
      rows: [{ rubric: 'The Answer answers the h1 question.', fails: 1 }],
    };
    // ACT
    const result = queryRuns([ONE, TWO], sql);
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('generates the runs CSV from the agent spans, quoting fields and naming a failed rubric', () => {
    // ARRANGE
    const expected = [
      'run,episode,job,agent,attempt,result,failed_rubric,duration_s,tokens,cache_read_tokens,at',
      'run-1,alpha,write,implementor,1,fail,The Answer answers the h1 question.,60,120,4000,2026-10-14T09:01:30Z',
      'run-1,alpha,write,implementor,2,pass,,60,350,,2026-10-14T09:03:10Z',
      'run-2,beta,plan,implementor,1,crashed,,,,,',
      '',
    ].join('\n');
    // ACT
    const csv = runsCsv([ONE, TWO]);
    // ASSERT
    expect(csv).toBe(expected);
  });
  describe('orchestrator Job rows and score tickets', () => {
    const JOB: RunLogLine[] = [
      line(1, '2026-10-14T09:00:00Z', { kind: 'start-run', span_id: ID(1), run_id: 'run-9', harness: 'claude-code' }),
      line(2, '2026-10-14T09:00:10Z', {
        kind: 'start',
        span_id: ID(2),
        parent_span_id: ID(1),
        type: 'job',
        name: 'write',
        job: 'write',
      }),
      line(3, '2026-10-14T09:02:10Z', {
        kind: 'end',
        span_id: ID(2),
        status: 'ok',
        'gen_ai.usage.input_tokens': 30,
        'gen_ai.usage.output_tokens': 12,
      }),
      line(4, '2026-10-14T09:02:20Z', {
        kind: 'score',
        span_id: ID(2),
        name: 'check',
        value: 'pass',
        source: 'check:x',
        ticket: 176,
      }),
    ];

    it('lists a Job that has measured usage as an orchestrator row of the runs CSV', () => {
      // ARRANGE
      const row = 'run-9,ep,write,orchestrator,,pass,,120,42,';
      // ACT
      const csv = runsCsv([{ episode: 'ep', folded: fold(JOB) }]);
      // ASSERT
      expect(csv.split('\n')[1]).toContain(row);
    });

    it('exposes the Score ticket to queries', () => {
      // ARRANGE
      const ticket = 176;
      // ACT
      const result = queryRuns([{ episode: 'ep', folded: fold(JOB) }], 'SELECT ticket FROM scores');
      // ASSERT
      expect(result).toEqual({ ok: true, columns: ['ticket'], rows: [{ ticket }] });
    });
  });

  describe('skills_invoked column', () => {
    it('exposes the invoked skills of a span as a comma list', () => {
      // ARRANGE
      const lines = [
        {
          kind: 'start',
          t: '2026-10-14T10:00:00Z',
          seq: 1,
          trace_id: 'a'.repeat(32),
          span_id: 'b'.repeat(16),
          type: 'job',
          name: 'j',
          parent_span_id: 'c'.repeat(16),
        },
        {
          kind: 'end',
          t: '2026-10-14T10:01:00Z',
          seq: 2,
          trace_id: 'a'.repeat(32),
          span_id: 'b'.repeat(16),
          status: 'ok',
          skills_invoked: ['tdd', 'x:y'],
        },
      ] as RunLogLine[];
      // ACT
      const result = queryRuns([{ episode: 'ep', folded: fold(lines) }], 'SELECT skills_invoked FROM spans');
      // ASSERT
      expect(result).toEqual({ ok: true, columns: ['skills_invoked'], rows: [{ skills_invoked: 'tdd,x:y' }] });
    });
  });
});

describe('failure cases', () => {
  it('reports invalid SQL instead of throwing', () => {
    // ARRANGE
    const sql = 'SELECT nope FROM spans';
    // ACT
    const result = queryRuns([ONE], sql);
    // ASSERT
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining('nope') });
  });

  it('refuses a statement that is not a read', () => {
    // ARRANGE
    const sql = 'DROP TABLE spans';
    const expected = { ok: false, error: 'only SELECT or WITH queries are allowed' };
    // ACT
    const result = queryRuns([ONE], sql);
    // ASSERT
    expect(result).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('answers with no rows over no logs', () => {
    // ARRANGE
    const expected = { ok: true, columns: ['id'], rows: [] };
    // ACT
    const result = queryRuns([], 'SELECT span_id AS id FROM spans');
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('writes only the header for no logs', () => {
    // ARRANGE
    const expected = 'run,episode,job,agent,attempt,result,failed_rubric,duration_s,tokens,cache_read_tokens,at\n';
    // ACT
    const csv = runsCsv([]);
    // ASSERT
    expect(csv).toBe(expected);
  });

  it('quotes a comma or a double quote in a field when it reaches the CSV', () => {
    // ARRANGE
    const sources = [{ episode: 'a,b', folded: fold(RUN_TWO) }];
    const expected = 'run-2,"a,b",plan,implementor,1,crashed,,,,,';
    // ACT
    const row = runsCsv(sources).split('\n')[1];
    // ASSERT
    expect(row).toBe(expected);
  });

  it('counts a failed Attempt rubric against a ticket-implementor nested under that Attempt', () => {
    // ARRANGE
    const lines = RUN_ONE.map((l) => (l.span_id === ID(4) ? { ...l, role: 'ticket-implementor' } : l)) as RunLogLine[];
    // ACT
    const row = runsCsv([{ episode: 'alpha', folded: fold(lines) }]).split('\n')[1];
    // ASSERT
    expect(row).toContain(',ticket-implementor,1,fail,');
  });

  it('keeps the rows of Runs no log holds and regenerates the rows of Runs the logs hold', () => {
    // ARRANGE
    const existing = [
      'run,episode,job,agent,attempt,result,failed_rubric,duration_s,tokens,cache_read_tokens,at',
      '2026-10-12T19:22:40Z,old,brief-grill,implementor,1,pass,"a, b",1043,,,2026-10-12T19:40:03Z',
      'run-1,alpha,stale,implementor,9,pass,,1,1,,x',
      '',
    ].join('\n');
    const expectedLength = 5;
    // ACT
    const rows = runsCsv([ONE], existing).split('\n');
    // ASSERT
    expect(rows[1]).toBe('2026-10-12T19:22:40Z,old,brief-grill,implementor,1,pass,"a, b",1043,,,2026-10-12T19:40:03Z');
    expect(rows).toHaveLength(expectedLength);
    expect(rows.join('\n')).not.toContain('stale');
  });

  it('keeps a row of a CSV written before cache_read_tokens under the columns its header names', () => {
    // ARRANGE
    const existing =
      'run,episode,job,agent,attempt,result,failed_rubric,duration_s,tokens,at\nold-run,old,write,implementor,1,pass,,5,77,2026-10-01T00:00:00Z\n';
    const expected = 'old-run,old,write,implementor,1,pass,,5,77,,2026-10-01T00:00:00Z';
    // ACT
    const row = runsCsv([ONE], existing).split('\n')[1];
    // ASSERT
    expect(row).toBe(expected);
  });

  it('treats an old row stamped with the Run start time as the same Run as its run_id', () => {
    // ARRANGE
    const existing =
      'run,episode,job,agent,attempt,result,failed_rubric,duration_s,tokens,cache_read_tokens,at\n2026-10-14T09-00-00Z,alpha,old,implementor,1,pass,,1,1,,x\n';
    const source = {
      episode: 'alpha',
      folded: fold(
        RUN_ONE.map((l) => (l.kind === 'start-run' ? { ...l, run_id: '2026-10-14T09-00-00Z' } : l)) as RunLogLine[],
      ),
    };
    // ACT
    const csv = runsCsv([source], existing);
    // ASSERT
    expect(csv).not.toContain(',old,');
  });

  it('allows a leading comment and lower-case WITH', () => {
    // ARRANGE
    const sql = '-- how many\nwith n as (select count(*) as c from spans) select c from n';
    const expected = { ok: true, columns: ['c'], rows: [{ c: 6 }] };
    // ACT
    const result = queryRuns([ONE], sql);
    // ASSERT
    expect(result).toEqual(expected);
  });
});
