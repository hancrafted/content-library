import { needsBuild } from './needs-build.pure.ts';

export interface Step {
  name: string;
  command: string;
  testLock?: true;
}

export interface Plan {
  label: string;
  phases: readonly (readonly Step[])[];
}

export interface StepRun {
  code: number;
  output: string;
  ms: number;
}

export type Exec = (step: Step) => Promise<StepRun>;

function script(name: string, scriptName: string = name): Step {
  return { name, command: `npm run -s ${scriptName}` };
}

const PREFLIGHT = script('preflight');
const BOUNDARIES = script('boundaries', 'lint:boundaries');
const TYPECHECK = script('typecheck');
const TEST: Step = { ...script('test'), testLock: true };
const LINT = { name: 'lint', command: 'oxlint' };
const FORMAT = script('format', 'format:check');
const TEST_CHANGED: Step = { name: 'test', command: 'vitest run --changed' };

export const VERIFY_PLAN: Plan = {
  label: 'verify',
  phases: [
    [PREFLIGHT, script('archgate', 'archgate:full')],
    [LINT, BOUNDARIES, FORMAT, TYPECHECK, TEST, script('knip'), script('docs', 'check:docs')],
  ],
};

export const QUICK_PLAN: Plan = {
  label: 'verify:quick',
  phases: [[LINT, FORMAT, TYPECHECK, TEST_CHANGED]],
};

export const COMMIT_PLAN: Plan = {
  label: 'verify:commit',
  phases: [
    [PREFLIGHT, script('events', 'check:events')],
    [script('lint-staged')],
    [{ name: 'archgate', command: 'archgate check --staged' }, BOUNDARIES, TYPECHECK, TEST_CHANGED],
  ],
};

export interface PushFacts {
  refs: string;
  mergeBase: string | null;
  changedPaths: readonly string[];
}

const BUILD_PHASES: readonly (readonly Step[])[] = [[script('build')], [script('test:build')]];

/** Why a push builds, or `null` when it need not: a push to main always builds, so CI's deploy never waits on a broken build. */
function buildReason({ refs, mergeBase, changedPaths }: PushFacts): string | null {
  const remoteRefs = refs.split('\n').map((line) => line.trim().split(/\s+/)[2]);
  if (remoteRefs.includes('refs/heads/main')) return 'push to main: building';
  if (mergeBase === null) return 'no merge-base with origin/main: building';
  if (needsBuild(changedPaths)) return `an export input changed since ${mergeBase}: building`;
  return null;
}

export function pushPlan(facts: PushFacts): { plan: Plan; notes: string[] } {
  const { mergeBase } = facts;
  const slowArgs = mergeBase === null ? '' : ` -- --changed ${mergeBase} --passWithNoTests`;
  const slow: Step = { name: 'slow', command: `npm run -s test:slow${slowArgs}`, testLock: true };
  const slowNotes = mergeBase === null ? ['no merge-base with origin/main: running the whole slow lane'] : [];
  const reason = buildReason(facts);
  const notes = [...slowNotes, reason ?? `no export input changed since ${mergeBase}: skipping the build`];
  const phases = [...VERIFY_PLAN.phases, [slow], ...(reason === null ? [] : BUILD_PHASES)];
  return { plan: { label: 'verify:push', phases }, notes };
}

export type Hold = (fn: () => Promise<void>) => Promise<void>;

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

function stepReport(step: Step, run: StepRun): string {
  const took = `(${(run.ms / 1000).toFixed(1)}s)`;
  return run.code === 0 ? `✔ ${step.name} ${took}` : `✖ ${step.name} ${took}\n${run.output}`;
}

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
