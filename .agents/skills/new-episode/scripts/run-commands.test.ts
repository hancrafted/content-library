import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { episodeLogPath, readEpisodeLog, readMarker } from './episode-run-log.ts';
import { runCommand, type RunContext } from './run-commands.ts';

/*
 * The run-scoped commands against a real temp worktree: names in, lines and marker out. Clock, ids, git,
 * session id and the orchestrator transcript are injected.
 */

const SLUG = 'demo';
const SESSION = 'sess-1';
const roots: string[] = [];

function context(transcript: string | null = null): RunContext {
  const root = mkdtempSync(path.join(os.tmpdir(), 'run-commands-'));
  roots.push(root);
  mkdirSync(path.join(root, 'docs/episodes', SLUG), { recursive: true });
  let n = 0;
  let minute = 0;
  return {
    root,
    slug: SLUG,
    sessionId: SESSION,
    transcriptOf: () => transcript,
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
    expect(lines(ctx)).toEqual([expect.objectContaining({ kind: 'start-run', harness: 'claude-code', 'gen_ai.request.model': 'opus' })]);
    expect(readMarker(ctx.root)).toEqual({ log: episodeLogPath(SLUG), session_id: SESSION, trace_id: lines(ctx)[0]?.trace_id, job_span_id: lines(ctx)[0]?.span_id });
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
    expect(attempts.map((s) => [s.attempt, s.parent_span_id])).toEqual([[1, spans(ctx).find((s) => s.type === 'job')?.span_id], [2, spans(ctx).find((s) => s.type === 'job')?.span_id]]);
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
    run(ctx, 'score', 'gate:draft brief', 'gate', 'approved', '--source', 'human:han', '--via', 'chat', '--comment', 'ok by me');
    run(ctx, 'close-gate', 'draft brief');
    // ASSERT
    const gate = spans(ctx).find((s) => s.type === 'gate');
    expect(gate).toEqual(expect.objectContaining({ name: 'draft brief', job: 'brief-grill', status: 'ok', parent_span_id: lines(ctx)[0]?.span_id }));
    expect(readEpisodeLog(SLUG, ctx.root).folded.scores).toEqual([expect.objectContaining({ span_id: gate?.span_id, name: 'gate', value: 'approved', source: 'human:han', via: 'chat', comment: 'ok by me' })]);
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
    expect(readEpisodeLog(SLUG, ctx.root).folded.scores.map((s) => [s.span_id, s.value])).toEqual([[attempt?.span_id, 'pass'], [job?.span_id, 'edited']]);
  });

  it('ends the Run, records orchestrator usage and clears the marker in one step', () => {
    // ARRANGE
    const transcript = [{ type: 'assistant', message: { model: 'opus', usage: { input_tokens: 100, output_tokens: 20 } } }].map((e) => JSON.stringify(e)).join('\n');
    const ctx = context(transcript);
    run(ctx, 'begin-run', '--model', 'opus');
    // ACT
    const result = run(ctx, 'end-run', 'ok', '--summary', 'shipped');
    // ASSERT
    const ends = lines(ctx).filter((l) => l.kind === 'end-run');
    expect(result.ok).toBe(true);
    expect(ends).toHaveLength(2);
    expect(ends[1]).toEqual(expect.objectContaining({ summary: 'shipped', 'gen_ai.usage.input_tokens': 100, 'gen_ai.usage.output_tokens': 20 }));
    expect(existsSync(path.join(ctx.root, '.scratch/active-run'))).toBe(false);
  });

  it('resumes the current Run in the newest open Job after a crash', () => {
    // ARRANGE
    const ctx = begun();
    run(ctx, 'begin-job', 'write-dossier');
    run(ctx, 'end-run');
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
    expect(readFileSync(path.join(ctx.root, '.logs/new-episode/demo/2026-10-14T09-00-00Z.jsonl'), 'utf8')).toBe(readFileSync(path.join(ctx.root, episodeLogPath(SLUG)), 'utf8'));
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

  it('says the writer\'s validation error for a bad status', () => {
    // ARRANGE
    const ctx = begun();
    run(ctx, 'begin-job', 'brief-grill');
    // ACT
    const result = run(ctx, 'end-job', 'brief-grill', 'great');
    // ASSERT
    expect(result).toEqual({ ok: false, error: expect.stringContaining('status must be') });
  });
});

describe('edge cases', () => {
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
