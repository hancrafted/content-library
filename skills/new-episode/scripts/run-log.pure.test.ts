import { describe, expect, it } from 'vitest';
import { fold, record, renderTree, type RunLogLine, type Stamp } from './run-log.pure.ts';

/*
 * The run event log's writer seam: an event and an explicit stamp in, one
 * validated line (or the reasons it is malformed) out.
 */

const TRACE = 'a'.repeat(32);
const RUN_SPAN = 'b'.repeat(16);
const JOB_SPAN = 'c'.repeat(16);
const STAMP: Stamp = { t: '2026-10-14T09:00:00Z', seq: 7, traceId: TRACE, spanId: JOB_SPAN };

describe('success cases', () => {
  it('stamps a start-run with clock, sequence and ids, and names it a workflow invocation', () => {
    // ARRANGE
    const event = {
      kind: 'start-run',
      run_id: '2026-10-14T09-00-00Z',
      template_sha: 'abc1234',
      harness: 'claude-code',
      branch: 'feat/x',
      'gen_ai.request.model': 'opus',
    };
    const expected = {
      kind: 'start-run',
      t: '2026-10-14T09:00:00Z',
      seq: 7,
      trace_id: TRACE,
      span_id: JOB_SPAN,
      'gen_ai.operation.name': 'invoke_workflow',
      run_id: '2026-10-14T09-00-00Z',
      template_sha: 'abc1234',
      harness: 'claude-code',
      branch: 'feat/x',
      'gen_ai.request.model': 'opus',
    };
    // ACT
    const result = record(event, STAMP);
    // ASSERT
    expect(result).toEqual({ ok: true, line: expected });
  });

  it('stamps a job start under the run, and an agent start as an agent invocation', () => {
    // ARRANGE
    const job = { kind: 'start', type: 'job', name: 'write-dossier', job: 'write-dossier', parent_span_id: RUN_SPAN };
    const agent = {
      kind: 'start',
      type: 'agent',
      name: 'write-dossier#2/reviewer',
      job: 'write-dossier',
      attempt: 2,
      role: 'reviewer',
      parent_span_id: JOB_SPAN,
      source: 'typed',
    };
    // ACT
    const jobResult = record(job, STAMP);
    const agentResult = record(agent, STAMP);
    // ASSERT
    expect(jobResult).toEqual({ ok: true, line: { ...job, t: STAMP.t, seq: 7, trace_id: TRACE, span_id: JOB_SPAN } });
    expect(agentResult).toMatchObject({
      ok: true,
      line: { 'gen_ai.operation.name': 'invoke_agent', attempt: 2, role: 'reviewer', source: 'typed' },
    });
  });
});

describe('failure cases', () => {
  it('rejects an unknown kind', () => {
    // ARRANGE
    const event = { kind: 'begin' };
    // ACT
    const result = record(event, STAMP);
    // ASSERT
    expect(result).toEqual({ ok: false, errors: ['kind must be one of start-run, end-run, start, end, attrs, score'] });
  });

  it('rejects lines with missing ids, an unknown status, a summary over 500 characters or an unknown field', () => {
    // ARRANGE
    const noParent = { kind: 'start', type: 'job', name: 'x', job: 'x' };
    const noSpan = { kind: 'end', status: 'ok' };
    const badStatus = { kind: 'end', span_id: JOB_SPAN, status: 'passed' };
    const longSummary = { kind: 'end', span_id: JOB_SPAN, status: 'ok', summary: 'x'.repeat(501) };
    const typo = { kind: 'end', span_id: JOB_SPAN, status: 'ok', sumary: 'x' };
    // ACT
    const results = [noParent, noSpan, badStatus, longSummary, typo].map((event) => record(event, STAMP));
    // ASSERT
    expect(results).toEqual([
      { ok: false, errors: ['parent_span_id is required on a start line'] },
      { ok: false, errors: ['span_id is required on a end line'] },
      { ok: false, errors: ['status must be one of ok, error, refused, crashed, reused'] },
      { ok: false, errors: ['summary must be at most 500 characters'] },
      { ok: false, errors: ['sumary is not a field of a end line'] },
    ]);
  });

  it('rejects an agent start without its Job and role, and a score without a judge it can name', () => {
    // ARRANGE
    const agent = { kind: 'start', type: 'agent', name: 'a', parent_span_id: RUN_SPAN };
    const score = { kind: 'score', span_id: JOB_SPAN, name: 'rubric', value: 'pass', source: 'somebody' };
    // ACT
    const agentResult = record(agent, STAMP);
    const scoreResult = record(score, STAMP);
    // ASSERT
    expect(agentResult).toEqual({
      ok: false,
      errors: ['job is required on a start line', 'role is required on a start line'],
    });
    expect(scoreResult).toEqual({
      ok: false,
      errors: ['source must be agent:<job>/<role>, check:<name> or human:<name>'],
    });
  });
});

/** A hand-written log of one Run: a job with a failed then a passed attempt, a crashed agent and a gate. */
const T = 'b'.repeat(32);
const line = (seq: number, t: string, rest: Record<string, unknown>): RunLogLine =>
  ({ seq, t, trace_id: T, ...rest }) as unknown as RunLogLine;
const ID = (n: number): string => n.toString(16).padStart(16, '0');

const LOG: RunLogLine[] = [
  line(1, '2026-10-14T09:00:00Z', {
    kind: 'start-run',
    span_id: ID(1),
    run_id: 'run-1',
    template_sha: 'abc1234',
    harness: 'claude-code',
    branch: 'feat/x',
    'gen_ai.request.model': 'opus',
  }),
  line(2, '2026-10-14T09:00:10Z', {
    kind: 'start',
    span_id: ID(2),
    parent_span_id: ID(1),
    type: 'job',
    name: 'write-dossier',
    job: 'write-dossier',
  }),
  line(3, '2026-10-14T09:00:20Z', {
    kind: 'start',
    span_id: ID(3),
    parent_span_id: ID(2),
    type: 'attempt',
    name: 'write-dossier#1',
    job: 'write-dossier',
    attempt: 1,
  }),
  line(4, '2026-10-14T09:00:30Z', {
    kind: 'start',
    span_id: ID(4),
    parent_span_id: ID(3),
    type: 'agent',
    name: 'write-dossier#1/implementor',
    job: 'write-dossier',
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
  }),
  line(6, '2026-10-14T09:01:40Z', {
    kind: 'score',
    span_id: ID(3),
    name: 'rubric',
    value: 'fail',
    source: 'agent:write-dossier/reviewer',
    rubric: 'The Answer answers the h1 question.',
  }),
  line(7, '2026-10-14T09:01:50Z', { kind: 'end', span_id: ID(3), status: 'error', summary: 'rubric failed' }),
  line(8, '2026-10-14T09:02:00Z', {
    kind: 'start',
    span_id: ID(5),
    parent_span_id: ID(2),
    type: 'attempt',
    name: 'write-dossier#2',
    job: 'write-dossier',
    attempt: 2,
    retry_of: ID(3),
  }),
  line(9, '2026-10-14T09:03:00Z', { kind: 'end', span_id: ID(5), status: 'ok' }),
  line(10, '2026-10-14T09:03:10Z', { kind: 'end', span_id: ID(2), status: 'ok' }),
];

describe('fold', () => {
  it('turns lines into spans with durations, models and tokens, and keeps scores apart', () => {
    // ARRANGE
    const expectedDurations = { [ID(1)]: null, [ID(2)]: 180_000, [ID(3)]: 90_000, [ID(4)]: 60_000, [ID(5)]: 60_000 };
    // ACT
    const { spans, scores } = fold(LOG);
    // ASSERT
    expect(Object.fromEntries(spans.map((span) => [span.span_id, span.duration_ms]))).toEqual(expectedDurations);
    expect(spans.find((span) => span.span_id === ID(4))).toMatchObject({
      type: 'agent',
      status: 'ok',
      'gen_ai.request.model': 'inherit',
      'gen_ai.response.model': 'sonnet',
      'gen_ai.usage.input_tokens': 100,
      start_t: '2026-10-14T09:00:30Z',
      end_t: '2026-10-14T09:01:30Z',
    });
    expect(spans.find((span) => span.span_id === ID(5))).toMatchObject({ attempt: 2, retry_of: ID(3) });
    expect(scores).toEqual([
      {
        trace_id: T,
        span_id: ID(3),
        t: '2026-10-14T09:01:40Z',
        seq: 6,
        name: 'rubric',
        value: 'fail',
        source: 'agent:write-dossier/reviewer',
        rubric: 'The Answer answers the h1 question.',
      },
    ]);
  });

  it('marks a start with no end crashed, or running when the caller reads a live log', () => {
    // ARRANGE
    const open = LOG.slice(0, 4);
    // ACT
    const crashed = fold(open).spans.map((span) => span.status);
    const live = fold(open, { live: new Set([T]) }).spans.map((span) => span.status);
    // ASSERT
    expect(crashed).toEqual(['crashed', 'crashed', 'crashed', 'crashed']);
    expect(live).toEqual(['running', 'running', 'running', 'running']);
  });

  it('keeps every end status, including refused and reused', () => {
    // ARRANGE
    const statuses = ['ok', 'error', 'refused', 'crashed', 'reused'];
    const lines = statuses.flatMap((status, i) => [
      line(i * 2 + 1, '2026-10-14T09:00:00Z', {
        kind: 'start',
        span_id: ID(10 + i),
        parent_span_id: ID(1),
        type: 'job',
        name: status,
        job: status,
      }),
      line(i * 2 + 2, '2026-10-14T09:00:05Z', { kind: 'end', span_id: ID(10 + i), status }),
    ]);
    // ACT
    const folded = fold(lines).spans.map((span) => span.status);
    // ASSERT
    expect(folded).toEqual(statuses);
  });
});

describe('renderTree', () => {
  it('prints the Run as a tree with statuses, durations, asked-versus-ran models, tokens and scores', () => {
    // ARRANGE
    const expected = [
      `crashed run run-1 · … · opus  [${ID(1)}]`,
      `  ok job write-dossier · 3m00s  [${ID(2)}]`,
      `    error attempt write-dossier#1 · 1m30s  [${ID(3)}]`,
      '      ↳ rubric fail · agent:write-dossier/reviewer · The Answer answers the h1 question.',
      `      ok agent write-dossier#1/implementor · 1m00s · inherit→sonnet · in 100 out 20  [${ID(4)}]`,
      `    ok attempt write-dossier#2 · 1m00s  [${ID(5)}]`,
    ].join('\n');
    // ACT
    const tree = renderTree(fold(LOG));
    // ASSERT
    expect(tree).toBe(expected);
  });

  it('prints only the subtree under a span id, and nothing for an unknown id', () => {
    // ARRANGE
    const expected = `ok attempt write-dossier#2 · 1m00s  [${ID(5)}]`;
    // ACT
    const subtree = renderTree(fold(LOG), ID(5));
    const unknown = renderTree(fold(LOG), ID(99));
    // ASSERT
    expect(subtree).toBe(expected);
    expect(unknown).toBeNull();
  });
});

describe('edge cases', () => {
  it('lets an event carry its own measured time, which is how an adapter reports a real launch time', () => {
    // ARRANGE
    const event = { kind: 'end', span_id: JOB_SPAN, status: 'ok', t: '2026-10-14T08:59:00Z' };
    // ACT
    const result = record(event, STAMP);
    // ASSERT
    expect(result).toMatchObject({ ok: true, line: { t: '2026-10-14T08:59:00Z', seq: 7 } });
  });

  it('orders lines by time then sequence, so a shuffled log folds like the sorted one, and reports an end with no start', () => {
    // ARRANGE
    const shuffled = [...LOG].reverse();
    const stray = line(11, '2026-10-14T09:04:00Z', { kind: 'end', span_id: ID(99), status: 'ok' });
    const sameInstant = [
      line(2, '2026-10-14T09:00:00Z', { kind: 'end', span_id: ID(20), status: 'ok' }),
      line(1, '2026-10-14T09:00:00Z', {
        kind: 'start',
        span_id: ID(20),
        parent_span_id: ID(1),
        type: 'job',
        name: 'a',
        job: 'a',
      }),
    ];
    // ACT
    const fromShuffled = fold(shuffled);
    const withStray = fold([...LOG, stray]);
    const tied = fold(sameInstant);
    // ASSERT
    expect(fromShuffled).toEqual(fold(LOG));
    expect(withStray.orphans).toEqual([stray]);
    expect(tied.spans.map((span) => span.status)).toEqual(['ok']);
  });
});

describe('live Runs and late start facts', () => {
  const OTHER = 'f'.repeat(32);
  const at = (seq: number, t: string, rest: Partial<RunLogLine>): RunLogLine =>
    ({ seq, t, trace_id: TRACE_A, ...rest }) as RunLogLine;
  const TRACE_A = 'a'.repeat(32);

  it('decides running or crashed per trace, so one Run ending does not crash another in the file', () => {
    // ARRANGE
    const lines = [
      at(1, '2026-10-14T09:00:00Z', { kind: 'start-run', span_id: 'a1'.repeat(8), run_id: 'one' }),
      at(2, '2026-10-14T09:00:01Z', {
        kind: 'start',
        span_id: 'a2'.repeat(8),
        type: 'job',
        name: 'j',
        job: 'j',
        parent_span_id: 'a1'.repeat(8),
      }),
      at(3, '2026-10-15T09:00:00Z', { kind: 'start-run', span_id: 'b1'.repeat(8), run_id: 'two', trace_id: OTHER }),
      at(4, '2026-10-15T09:00:01Z', {
        kind: 'start',
        span_id: 'b2'.repeat(8),
        type: 'job',
        name: 'j',
        job: 'j',
        parent_span_id: 'b1'.repeat(8),
        trace_id: OTHER,
      }),
      at(5, '2026-10-15T10:00:00Z', { kind: 'end-run', span_id: 'a1'.repeat(8), status: 'ok' }),
    ];
    // ACT
    const statuses = fold(lines, { live: new Set([OTHER]) }).spans.map((span) => [
      span.span_id.slice(0, 2),
      span.status,
    ]);
    // ASSERT
    expect(statuses).toEqual([
      ['a1', 'ok'],
      ['a2', 'crashed'],
      ['b1', 'running'],
      ['b2', 'running'],
    ]);
  });

  it('fills the launch time and prompt an end line carries when the start had neither', () => {
    // ARRANGE
    const lines = [
      at(1, '2026-10-14T10:00:05Z', {
        kind: 'start',
        span_id: 'c1'.repeat(8),
        type: 'agent',
        name: 'x',
        parent_span_id: 'a1'.repeat(8),
        job: 'j',
        role: 'r',
      }),
      at(2, '2026-10-14T10:01:05Z', {
        kind: 'end',
        span_id: 'c1'.repeat(8),
        status: 'ok',
        start_t: '2026-10-14T10:00:00Z',
        'gen_ai.input.messages': 'the prompt',
      }),
    ];
    // ACT
    const [span] = fold(lines).spans;
    // ASSERT
    expect(span).toMatchObject({
      start_t: '2026-10-14T10:00:00Z',
      duration_ms: 65_000,
      'gen_ai.input.messages': 'the prompt',
    });
  });
});

describe('an end that is timestamped before its start', () => {
  it("still closes the span and applies the end line's start_t backfill", () => {
    // ARRANGE
    const trace = 'a'.repeat(32);
    const run = 'a1'.repeat(8);
    const agent = 'a2'.repeat(8);
    const lines = [
      { seq: 1, t: '2026-10-14T16:07:00Z', trace_id: trace, kind: 'start-run', span_id: run, run_id: 'r' },
      {
        seq: 2,
        t: '2026-10-14T16:07:56Z',
        trace_id: trace,
        kind: 'start',
        span_id: agent,
        type: 'agent',
        name: 'a',
        parent_span_id: run,
      },
      {
        seq: 3,
        t: '2026-10-14T16:07:55Z',
        trace_id: trace,
        kind: 'end',
        span_id: agent,
        status: 'ok',
        start_t: '2026-10-14T16:07:54Z',
      },
    ] as RunLogLine[];
    // ACT
    const { spans, orphans } = fold(lines);
    // ASSERT
    expect(orphans).toEqual([]);
    expect(spans.find((s) => s.span_id === agent)).toMatchObject({
      status: 'ok',
      start_t: '2026-10-14T16:07:54Z',
      end_t: '2026-10-14T16:07:55Z',
      duration_ms: 1000,
    });
  });
});

describe('identity on an end line', () => {
  it("replaces the start's provisional identity, parent and name", () => {
    // ARRANGE
    const trace = 'a'.repeat(32);
    const run = 'a1'.repeat(8);
    const attempt = 'a3'.repeat(8);
    const agent = 'a2'.repeat(8);
    const lines = [
      { seq: 1, t: '2026-10-14T10:00:00Z', trace_id: trace, kind: 'start-run', span_id: run, run_id: 'r' },
      {
        seq: 2,
        t: '2026-10-14T10:00:01Z',
        trace_id: trace,
        kind: 'start',
        span_id: agent,
        type: 'agent',
        name: 'j/skill-spawned',
        parent_span_id: run,
        role: 'skill-spawned',
      },
      {
        seq: 3,
        t: '2026-10-14T10:00:09Z',
        trace_id: trace,
        kind: 'end',
        span_id: agent,
        status: 'ok',
        job: 'j',
        attempt: 2,
        role: 'reviewer',
        parent_span_id: attempt,
        name: 'j#2/reviewer',
      },
    ] as RunLogLine[];
    // ACT
    const span = fold(lines).spans.find((s) => s.span_id === agent);
    // ASSERT
    expect(span).toMatchObject({
      job: 'j',
      attempt: 2,
      role: 'reviewer',
      parent_span_id: attempt,
      name: 'j#2/reviewer',
      start_t: '2026-10-14T10:00:01Z',
    });
  });
});

describe('the record of an end line with identity', () => {
  it('accepts identity fields on end and refuses them on end-run', () => {
    // ARRANGE
    const stamp = { t: '2026-10-14T10:00:00Z', seq: 3, traceId: 'a'.repeat(32), spanId: 'b'.repeat(16) };
    const identity = { span_id: 'a1'.repeat(8), status: 'ok', role: 'reviewer', parent_span_id: 'a3'.repeat(8) };
    // ACT
    const end = record({ kind: 'end', ...identity }, stamp);
    const endRun = record({ kind: 'end-run', ...identity }, stamp);
    // ASSERT
    expect(end.ok).toBe(true);
    expect(endRun.ok).toBe(false);
  });
});

describe('attrs lines', () => {
  const START_AGENT = {
    kind: 'start',
    type: 'agent',
    name: 'write/skill-spawned',
    job: 'write',
    role: 'skill-spawned',
    parent_span_id: RUN_SPAN,
  };
  const stamp = (seq: number, t: string, spanId = JOB_SPAN): Stamp => ({ t, seq, traceId: TRACE, spanId });
  const lines = (attrs: Record<string, unknown>): RunLogLine[] => {
    const start = record(START_AGENT, stamp(1, '2026-10-14T09:00:00Z'));
    const end = record(
      { kind: 'end', span_id: JOB_SPAN, status: 'ok', summary: 'done' },
      stamp(2, '2026-10-14T09:01:00Z'),
    );
    const extra = record({ kind: 'attrs', span_id: JOB_SPAN, ...attrs }, stamp(3, '2026-10-14T10:00:00Z'));
    return [start, end, extra].flatMap((r) => (r.ok ? [r.line] : []));
  };

  it('gives an ended span its identity without touching how it ended', () => {
    // ARRANGE
    const attrs = { job: 'write', attempt: 2, role: 'reviewer', ticket: 7, name: 'write#2/reviewer/#7' };
    // ACT
    const span = fold(lines(attrs)).spans[0];
    // ASSERT
    expect(span).toMatchObject({
      ...attrs,
      status: 'ok',
      summary: 'done',
      end_t: '2026-10-14T09:01:00Z',
      duration_ms: 60_000,
    });
  });

  it('refuses a field that is not identity', () => {
    // ACT
    const result = record({ kind: 'attrs', span_id: JOB_SPAN, status: 'error' }, stamp(3, '2026-10-14T10:00:00Z'));
    // ASSERT
    expect(result).toMatchObject({ ok: false, errors: [expect.stringContaining('status is not a field')] });
  });

  it('keeps an attrs line for a span that never started as an orphan', () => {
    // ARRANGE
    const orphan = record({ kind: 'attrs', span_id: JOB_SPAN, role: 'x' }, stamp(1, '2026-10-14T10:00:00Z'));
    // ACT
    const folded = fold(orphan.ok ? [orphan.line] : []);
    // ASSERT
    expect(folded.orphans).toHaveLength(1);
  });
});
