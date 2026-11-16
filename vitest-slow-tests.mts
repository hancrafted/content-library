// The slow-tests log: every fast-suite test that ran past 5 s, one JSON line each, in the git common directory so
// every worktree of the repository writes to the one file. The fast config reports into it (SlowTestsLog); the
// worktree script's finish step reads it back (slowTestsSince) and prints what the merging branch added.
import { spawnSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Reporter, TestCase } from 'vitest/node';
import { IDLE_TIMEOUT_MS } from './vitest-workers.mts';

/** One logged test: its full name, its file relative to the repo root, how long it ran, where and when. */
export type SlowTest = { test: string; file: string; ms: number; branch: string; at: string };

const git = (cwd: string, ...args: string[]) => spawnSync('git', args, { cwd, encoding: 'utf8' });

/** The log's path for the repository `cwd` sits in, or null outside a git repository. */
export function slowTestsLogPath(cwd: string): string | null {
  const commonDir = git(cwd, 'rev-parse', '--path-format=absolute', '--git-common-dir');
  return commonDir.status === 0 ? path.join(commonDir.stdout.trim(), 'slow-tests.jsonl') : null;
}

/**
 * A Vitest reporter that appends each test over 5 s, the idle timeout, to the slow-tests log as it finishes.
 * A test the load-aware timeout let pass is still a test creeping towards CI's limit. Logging never fails a run:
 * outside a git repository, or when the log cannot be written, the test goes unlogged.
 */
export class SlowTestsLog implements Reporter {
  private readonly log: string | null;
  private readonly branch: string;
  private readonly now: () => Date;

  constructor({ cwd = process.cwd(), now = () => new Date() }: { cwd?: string; now?: () => Date } = {}) {
    this.log = slowTestsLogPath(cwd);
    this.branch = git(cwd, 'branch', '--show-current').stdout?.trim() ?? '';
    this.now = now;
  }

  onTestCaseResult(testCase: TestCase): void {
    const ms = Math.round(testCase.diagnostic()?.duration ?? 0);
    if (this.log === null || ms <= IDLE_TIMEOUT_MS) return;
    const entry: SlowTest = {
      test: testCase.fullName,
      file: testCase.module.relativeModuleId,
      ms,
      branch: this.branch,
      at: this.now().toISOString(),
    };
    try {
      appendFileSync(this.log, JSON.stringify(entry) + '\n');
    } catch {
      // A read-only or vanished common dir loses one entry, never the run.
    }
  }
}

/** The entries `branch` logged at or after `since`, oldest first; none when there is no log yet. Unreadable lines are skipped. */
export function slowTestsSince(log: string, branch: string, since: Date): SlowTest[] {
  let text: string;
  try {
    text = readFileSync(log, 'utf8');
  } catch {
    return [];
  }
  return text
    .split('\n')
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as SlowTest];
      } catch {
        return [];
      }
    })
    .filter((entry) => entry.branch === branch && new Date(entry.at).getTime() >= since.getTime());
}
