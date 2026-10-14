import { fork } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { appendEvent, type WriterDeps } from './run-log-writer.ts';

/*
 * The run-log writer against a real temp folder: stamping, seq, trace choice, git facts for start-run,
 * validation errors, and concurrent appends staying whole lines. Clock, ids and git are injected.
 */

const START = { kind: 'start-run', harness: 'claude-code', 'gen_ai.request.model': 'opus' };
const FILE = 'docs/episodes/demo/events.jsonl';
const at = (root: string) => ({ root, file: FILE });
const roots: string[] = [];
function worktree(text = ''): string {
  const root = mkdtempSync(path.join(os.tmpdir(), 'run-writer-'));
  roots.push(root);
  mkdirSync(path.join(root, path.dirname(FILE)), { recursive: true });
  if (text) writeFileSync(path.join(root, FILE), text);
  return root;
}
const written = (root: string): Record<string, unknown>[] =>
  readFileSync(path.join(root, FILE), 'utf8')
    .trim()
    .split('\n')
    .map((l) => JSON.parse(l));

function deps(): WriterDeps {
  let n = 0;
  return {
    now: () => '2026-10-14T09:00:00Z',
    id: (bytes) => String(++n).padStart(bytes * 2, '0'),
    git: (...args) => (args[0] === 'rev-parse' ? 'feat/demo' : 'abc1234def5678'),
  };
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('success cases', () => {
  it('stamps a start-run with a new trace, the run id from the clock and git facts', () => {
    // ARRANGE
    const root = worktree();
    // ACT
    const result = appendEvent(at(root), START, deps());
    // ASSERT
    expect(result).toEqual({ ok: true, line: expect.any(String) });
    expect(written(root)).toEqual([
      expect.objectContaining({
        kind: 'start-run',
        seq: 1,
        t: '2026-10-14T09:00:00Z',
        trace_id: '1'.padStart(32, '0'),
        span_id: '2'.padStart(16, '0'),
        run_id: '2026-10-14T09-00-00Z',
        branch: 'feat/demo',
        template_sha: 'abc1234def5678',
      }),
    ]);
  });

  it('joins a later event to the newest Run with seq one past the highest', () => {
    // ARRANGE
    const root = worktree();
    const d = deps();
    appendEvent(at(root), START, d);
    appendEvent(at(root), START, d);
    // ACT
    const result = appendEvent(
      at(root),
      { kind: 'start', type: 'job', name: 'brief-grill', job: 'j', parent_span_id: '0123456789abcdef' },
      d,
    );
    // ASSERT
    const lines = written(root);
    expect(result).toEqual({ ok: true, line: expect.any(String) });
    expect(lines[2]).toMatchObject({ kind: 'start', seq: 3, trace_id: lines[1]?.trace_id });
  });
});

describe('failure cases', () => {
  it('returns the validation errors and writes nothing for an invalid event', () => {
    // ARRANGE
    const root = worktree();
    appendEvent(at(root), START, deps());
    // ACT
    const result = appendEvent(at(root), { kind: 'nonsense' }, deps());
    // ASSERT
    expect(result.ok).toBe(false);
    expect(written(root)).toHaveLength(1);
  });

  it('refuses a non-start event when the log holds no Run', () => {
    // ARRANGE
    const root = worktree();
    // ACT
    const result = appendEvent(
      at(root),
      { kind: 'start', type: 'job', name: 'x', job: 'j', parent_span_id: '0123456789abcdef' },
      deps(),
    );
    // ASSERT
    expect(result).toEqual({ ok: false, errors: [expect.stringContaining('no start-run')] });
  });
});

describe('concurrency', () => {
  it('keeps every line whole and numbers them uniquely when writers race', async () => {
    // ARRANGE
    const root = worktree();
    appendEvent(at(root), START, deps());
    const child = path.join(root, 'child.ts');
    writeFileSync(
      child,
      `import { appendEvent } from ${JSON.stringify(path.resolve(import.meta.dirname, 'run-log-writer.ts'))};
for (let i = 0; i < 10; i++) appendEvent({ root: ${JSON.stringify(root)}, file: ${JSON.stringify(FILE)} }, { kind: 'start', type: 'job', name: 'job-' + i, job: 'j', parent_span_id: '0123456789abcdef' });
`,
    );
    // ACT
    await Promise.all(
      [1, 2, 3].map(
        (): Promise<void> =>
          new Promise((resolve, reject) => {
            fork(child, { execArgv: [] }).on('exit', (code) =>
              code === 0 ? resolve() : reject(new Error(`child exited ${code}`)),
            );
          }),
      ),
    );
    // ASSERT
    const seqs = written(root).map((l) => l.seq as number);
    expect(seqs).toHaveLength(31);
    expect(new Set(seqs).size).toBe(31);
  });
});

describe('lock ownership', () => {
  it('leaves a lock another writer took after breaking ours in place when we release', () => {
    // ARRANGE
    const root = worktree();
    appendEvent(at(root), START, deps());
    const lock = path.join(root, `${FILE}.lock`);
    const d = deps();
    // while A holds the lock, B breaks it as stale and takes it
    d.now = () => {
      unlinkSync(lock);
      writeFileSync(lock, 'writer-b-token');
      return '2026-10-14T09:00:00Z';
    };
    // ACT
    appendEvent(at(root), { kind: 'start', type: 'job', name: 'x', job: 'j', parent_span_id: '0123456789abcdef' }, d);
    // ASSERT
    expect(existsSync(lock)).toBe(true);
    expect(readFileSync(lock, 'utf8')).toBe('writer-b-token');
  });
});
