// decision: ARCH-003 §4.4
import { appendFileSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Reporter, TestCase } from 'vitest/node';
import { currentBranch, gitCommonDir } from './git.ts';

/**
 * A fast test that runs past this is logged. CI fails a fast test over 3 s (ARCH-003-testing §4.4), and CI's runners
 * run the suite about 4 times slower than a developer's Mac, so 750 ms here is about 3 s there: a test heading for
 * CI's limit.
 */
const SLOW_TEST_MILLISECONDS = 750;

const KEEP_DAYS = 30;

type SlowTest = { test: string; file: string; ms: number; loadFactor?: number; branch: string; at: string };

function slowTestsLogPath(cwd: string): string | null {
  const commonDir = gitCommonDir(cwd);
  return commonDir === null ? null : path.join(commonDir, 'slow-tests.jsonl');
}

const testCount = (count: number): string => (count === 1 ? '1 test' : `${count} tests`);

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
    if (this.log === null || ms <= SLOW_TEST_MILLISECONDS) return;
    const entry: SlowTest = {
      test: testCase.fullName,
      file: testCase.module.relativeModuleId,
      ms,
      loadFactor: this.loadFactor,
      branch: this.branch,
      at: this.now().toISOString(),
    };
    appendUnlessLogUnwritable(this.log, entry);
  }
}

function appendUnlessLogUnwritable(log: string, entry: SlowTest): void {
  try {
    appendFileSync(log, JSON.stringify(entry) + '\n');
  } catch {
    return;
  }
}

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

function formatSlowTest(entry: SlowTest): string {
  const load = entry.loadFactor === undefined ? '' : ` at load ${entry.loadFactor.toFixed(1)}`;
  return `  ${(entry.ms / 1000).toFixed(1)} s${load}  ${entry.file} > ${entry.test}  (${entry.at})`;
}

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
    `! ${testCount(logged.length)} ran past ${SLOW_TEST_MILLISECONDS} ms on ${branch} (${note}):`,
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
