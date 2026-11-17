// The verify runner's judgement: which checks run, in which phase, and what to print. The process side lives in
// verify.ts; this file runs a plan against whatever `Exec` it is handed.
import { needsBuild } from './needs-build.pure.ts';

/**
 * One check: the name a failure reports, the shell command that runs it, and whether it runs holding the test lock
 * (tools/load/test-lock.ts), which the test runs of several worktrees' pushes queue on.
 */
export interface Step {
  name: string;
  command: string;
  testLock?: true;
}

/** A named check run: its phases run in order, and the steps of one phase run at the same time. */
export interface Plan {
  label: string;
  phases: readonly (readonly Step[])[];
}

/** A finished step: its exit code, its stdout and stderr as one block, and how long it took. */
export interface StepRun {
  code: number;
  output: string;
  ms: number;
}

export type Exec = (step: Step) => Promise<StepRun>;

/** A step that runs one npm script: a failing line can be rerun as `npm run <script>`. */
function script(name: string, scriptName: string = name): Step {
  return { name, command: `npm run -s ${scriptName}` };
}

const PREFLIGHT = script('preflight');
const BOUNDARIES = script('boundaries', 'lint:boundaries');
const TYPECHECK = script('typecheck');
/** The full fast suite, queued on the test lock so the pushes of several worktrees take turns. */
const TEST: Step = { ...script('test'), testLock: true };
const LINT = { name: 'lint', command: 'oxlint' };
const FORMAT = script('format', 'format:check');
/** Tests that the uncommitted changes affect: the changed files and everything that imports them. */
const TEST_CHANGED: Step = { name: 'test', command: 'vitest run --changed' };

/**
 * `npm run verify`: the two health checks gate the rest, which run side by side. `lint` here is oxlint alone (GEN-005):
 * the `lint` script also runs the boundaries check, which is its own step so the two run side by side.
 */
export const VERIFY_PLAN: Plan = {
  label: 'verify',
  phases: [
    [PREFLIGHT, script('archgate', 'archgate:full')],
    [LINT, BOUNDARIES, FORMAT, TYPECHECK, TEST, script('knip'), script('docs', 'check:docs')],
  ],
};

/** `npm run verify:quick`, the agent loop: whole-repo lint and format, typecheck, and only the tests the uncommitted changes affect. */
export const QUICK_PLAN: Plan = {
  label: 'verify:quick',
  phases: [[LINT, FORMAT, TYPECHECK, TEST_CHANGED]],
};

/** `npm run verify:commit`: lint-staged rewrites staged files, so it runs alone, after the health checks and before the checks that read them. */
export const COMMIT_PLAN: Plan = {
  label: 'verify:commit',
  phases: [
    [PREFLIGHT, script('events', 'check:events')],
    [script('lint-staged')],
    [{ name: 'archgate', command: 'archgate check' }, BOUNDARIES, TYPECHECK, TEST_CHANGED],
  ],
};

/** What pre-push knows when it plans: the pushed refs as git hands them over, and what changed since main. */
export interface PushFacts {
  /** The lines git passes pre-push on stdin: `<local ref> <local sha> <remote ref> <remote sha>`. */
  refs: string;
  /** The merge-base of HEAD with origin/main, or null when they share no history. */
  mergeBase: string | null;
  /** The paths changed from the merge-base to HEAD; none without a merge-base. */
  changedPaths: readonly string[];
}

const BUILD_PHASES: readonly (readonly Step[])[] = [[script('build')], [script('test:build')]];

/** Why a push builds, or `null` when it need not: a push to main always builds, so CI's deploy never waits on a broken build. */
function buildReason({ refs, mergeBase, changedPaths }: PushFacts): string | null {
  const remoteRefs = refs.split('\n').map((line) => line.trim().split(/\s+/)[2]);
  if (remoteRefs.includes('refs/heads/main')) return 'push to main: building';
  if (mergeBase === null) return 'no merge-base with origin/main: running the whole slow lane and building';
  if (needsBuild(changedPaths)) return `an export input changed since ${mergeBase}: building`;
  return null;
}

/**
 * `npm run verify:push`, run by `.husky/pre-push`: the verify plan, then the slow lane for what the branch changed
 * since its merge-base with main (all of it without one), then `build` and `test:build` when the push is to main,
 * has no merge-base, or changed an export input (`needsBuild`). The fast suite and the slow lane hold the test lock;
 * the build does not. `notes` say why it builds or not.
 */
export function pushPlan(facts: PushFacts): { plan: Plan; notes: string[] } {
  const { mergeBase } = facts;
  const slowArgs = mergeBase === null ? '' : ` -- --changed ${mergeBase} --passWithNoTests`;
  const slow: Step = { name: 'slow', command: `npm run -s test:slow${slowArgs}`, testLock: true };
  const reason = buildReason(facts);
  const notes = [reason ?? `no export input changed since ${mergeBase}: skipping the build`];
  const phases = [...VERIFY_PLAN.phases, [slow], ...(reason === null ? [] : BUILD_PHASES)];
  return { plan: { label: 'verify:push', phases }, notes };
}

/** Runs `fn` holding a lock, released once `fn`'s promise settles: withTestLock, or a test's stand-in. */
export type Hold = (fn: () => Promise<void>) => Promise<void>;

/**
 * One hold of a lock, taken on the first `take` and kept until `release`: `take` rejects with the reason when the
 * lock cannot be taken, and `release` resolves once the lock is released (at once when it never was taken).
 */
function heldOnce(hold: Hold): { take: () => Promise<void>; release: () => Promise<void> } {
  let letGo = (): void => undefined;
  let held: Promise<void> = Promise.resolve();
  let taken: Promise<void> | null = null;
  const take = () =>
    (taken ??= new Promise<void>((acquired, failed) => {
      held = hold(() => {
        acquired();
        return new Promise<void>((done) => (letGo = done));
      });
      held.catch(failed);
    }));
  const release = async () => {
    letGo();
    await held.catch(() => undefined);
  };
  return { take, release };
}

/**
 * Wraps `exec` so the plan's `testLock` steps run inside one hold of the lock: taken as the first starts, kept
 * between them, let go once the last has finished. A step that cannot take the lock fails with the reason. Call
 * `release` once the plan ends: it lets go of a hold the plan left open by stopping before its last locked step,
 * and resolves once the lock is released.
 */
export function holdAcrossLockedSteps(
  plan: Plan,
  exec: Exec,
  hold: Hold,
): { exec: Exec; release: () => Promise<void> } {
  let left = plan.phases.flat().filter((step) => step.testLock).length;
  const { take, release } = heldOnce(hold);
  const locked: Exec = async (step) => {
    if (!step.testLock) return exec(step);
    await take();
    try {
      return await exec(step);
    } finally {
      left -= 1;
      if (left === 0) await release();
    }
  };
  return { exec: locked, release };
}

/** A step's line once it finishes; a failing step carries its whole output beneath, never interleaved with another's. */
function stepReport(step: Step, run: StepRun): string {
  const took = `(${(run.ms / 1000).toFixed(1)}s)`;
  return run.code === 0 ? `✔ ${step.name} ${took}` : `✖ ${step.name} ${took}\n${run.output}`;
}

/** Runs `plan` phase by phase, printing one line per finished step, and resolves whether every step passed. */
export async function runPlan(plan: Plan, exec: Exec, print: (text: string) => void): Promise<boolean> {
  for (const phase of plan.phases) {
    const runs = await Promise.all(
      phase.map(async (step) => {
        const run = await exec(step).catch((error: unknown): StepRun => ({
          code: 1,
          output: `${error instanceof Error ? error.message : String(error)}\n`,
          ms: 0,
        }));
        print(stepReport(step, run));
        return { step, run };
      }),
    );
    const failed = runs.filter(({ run }) => run.code !== 0).map(({ step }) => step.name);
    if (failed.length > 0) {
      print(`✖ ${plan.label}: FAIL in ${failed.join(', ')}`);
      return false;
    }
  }
  print(`✔ ${plan.label}: PASS`);
  return true;
}
