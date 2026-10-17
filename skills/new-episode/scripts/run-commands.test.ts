import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { episodeLogPath, readEpisodeLog, readMarker } from './episode-run-log.ts';
import { runCommand, type RunContext } from './run-commands.ts';
import { appendEvent } from './run-log-writer.ts';

/*
 * The run-scoped commands against a real temp worktree: names in, lines and marker out. Clock, ids, git,
 * session id and the orchestrator transcript are injected.
 */

const SLUG = 'demo';
const SESSION = 'sess-1';
const JOBS = ['brief-grill', 'write-dossier', 'open-pr', 'write-spec', 'a'];
const pipeline = (jobs: readonly string[]): string =>
  `status: approved\njobs:\n${jobs.map((id) => `  - id: ${id}\n`).join('')}`;
const roots: string[] = [];

function context(transcript: string | null | Record<string, string> = null): RunContext {
  const root = mkdtempSync(path.join(os.tmpdir(), 'run-commands-'));
  roots.push(root);
  mkdirSync(path.join(root, 'docs/episodes', SLUG), { recursive: true });
  writeFileSync(path.join(root, 'docs/episodes', SLUG, 'pipeline.yml'), pipeline(JOBS));
  let n = 0;
  let minute = 0;
  return {
    root,
    slug: SLUG,
    sessionId: SESSION,
    transcriptOf: (session) =>
      typeof transcript === 'string' || transcript === null ? transcript : (transcript[session] ?? null),
    writer: {
      now: () => `2026-10-14T09:${String(minute++).padStart(2, '0')}:00Z`,
      id: (bytes) => String(++n).padStart(bytes * 2, '0'),
      git: (...args) => (args[0] === 'rev-parse' ? 'episode/demo' : 'abc1234'),
    },
  };
}

const run = (ctx: RunContext, ...argv: string[]) => runCommand(ctx, argv);
const lines = (ctx: RunContext) => readEpisodeLog(SLUG, ctx.root).lines;
const spans = (ctx: RunContext) => readEpisodeLog(SLUG, ctx.root).folded.spans;
const begun = (): RunContext => {
  const ctx = context();
  run(ctx, 'begin-run', '--model', 'opus');
  return ctx;
};

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('success cases', () => {
  it('begins the Run and points the marker at it', () => {
    // ARRANGE
    const ctx = context();
    // ACT
    const result = run(ctx, 'begin-run', '--model', 'opus');
    // ASSERT
    expect(result).toEqual({ ok: true, output: expect.stringContaining('2026-10-14T09-00-00Z') });
    expect(lines(ctx)).toEqual([
      expect.objectContaining({ kind: 'start-run', harness: 'claude-code', 'gen_ai.request.model': 'opus' }),
    ]);
    expect(readMarker(ctx.root)).toEqual({
      log: episodeLogPath(SLUG),
      session_id: SESSION,
      trace_id: lines(ctx)[0]?.trace_id,
      job_span_id: lines(ctx)[0]?.span_id,
      session_ids: [SESSION],
    });
  });

  it('resumes the Run itself when a second session begins a Job, and says so', () => {
    // ARRANGE
    const ctx = begun();
    const second = { ...ctx, sessionId: 'sess-2' };
    // ACT
    const result = run(second, 'begin-job', 'brief-grill');
    // ASSERT
    expect(result).toEqual({ ok: true, output: expect.stringMatching(/resumed.*\n.*Job brief-grill begun/s) });
    expect(readMarker(ctx.root)).toEqual(
      expect.objectContaining({ session_id: 'sess-2', session_ids: [SESSION, 'sess-2'] }),
    );
  });

  it('resumes the Run itself when a second session begins an Attempt, and says so', () => {
    // ARRANGE
    const ctx = begun();
    run(ctx, 'begin-job', 'brief-grill');
    // ACT
    const result = run({ ...ctx, sessionId: 'sess-2' }, 'begin-attempt', 'brief-grill');
    // ASSERT
    expect(result).toEqual({ ok: true, output: expect.stringMatching(/resumed.*\n.*Attempt brief-grill#1 begun/s) });
    expect(readMarker(ctx.root)?.session_ids).toEqual([SESSION, 'sess-2']);
  });

  it('begins a Job under the Run and moves the marker to it', () => {
    // ARRANGE
    const ctx = begun();
    // ACT
    run(ctx, 'begin-job', 'brief-grill');
    // ASSERT
    const job = spans(ctx).find((s) => s.type === 'job');
    expect(job).toEqual(expect.objectContaining({ job: 'brief-grill', parent_span_id: lines(ctx)[0]?.span_id }));
    expect(readMarker(ctx.root)?.job_span_id).toBe(job?.span_id);
  });

  it('derives Attempt numbers and retry_of, and prints the spawn description', () => {
    // ARRANGE
    const ctx = begun();
    run(ctx, 'begin-job', 'write-dossier');
    const first = run(ctx, 'begin-attempt', 'write-dossier');
    run(ctx, 'end-attempt', 'write-dossier', 'error');
    // ACT
    const second = run(ctx, 'begin-attempt', 'write-dossier');
    // ASSERT
    const attempts = spans(ctx).filter((s) => s.type === 'attempt');
    expect(first).toEqual({ ok: true, output: expect.stringContaining('write-dossier#1/<role>') });
    expect(second).toEqual({ ok: true, output: expect.stringContaining('write-dossier#2/<role>') });
    expect(attempts.map((s) => [s.attempt, s.parent_span_id])).toEqual([
      [1, spans(ctx).find((s) => s.type === 'job')?.span_id],
      [2, spans(ctx).find((s) => s.type === 'job')?.span_id],
    ]);
    expect(attempts[1]?.retry_of).toBe(attempts[0]?.span_id);
    expect(attempts[0]?.status).toBe('error');
  });

  it('ends the Attempt and the Job by name with a status and summary', () => {
    // ARRANGE
    const ctx = begun();
    run(ctx, 'begin-job', 'open-pr');
    run(ctx, 'begin-attempt', 'open-pr');
    // ACT
    run(ctx, 'end-attempt', 'open-pr', 'ok');
    run(ctx, 'end-job', 'open-pr', 'reused', '--summary', 'answered by llm-wiki');
    // ASSERT
    const byType = (type: string) => spans(ctx).find((s) => s.type === type);
    expect(byType('attempt')?.status).toBe('ok');
    expect(byType('job')).toEqual(expect.objectContaining({ status: 'reused', summary: 'answered by llm-wiki' }));
    expect(readMarker(ctx.root)?.job_span_id).toBe(lines(ctx)[0]?.span_id);
  });

  it('opens and closes a Gate under the Run and scores it by name', () => {
    // ARRANGE
    const ctx = begun();
    // ACT
    run(ctx, 'open-gate', 'brief-grill', 'draft brief');
    run(
      ctx,
      'score',
      'gate:draft brief',
      'gate',
      'approved',
      '--source',
      'human:han',
      '--via',
      'chat',
      '--comment',
      'ok by me',
    );
    run(ctx, 'close-gate', 'draft brief');
    // ASSERT
    const gate = spans(ctx).find((s) => s.type === 'gate');
    expect(gate).toEqual(
      expect.objectContaining({
        name: 'draft brief',
        job: 'brief-grill',
        status: 'ok',
        parent_span_id: lines(ctx)[0]?.span_id,
      }),
    );
    expect(readEpisodeLog(SLUG, ctx.root).folded.scores).toEqual([
      expect.objectContaining({
        span_id: gate?.span_id,
        name: 'gate',
        value: 'approved',
        source: 'human:han',
        via: 'chat',
        comment: 'ok by me',
      }),
    ]);
  });

  it('scores a Job and an Attempt by name', () => {
    // ARRANGE
    const ctx = begun();
    run(ctx, 'begin-job', 'write-spec');
    run(ctx, 'begin-attempt', 'write-spec');
    // ACT
    run(ctx, 'score', 'write-spec#1', 'check', 'pass', '--source', 'check:mh');
    run(ctx, 'score', 'write-spec', 'gate', 'edited', '--source', 'human:han');
    // ASSERT
    const [attempt, job] = [spans(ctx).find((s) => s.type === 'attempt'), spans(ctx).find((s) => s.type === 'job')];
    expect(readEpisodeLog(SLUG, ctx.root).folded.scores.map((s) => [s.span_id, s.value])).toEqual([
      [attempt?.span_id, 'pass'],
      [job?.span_id, 'edited'],
    ]);
  });

  it('scores a negative number given as a plain positional, and still with the -- separator', () => {
    // ARRANGE
    const ctx = begun();
    run(ctx, 'begin-job', 'write-spec');
    // ACT
    const plain = run(ctx, 'score', 'write-spec', 'check', '-1', '--source', 'check:sim');
    const separated = run(ctx, 'score', '--source', 'check:sim', '--', 'write-spec', 'check', '-2');
    // ASSERT
    expect(plain).toEqual({ ok: true, output: expect.stringContaining('check=-1') });
    expect(separated).toEqual({ ok: true, output: expect.stringContaining('check=-2') });
  });

  it('begins the first Run of an Episode whose staging folder does not exist yet', () => {
    // ARRANGE
    const ctx = context();
    rmSync(path.join(ctx.root, 'docs/episodes', SLUG), { recursive: true });
    // ACT
    const result = run(ctx, 'begin-run', '--model', 'opus');
    // ASSERT
    expect(result.ok).toBe(true);
    expect(lines(ctx)).toHaveLength(1);
  });

  it('ends the Run, records orchestrator usage and clears the marker in one step', () => {
    // ARRANGE
    const transcript = [
      {
        type: 'assistant',
        timestamp: '2026-10-14T09:00:30Z',
        message: { model: 'opus', usage: { input_tokens: 100, output_tokens: 20 } },
      },
    ]
      .map((e) => JSON.stringify(e))
      .join('\n');
    const ctx = context(transcript);
    run(ctx, 'begin-run', '--model', 'opus');
    // ACT
    const result = run(ctx, 'end-run', 'ok', '--summary', 'shipped');
    // ASSERT
    const ends = lines(ctx).filter((l) => l.kind === 'end-run');
    expect(result.ok).toBe(true);
    expect(ends).toHaveLength(2);
    expect(ends[1]).toEqual(
      expect.objectContaining({
        summary: 'shipped',
        'gen_ai.usage.input_tokens': 100,
        'gen_ai.usage.output_tokens': 20,
      }),
    );
    expect(existsSync(path.join(ctx.root, '.scratch/active-run'))).toBe(false);
  });

  it('counts only the orchestrator usage inside the Run, across every session that drove it', () => {
    // ARRANGE
    const said = (t: string, id: string, output: number) =>
      JSON.stringify({
        type: 'assistant',
        timestamp: t,
        message: { id, model: 'opus', usage: { input_tokens: 1, output_tokens: output } },
      });
    const ctx = context({
      'sess-1': [said('2026-10-14T08:00:00Z', 'before', 1000), said('2026-10-14T09:00:30Z', 'm1', 20)].join('\n'),
      'sess-2': [said('2026-10-14T09:00:45Z', 'm2', 5)].join('\n'),
    });
    run(ctx, 'begin-run', '--model', 'opus');
    // ACT
    run({ ...ctx, sessionId: 'sess-2' }, 'resume');
    run({ ...ctx, sessionId: 'sess-2' }, 'end-run');
    // ASSERT
    expect(
      lines(ctx)
        .filter((l) => l.kind === 'end-run')
        .at(-1),
    ).toEqual(expect.objectContaining({ 'gen_ai.usage.input_tokens': 2, 'gen_ai.usage.output_tokens': 25 }));
  });

  it('resumes the current Run in the newest open Job after a crash', () => {
    // ARRANGE
    const ctx = begun();
    run(ctx, 'begin-job', 'write-dossier');
    run(ctx, 'end-run', 'crashed');
    run(ctx, 'begin-run', '--model', 'opus');
    rmSync(path.join(ctx.root, '.scratch/active-run'));
    // ACT
    const result = run(ctx, 'resume');
    // ASSERT
    expect(result.ok).toBe(true);
    expect(readMarker(ctx.root)?.trace_id).toBe(lines(ctx).at(-1)?.trace_id);
  });

  it('archives the log under the Run id', () => {
    // ARRANGE
    const ctx = begun();
    // ACT
    const result = run(ctx, 'archive');
    // ASSERT
    expect(result).toEqual({ ok: true, output: '.logs/new-episode/demo/2026-10-14T09-00-00Z.jsonl' });
    expect(readFileSync(path.join(ctx.root, '.logs/new-episode/demo/2026-10-14T09-00-00Z.jsonl'), 'utf8')).toBe(
      readFileSync(path.join(ctx.root, episodeLogPath(SLUG)), 'utf8'),
    );
  });
});

describe('failure cases', () => {
  it('refuses a second end-run for a Run that already has one', () => {
    // ARRANGE
    const ctx = begun();
    run(ctx, 'end-run');
    // ACT
    const result = run(ctx, 'end-run');
    // ASSERT
    expect(result).toEqual({ ok: false, error: expect.stringContaining('already ended') });
    expect(lines(ctx).filter((l) => l.kind === 'end-run')).toHaveLength(1);
  });

  it('refuses a score --via value the schema does not allow', () => {
    // ARRANGE
    const ctx = begun();
    run(ctx, 'open-gate', 'j', 'x');
    // ACT
    const result = run(ctx, 'score', 'gate:x', 'gate', 'approved', '--via', 'telepathy');
    // ASSERT
    expect(result).toEqual({ ok: false, error: expect.stringContaining('--via') });
  });

  it('refuses any command before the Run begins', () => {
    // ARRANGE
    const ctx = context();
    // ACT
    const result = run(ctx, 'begin-job', 'brief-grill');
    // ASSERT
    expect(result).toEqual({ ok: false, error: expect.stringContaining('begin-run') });
  });

  it('refuses an Attempt without an open Job, and a second open Attempt', () => {
    // ARRANGE
    const ctx = begun();
    // ACT
    const noJob = run(ctx, 'begin-attempt', 'write-spec');
    run(ctx, 'begin-job', 'write-spec');
    run(ctx, 'begin-attempt', 'write-spec');
    const twice = run(ctx, 'begin-attempt', 'write-spec');
    // ASSERT
    expect(noJob).toEqual({ ok: false, error: expect.stringContaining('begin-job write-spec') });
    expect(twice).toEqual({ ok: false, error: expect.stringContaining('end-attempt') });
  });

  it('refuses begin-run without a session id or a model', () => {
    // ARRANGE
    const ctx = { ...context(), sessionId: undefined };
    // ACT
    const noSession = run(ctx, 'begin-run', '--model', 'opus');
    const noModel = run({ ...ctx, sessionId: SESSION }, 'begin-run');
    // ASSERT
    expect(noSession).toEqual({ ok: false, error: expect.stringContaining('session id') });
    expect(noModel).toEqual({ ok: false, error: expect.stringContaining('--model') });
  });

  it('refuses ending a Job or Gate that is not open and a score on an unknown name', () => {
    // ARRANGE
    const ctx = begun();
    // ACT
    const job = run(ctx, 'end-job', 'ghost');
    const gate = run(ctx, 'close-gate', 'draft ghost');
    const target = run(ctx, 'score', 'ghost#2', 'check', 'pass');
    // ASSERT
    expect(job).toEqual({ ok: false, error: 'no open Job ghost' });
    expect(gate).toEqual({ ok: false, error: 'no open Gate "draft ghost"' });
    expect(target).toEqual({ ok: false, error: expect.stringContaining('ghost#2') });
  });

  it("says the writer's validation error for a bad status", () => {
    // ARRANGE
    const ctx = begun();
    run(ctx, 'begin-job', 'brief-grill');
    // ACT
    const result = run(ctx, 'end-job', 'brief-grill', 'great');
    // ASSERT
    expect(result).toEqual({ ok: false, error: expect.stringContaining('status must be') });
  });

  it('refuses a Job the Episode pipeline does not declare', () => {
    // ARRANGE
    const ctx = begun();
    // ACT
    const result = run(ctx, 'begin-job', 'Not A Job');
    // ASSERT
    expect(result).toEqual({ ok: false, error: expect.stringContaining('docs/episodes/demo/pipeline.yml') });
    expect(spans(ctx).filter((s) => s.type === 'job')).toEqual([]);
  });

  it('refuses ending a Job while its Attempt is open', () => {
    // ARRANGE
    const ctx = begun();
    run(ctx, 'begin-job', 'write-spec');
    run(ctx, 'begin-attempt', 'write-spec');
    // ACT
    const result = run(ctx, 'end-job', 'write-spec');
    // ASSERT
    expect(result).toEqual({ ok: false, error: expect.stringContaining('end-attempt write-spec') });
    expect(spans(ctx).find((s) => s.type === 'job')?.end_t).toBeNull();
  });

  it('refuses a new Run while the current one has not ended', () => {
    // ARRANGE
    const ctx = begun();
    // ACT
    const result = run(ctx, 'begin-run', '--model', 'opus');
    // ASSERT
    expect(result).toEqual({ ok: false, error: expect.stringContaining('end-run crashed') });
    expect(lines(ctx).filter((l) => l.kind === 'start-run')).toHaveLength(1);
  });

  it('refuses ending a Run ok while it has open spans, and names them', () => {
    // ARRANGE
    const ctx = begun();
    run(ctx, 'begin-job', 'write-spec');
    run(ctx, 'begin-attempt', 'write-spec');
    run(ctx, 'open-gate', 'write-spec', 'draft spec');
    // ACT
    const result = run(ctx, 'end-run', 'ok');
    // ASSERT
    expect(result).toEqual({
      ok: false,
      error: expect.stringMatching(/write-spec#1[\s\S]*draft spec[\s\S]*end-run error/),
    });
    expect(lines(ctx).filter((l) => l.kind === 'end-run')).toEqual([]);
    expect(readMarker(ctx.root)).not.toBeNull();
  });
});

/** An agent span the hook adapter would have started under the open Attempt of a Job. */
const startAgent = (ctx: RunContext, job: string, role: string): void => {
  const attempt = spans(ctx).find((s) => s.type === 'attempt' && s.job === job && s.end_t === null);
  appendEvent(
    { root: ctx.root, file: episodeLogPath(SLUG) },
    { kind: 'start', type: 'agent', name: `${job}#1/${role}`, job, role, attempt: 1, parent_span_id: attempt?.span_id },
    ctx.writer,
  );
};

describe('lifecycle cases', () => {
  it.each(['error', 'crashed'])('ends the open agents crashed when an Attempt ends %s', (status) => {
    // ARRANGE
    const ctx = begun();
    run(ctx, 'begin-job', 'a');
    run(ctx, 'begin-attempt', 'a');
    startAgent(ctx, 'a', 'implementor');
    // ACT
    const result = run(ctx, 'end-attempt', 'a', status);
    // ASSERT
    expect(result.ok).toBe(true);
    expect(spans(ctx).map((s) => [s.type, s.status])).toEqual([
      ['run', 'running'],
      ['job', 'running'],
      ['attempt', status],
      ['agent', 'crashed'],
    ]);
    expect(run(ctx, 'begin-attempt', 'a').ok).toBe(true);
  });

  it('keeps an open agent open when an Attempt ends ok', () => {
    // ARRANGE
    const ctx = begun();
    run(ctx, 'begin-job', 'a');
    run(ctx, 'begin-attempt', 'a');
    startAgent(ctx, 'a', 'implementor');
    // ACT
    run(ctx, 'end-attempt', 'a', 'ok');
    // ASSERT
    expect(spans(ctx).find((s) => s.type === 'agent')?.status).toBe('running');
  });

  it('refuses new spans and resume on an ended Run, naming begin-run, but still takes Scores', () => {
    // ARRANGE
    const ctx = begun();
    run(ctx, 'begin-job', 'a');
    run(ctx, 'begin-attempt', 'a');
    run(ctx, 'end-attempt', 'a', 'ok');
    run(ctx, 'end-job', 'a', 'ok');
    run(ctx, 'end-run', 'ok');
    // ACT
    const results = [
      run(ctx, 'resume'),
      run(ctx, 'begin-job', 'a'),
      run(ctx, 'begin-attempt', 'a'),
      run(ctx, 'open-gate', 'a', 'g'),
    ];
    // ASSERT
    for (const r of results) expect(r).toEqual({ ok: false, error: expect.stringContaining('begin-run') });
    expect(run(ctx, 'score', 'a#1', 'rubric', 'pass', '--source', 'agent:a/reviewer')).toEqual({
      ok: true,
      output: expect.any(String),
    });
    expect(run(ctx, 'begin-run', '--model', 'opus').ok).toBe(true);
  });
});

describe('edge cases', () => {
  it('ends a Run as crashed with spans still open, which then read crashed', () => {
    // ARRANGE
    const ctx = begun();
    run(ctx, 'begin-job', 'write-spec');
    // ACT
    const result = run(ctx, 'end-run', 'crashed');
    // ASSERT
    expect(result.ok).toBe(true);
    expect(spans(ctx).map((s) => [s.type, s.status])).toEqual([
      ['run', 'crashed'],
      ['job', 'crashed'],
    ]);
  });

  it('reads Job ids from the template pipeline before the Episode has its own', () => {
    // ARRANGE
    const ctx = begun();
    rmSync(path.join(ctx.root, 'docs/episodes', SLUG, 'pipeline.yml'));
    mkdirSync(path.join(ctx.root, 'skills/new-episode/assets'), { recursive: true });
    writeFileSync(path.join(ctx.root, 'skills/new-episode/assets/pipeline.yml'), pipeline(['categorize-research']));
    // ACT
    const declared = run(ctx, 'begin-job', 'categorize-research');
    const undeclared = run(ctx, 'begin-job', 'write-dossier');
    // ASSERT
    expect(declared.ok).toBe(true);
    expect(undeclared).toEqual({ ok: false, error: expect.stringContaining('assets/pipeline.yml') });
  });

  it('reuses an already open Job instead of opening a second', () => {
    // ARRANGE
    const ctx = begun();
    run(ctx, 'begin-job', 'a');
    // ACT
    const result = run(ctx, 'begin-job', 'a');
    // ASSERT
    expect(result).toEqual({ ok: true, output: expect.stringContaining('already open') });
    expect(spans(ctx).filter((s) => s.type === 'job')).toHaveLength(1);
  });

  it('prints usage for an unknown command and refuses an Episode with no folder', () => {
    // ARRANGE
    const ctx = begun();
    // ACT
    const unknown = run(ctx, 'frobnicate');
    const missing = run({ ...ctx, slug: 'nope' }, 'begin-job', 'a');
    // ASSERT
    expect(unknown).toEqual({ ok: false, error: expect.stringContaining('usage:') });
    expect(missing).toEqual({ ok: false, error: expect.stringContaining('docs/episodes/nope') });
  });

  it('ends the Run without usage when the transcript is missing, still clearing the marker', () => {
    // ARRANGE
    const ctx = begun();
    // ACT
    run(ctx, 'end-run');
    // ASSERT
    expect(lines(ctx).filter((l) => l.kind === 'end-run')).toHaveLength(1);
    expect(readMarker(ctx.root)).toBeNull();
  });
});

describe('reuse', () => {
  const finishedRun = (): RunContext => {
    const ctx = begun();
    run(ctx, 'begin-job', 'write-dossier');
    run(ctx, 'end-job', 'write-dossier');
    run(ctx, 'end-run');
    run(ctx, 'begin-run', '--model', 'opus');
    return ctx;
  };

  it('writes a reused Job span in the current Run linked to the earlier Run ok span, once', () => {
    // ARRANGE
    const ctx = finishedRun();
    const earlier = spans(ctx).find((s) => s.type === 'job');
    // ACT
    const first = run(ctx, 'reuse', 'write-dossier');
    const second = run(ctx, 'reuse', 'write-dossier');
    // ASSERT
    const reused = spans(ctx).filter((s) => s.type === 'job' && s.status === 'reused');
    expect(first).toEqual({ ok: true, output: expect.stringContaining('reused') });
    expect(second).toEqual({ ok: true, output: expect.stringContaining('already') });
    expect(reused).toHaveLength(1);
    expect(reused[0]).toEqual(
      expect.objectContaining({
        job: 'write-dossier',
        link_span_id: earlier?.span_id,
        link_trace_id: earlier?.trace_id,
      }),
    );
    expect(reused[0]?.trace_id).not.toBe(earlier?.trace_id);
  });

  it('refuses when no earlier Run has an ok span of that Job', () => {
    // ARRANGE
    const ctx = begun();
    const before = lines(ctx).length;
    // ACT
    const result = run(ctx, 'reuse', 'write-dossier');
    // ASSERT
    expect(result).toEqual({ ok: false, error: expect.stringContaining('no earlier') });
    expect(lines(ctx)).toHaveLength(before);
  });
});

describe('score ticket', () => {
  it('puts --ticket on the Score line', () => {
    // ARRANGE
    const ctx = begun();
    run(ctx, 'begin-job', 'write-spec');
    // ACT
    run(ctx, 'score', 'write-spec', 'check', 'pass', '--source', 'check:mh', '--ticket', '176');
    // ASSERT
    expect(readEpisodeLog(SLUG, ctx.root).folded.scores[0]).toEqual(expect.objectContaining({ ticket: 176 }));
  });

  it('refuses a ticket that is not a number', () => {
    // ARRANGE
    const ctx = begun();
    run(ctx, 'begin-job', 'write-spec');
    // ACT
    const result = run(ctx, 'score', 'write-spec', 'check', 'pass', '--source', 'check:mh', '--ticket', 'x');
    // ASSERT
    expect(result).toEqual({ ok: false, error: expect.stringContaining('ticket') });
  });
});

describe('orchestrator Job usage', () => {
  const said = (t: string, id: string, output: number) =>
    JSON.stringify({
      type: 'assistant',
      timestamp: t,
      message: { id, model: 'opus', usage: { input_tokens: 1, output_tokens: output } },
    });

  it('measures the orchestrator usage between the Job start and end, laid over the Job by one attrs line', () => {
    // ARRANGE
    const ctx = context(
      [
        said('2026-10-14T09:00:30Z', 'before-job', 1000),
        said('2026-10-14T09:01:30Z', 'in-job', 7),
        said('2026-10-14T09:05:30Z', 'after-job', 1000),
      ].join('\n'),
    );
    writeFileSync(
      path.join(ctx.root, 'docs/episodes', SLUG, 'pipeline.yml'),
      'status: approved\njobs:\n  - id: write-dossier\n    session: orchestrator\n  - id: a\n',
    );
    run(ctx, 'begin-run', '--model', 'opus');
    run(ctx, 'begin-job', 'write-dossier');
    // ACT
    run(ctx, 'end-job', 'write-dossier', 'ok', '--summary', 'done');
    // ASSERT
    const job = spans(ctx).find((s) => s.type === 'job');
    expect(job).toEqual(
      expect.objectContaining({
        status: 'ok',
        summary: 'done',
        source: 'measured',
        'gen_ai.usage.input_tokens': 1,
        'gen_ai.usage.output_tokens': 7,
      }),
    );
  });

  it('appends an attrs line, never a second end, and records the skills the orchestrator invoked in the window', () => {
    // ARRANGE
    const skill = (t: string, name: string) =>
      JSON.stringify({
        type: 'assistant',
        timestamp: t,
        message: { id: `sk-${name}`, content: [{ type: 'tool_use', name: 'Skill', input: { skill: name } }] },
      });
    const ctx = context(
      [
        skill('2026-10-14T09:00:30Z', 'before-job'),
        skill('2026-10-14T09:01:30Z', 'grilling'),
        said('2026-10-14T09:01:40Z', 'in-job', 7),
      ].join('\n'),
    );
    writeFileSync(
      path.join(ctx.root, 'docs/episodes', SLUG, 'pipeline.yml'),
      'status: approved\njobs:\n  - id: write-dossier\n    session: orchestrator\n  - id: a\n',
    );
    run(ctx, 'begin-run', '--model', 'opus');
    run(ctx, 'begin-job', 'write-dossier');
    // ACT
    run(ctx, 'end-job', 'write-dossier', 'ok', '--summary', 'done');
    // ASSERT
    const lines = readFileSync(path.join(ctx.root, 'docs/episodes', SLUG, 'events.jsonl'), 'utf8')
      .trim()
      .split('\n')
      .map((l) => JSON.parse(l));
    const ofJob = lines.filter((l) => l.span_id === spans(ctx).find((s) => s.type === 'job')?.span_id);
    expect(ofJob.map((l) => l.kind)).toEqual(['start', 'end', 'attrs']);
    expect(spans(ctx).find((s) => s.type === 'job')).toMatchObject({ status: 'ok', skills_invoked: ['grilling'] });
  });

  it('leaves a subagent Job without usage', () => {
    // ARRANGE
    const ctx = context(said('2026-10-14T09:01:30Z', 'x', 7));
    run(ctx, 'begin-run', '--model', 'opus');
    run(ctx, 'begin-job', 'write-dossier');
    // ACT
    run(ctx, 'end-job', 'write-dossier');
    // ASSERT
    expect(spans(ctx).find((s) => s.type === 'job')?.['gen_ai.usage.output_tokens']).toBeUndefined();
  });
});

describe('agent spans', () => {
  const attempted = (): RunContext => {
    const ctx = begun();
    run(ctx, 'begin-job', 'a');
    run(ctx, 'begin-attempt', 'a');
    return ctx;
  };
  const agents = (ctx: RunContext) => spans(ctx).filter((s) => s.type === 'agent');

  it('begins a typed agent span under the open Attempt, named by its description', () => {
    // ARRANGE
    const ctx = attempted();
    // ACT
    const result = run(ctx, 'begin-agent', 'a#1/implementor/#7', '--harness', 'copilot');
    // ASSERT
    expect(result).toEqual({ ok: true, output: expect.any(String) });
    const attempt = spans(ctx).find((s) => s.type === 'attempt');
    expect(agents(ctx)).toEqual([
      expect.objectContaining({
        name: 'a#1/implementor/#7',
        job: 'a',
        attempt: 1,
        role: 'implementor',
        ticket: 7,
        status: 'running',
        parent_span_id: attempt?.span_id,
        source: 'typed',
      }),
    ]);
  });

  it('ends the agent span with the status given', () => {
    // ARRANGE
    const ctx = attempted();
    run(ctx, 'begin-agent', 'a#1/implementor');
    // ACT
    const result = run(ctx, 'end-agent', 'a#1/implementor');
    // ASSERT
    expect(result.ok).toBe(true);
    expect(agents(ctx).map((s) => s.status)).toEqual(['ok']);
  });

  it('records a refused spawn as end-agent refused', () => {
    // ARRANGE
    const ctx = attempted();
    run(ctx, 'begin-agent', 'a#1/reviewer');
    // ACT
    run(ctx, 'end-agent', 'a#1/reviewer', 'refused');
    // ASSERT
    expect(agents(ctx).map((s) => s.status)).toEqual(['refused']);
  });

  it('does not open a second span for a description already open', () => {
    // ARRANGE
    const ctx = attempted();
    run(ctx, 'begin-agent', 'a#1/implementor');
    // ACT
    run(ctx, 'begin-agent', 'a#1/implementor');
    // ASSERT
    expect(agents(ctx)).toHaveLength(1);
  });

  it('refuses a description that does not parse, and an Attempt that is not open', () => {
    // ARRANGE
    const ctx = attempted();
    // ACT
    const bad = run(ctx, 'begin-agent', 'implementor');
    const none = run(ctx, 'begin-agent', 'a#2/implementor');
    const unknown = run(ctx, 'end-agent', 'a#1/ghost');
    // ASSERT
    expect(bad).toEqual({ ok: false, error: expect.stringContaining('<job>#<n>/<role>') });
    expect(none).toEqual({ ok: false, error: expect.stringContaining('no open Attempt a#2') });
    expect(unknown).toEqual({ ok: false, error: expect.stringContaining('no agent span "a#1/ghost"') });
  });
});
