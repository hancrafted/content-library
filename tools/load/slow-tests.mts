// The slow-tests log: every fast-suite test that ran past 750 ms, one JSON line each, in the git common directory so
// every worktree of the repository writes to the one file. The fast config reports into it (SlowTestsLog). Its
// readers ask two questions, both from a working directory: what a branch logged since a time (slowTestReport:
// `verify` since its run started, `wt:done` since the branch forked) and keep the last 30 days (trimSlowTests).
import { appendFileSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Reporter, TestCase } from 'vitest/node';
import { currentBranch, gitCommonDir } from './git.ts';

/**
 * A fast test that runs past this is logged. CI fails a fast test over 3 s (ARCH-003-testing §4.4), and CI's runners
 * run the suite about 4 times slower than a developer's Mac, so 750 ms here is about 3 s there: a test heading for
 * CI's limit.
 */
const SLOW_TEST_MS = 750;

/** How long the log keeps an entry. */
const KEEP_DAYS = 30;

/**
 * One logged test: its full name, its file relative to the repo root, how long it ran, the load factor the run
 * measured (tools/load/workers.mts; absent in entries logged before it was recorded), where and when.
 */
type SlowTest = { test: string; file: string; ms: number; loadFactor?: number; branch: string; at: string };

/** The log's path for the repository `cwd` sits in, or null outside a git repository. */
function slowTestsLogPath(cwd: string): string | null {
  const commonDir = gitCommonDir(cwd);
  return commonDir === null ? null : path.join(commonDir, 'slow-tests.jsonl');
}

/** How many tests, as the slow-tests lines say it: `1 test`, `3 tests`. */
const testCount = (count: number): string => (count === 1 ? '1 test' : `${count} tests`);

/**
 * A Vitest reporter that appends each test over SLOW_TEST_MS to the slow-tests log as it finishes, with the load
 * factor of the run. A test the load-aware timeout let pass is still a test creeping towards CI's limit. Logging
 * never fails a run: outside a git repository, or when the log cannot be written, the test goes unlogged.
 */
export class SlowTestsLog implements Reporter {
  private readonly log: string | null;
  private readonly branch: string;
  private readonly now: () => Date;
  private readonly loadFactor: number;

  constructor({
    cwd = process.cwd(),
    now = () => new Date(),
    loadFactor,
  }: {
    cwd?: string;
    now?: () => Date;
    loadFactor: number;
  }) {
    this.log = slowTestsLogPath(cwd);
    this.branch = currentBranch(cwd);
    this.now = now;
    this.loadFactor = Math.round(loadFactor * 10) / 10;
  }

  onTestCaseResult(testCase: TestCase): void {
    const ms = Math.round(testCase.diagnostic()?.duration ?? 0);
    if (this.log === null || ms <= SLOW_TEST_MS) return;
    const entry: SlowTest = {
      test: testCase.fullName,
      file: testCase.module.relativeModuleId,
      ms,
      loadFactor: this.loadFactor,
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

/** The log's entries, oldest first; none when there is no log yet. Unreadable lines are skipped. */
function readSlowTests(log: string): SlowTest[] | null {
  let text: string;
  try {
    text = readFileSync(log, 'utf8');
  } catch {
    return null;
  }
  return text.split('\n').flatMap((line) => {
    try {
      return [JSON.parse(line) as SlowTest];
    } catch {
      return [];
    }
  });
}

/** One entry as a report prints it: time, load factor when logged, test and when it ran. */
function formatSlowTest(entry: SlowTest): string {
  const load = entry.loadFactor === undefined ? '' : ` at load ${entry.loadFactor.toFixed(1)}`;
  return `  ${(entry.ms / 1000).toFixed(1)} s${load}  ${entry.file} > ${entry.test}  (${entry.at})`;
}

/**
 * The lines to print about the tests `branch` logged at or after `since`, in the log of the repository `cwd` sits
 * in: a header naming the count, the branch and the caller's `note` (`CI fails at 3 s`), then one line per entry,
 * oldest first. Empty when there are none, no log yet, or `cwd` is outside a git repository.
 */
export function slowTestReport({
  cwd,
  branch,
  since,
  note,
}: {
  cwd: string;
  branch: string;
  since: Date;
  note: string;
}): string[] {
  const log = slowTestsLogPath(cwd);
  const entries = (log === null ? null : readSlowTests(log)) ?? [];
  const logged = entries.filter((entry) => entry.branch === branch && new Date(entry.at).getTime() >= since.getTime());
  if (logged.length === 0) return [];
  return [
    `! ${testCount(logged.length)} ran past ${SLOW_TEST_MS} ms on ${branch} (${note}):`,
    ...logged.map(formatSlowTest),
  ];
}

/**
 * Rewrites the log of the repository `cwd` sits in with only the entries logged in the KEEP_DAYS before `now`,
 * dropping unreadable lines; leaves a missing log missing and does nothing outside a git repository. The new log
 * replaces the old by rename, so a reader never sees half of it; an entry a test run appends between the read and
 * the rename is lost, which costs one line of a diagnostic log.
 */
export function trimSlowTests({ cwd, now }: { cwd: string; now: Date }): void {
  const log = slowTestsLogPath(cwd);
  const entries = log === null ? null : readSlowTests(log);
  if (log === null || entries === null) return;
  const cutoff = now.getTime() - KEEP_DAYS * 24 * 60 * 60 * 1000;
  const kept = entries.filter((entry) => new Date(entry.at).getTime() >= cutoff);
  const next = `${log}.${process.pid}.tmp`;
  writeFileSync(next, kept.map((entry) => JSON.stringify(entry) + '\n').join(''));
  renameSync(next, log);
}
