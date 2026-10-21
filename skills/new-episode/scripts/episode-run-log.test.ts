import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { episodeLogPath, readEpisodeLog, readLog, readRuns } from './episode-run-log.ts';

/*
 * The run-log module against a real temp folder: path rules, folding with liveness from the marker,
 * the current Run, and per-Run dedupe across live and archived logs.
 */

const TRACE_A = 'a'.repeat(32);
const TRACE_B = 'b'.repeat(32);
const SLUG = 'my-episode';

const startRun = (trace: string, seq: number, t: string) => ({
  kind: 'start-run',
  trace_id: trace,
  span_id: `run-${trace[0]}`,
  seq,
  t,
  run_id: `run-${trace[0]}`,
});
const startJob = (trace: string, seq: number, t: string) => ({
  kind: 'start',
  trace_id: trace,
  span_id: `job-${trace[0]}`,
  parent_span_id: `run-${trace[0]}`,
  seq,
  t,
  type: 'job',
  name: 'brief-grill',
});
const jsonl = (...lines: object[]): string => lines.map((l) => JSON.stringify(l)).join('\n') + '\n';

const roots: string[] = [];
function worktree(files: Record<string, string>): string {
  const root = mkdtempSync(path.join(os.tmpdir(), 'run-log-'));
  roots.push(root);
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), text);
  }
  return root;
}
const marker = (trace: string): string =>
  JSON.stringify({ log: episodeLogPath(SLUG), session_id: 's', trace_id: trace, job_span_id: 'job' });

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('success cases', () => {
  it('reads an Episode log from its live path and names the newest start-run as the current Run', () => {
    // ARRANGE
    const root = worktree({
      [episodeLogPath(SLUG)]: jsonl(
        startRun(TRACE_A, 1, '2026-10-14T09:00:00Z'),
        startRun(TRACE_B, 2, '2026-10-14T10:00:00Z'),
      ),
    });
    // ACT
    const { current, lines } = readEpisodeLog(SLUG, root);
    // ASSERT
    expect(lines).toHaveLength(2);
    expect(current?.trace_id).toBe(TRACE_B);
  });

  it('marks an open span running only in the Run the marker names, crashed in any other', () => {
    // ARRANGE
    const log = jsonl(
      startRun(TRACE_A, 1, '2026-10-14T09:00:00Z'),
      startJob(TRACE_A, 2, '2026-10-14T09:01:00Z'),
      startRun(TRACE_B, 3, '2026-10-14T10:00:00Z'),
      startJob(TRACE_B, 4, '2026-10-14T10:01:00Z'),
    );
    const root = worktree({ [episodeLogPath(SLUG)]: log, '.scratch/active-run': marker(TRACE_B) });
    // ACT
    const statuses = readEpisodeLog(SLUG, root).folded.spans.map((span) => [span.trace_id, span.status]);
    // ASSERT
    expect(statuses).toEqual([
      [TRACE_A, 'crashed'],
      [TRACE_A, 'crashed'],
      [TRACE_B, 'running'],
      [TRACE_B, 'running'],
    ]);
  });

  it('keeps Run B when a live log holds Runs A and B and an archive holds only A', () => {
    // ARRANGE
    const a = [startRun(TRACE_A, 1, '2026-10-14T09:00:00Z')];
    const root = worktree({
      [episodeLogPath(SLUG)]: jsonl(...a, startRun(TRACE_B, 2, '2026-10-14T10:00:00Z')),
      [`.logs/new-episode/${SLUG}/events.jsonl`]: jsonl(...a),
    });
    // ACT
    const { sources } = readRuns([], root);
    // ASSERT
    const traces = sources.flatMap((source) => source.folded.spans.map((span) => span.trace_id)).sort();
    expect(traces).toEqual([TRACE_A, TRACE_B]);
  });
});

describe('failure cases', () => {
  it('reports a line that is not JSON with its file, and still reads the rest', () => {
    // ARRANGE
    const root = worktree({
      [episodeLogPath(SLUG)]: `${jsonl(startRun(TRACE_A, 1, '2026-10-14T09:00:00Z'))}not json\n`,
    });
    // ACT
    const { errors, lines } = readEpisodeLog(SLUG, root);
    // ASSERT
    expect(errors).toEqual([`${path.join(root, episodeLogPath(SLUG))}: line 2 is not a JSON object`]);
    expect(lines).toHaveLength(1);
  });

  it('reports a bad line of a globbed log with the same file prefix as readLog', () => {
    // ARRANGE
    const root = worktree({ [episodeLogPath(SLUG)]: 'oops\n' });
    // ACT
    const { errors } = readRuns([], root);
    // ASSERT
    expect(errors).toEqual(readLog(episodeLogPath(SLUG), root).errors);
    expect(errors).toEqual([`${path.join(root, episodeLogPath(SLUG))}: line 1 is not a JSON object`]);
  });
});

describe('edge cases', () => {
  it('reads a missing log as empty with no current Run', () => {
    // ARRANGE
    const root = worktree({});
    // ACT
    const log = readEpisodeLog(SLUG, root);
    // ASSERT
    expect(log.lines).toEqual([]);
    expect(log.current).toBeNull();
  });

  it('reads a Run present in both the live log and an archive once', () => {
    // ARRANGE
    const a = jsonl(startRun(TRACE_A, 1, '2026-10-14T09:00:00Z'));
    const root = worktree({ [episodeLogPath(SLUG)]: a, [`.logs/new-episode/${SLUG}/events.jsonl`]: a });
    // ACT
    const { sources, files } = readRuns([], root);
    // ASSERT
    expect(files).toHaveLength(2);
    expect(sources).toHaveLength(1);
  });

  it('reads only the logs a given glob names', () => {
    // ARRANGE
    const root = worktree({
      [episodeLogPath(SLUG)]: jsonl(startRun(TRACE_A, 1, '2026-10-14T09:00:00Z')),
      [episodeLogPath('other')]: jsonl(startRun(TRACE_B, 1, '2026-10-14T09:00:00Z')),
    });
    // ACT
    const { sources } = readRuns([episodeLogPath('other')], root);
    // ASSERT
    expect(sources.map((source) => source.episode)).toEqual(['other']);
  });

  it('reads a log named by an absolute path as is, not under the root', () => {
    // ARRANGE
    const archive = worktree({ 'run-a.jsonl': jsonl(startRun(TRACE_A, 1, '2026-10-14T09:00:00Z')) });
    const root = worktree({});
    // ACT
    const log = readLog(path.join(archive, 'run-a.jsonl'), root);
    // ASSERT
    expect(log.file).toBe(path.join(archive, 'run-a.jsonl'));
    expect(log.current?.trace_id).toBe(TRACE_A);
  });

  it('keeps the copy of a Run with the most lines when several logs hold it', () => {
    // ARRANGE
    const start = startRun(TRACE_A, 1, '2026-10-14T09:00:00Z');
    const job = startJob(TRACE_A, 2, '2026-10-14T09:01:00Z');
    const root = worktree({
      [`.logs/new-episode/${SLUG}/events.jsonl`]: jsonl(start),
      [episodeLogPath(SLUG)]: jsonl(start, job),
    });
    // ACT
    const { sources } = readRuns([], root);
    // ASSERT
    expect(sources).toHaveLength(1);
    expect(sources[0]?.folded.spans.map((span) => span.type)).toEqual(['run', 'job']);
  });
});
