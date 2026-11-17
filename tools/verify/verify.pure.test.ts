import { describe, expect, it } from 'vitest';
import {
  COMMIT_PLAN,
  holdAcrossLockedSteps,
  pushPlan,
  QUICK_PLAN,
  runPlan,
  VERIFY_PLAN,
  type Exec,
  type Hold,
  type Plan,
} from './verify.pure.ts';

function fakeExec(codes: Readonly<Record<string, number>> = {}, outputs: Readonly<Record<string, string>> = {}) {
  const log: string[] = [];
  const exec: Exec = async (step) => {
    log.push(`start ${step.name}`);
    await new Promise((resolve) => setTimeout(resolve, 1));
    log.push(`end ${step.name}`);
    return { code: codes[step.name] ?? 0, output: outputs[step.name] ?? '', ms: 1500 };
  };
  return { exec, log };
}

const PLAN: Plan = {
  label: 'verify',
  phases: [
    [{ name: 'preflight', command: 'npm run preflight' }],
    [
      { name: 'lint', command: 'npm run lint' },
      { name: 'test', command: 'vitest run' },
    ],
  ],
};

describe('runPlan', () => {
  describe('success cases', () => {
    it('runs every step of every phase and reports a pass', async () => {
      // ARRANGE
      const { exec, log } = fakeExec();
      const printed: string[] = [];
      const expectedRuns = ['preflight', 'lint', 'test'];
      const expectedVerdict = '✔ verify: PASS';
      // ACT
      const passed = await runPlan(PLAN, exec, (text) => printed.push(text));
      const ran = log.filter((line) => line.startsWith('end ')).map((line) => line.slice('end '.length));
      // ASSERT
      expect(passed).toBe(true);
      expect(ran.sort()).toEqual(expectedRuns.sort());
      expect(printed.at(-1)).toBe(expectedVerdict);
    });

    it('finishes the first phase before the next starts, and runs one phase’s steps side by side', async () => {
      // ARRANGE
      const { exec, log } = fakeExec();
      const expectedLog = ['start preflight', 'end preflight', 'start lint', 'start test', 'end lint', 'end test'];
      // ACT
      await runPlan(PLAN, exec, () => undefined);
      // ASSERT
      expect(log).toEqual(expectedLog);
    });
  });

  describe('failure cases', () => {
    it('stops before the next phase when a step fails, and names it', async () => {
      // ARRANGE
      const { exec, log } = fakeExec({ preflight: 1 });
      const printed: string[] = [];
      const expectedLog = ['start preflight', 'end preflight'];
      const expectedVerdict = '✖ verify: FAIL in preflight';
      // ACT
      const passed = await runPlan(PLAN, exec, (text) => printed.push(text));
      // ASSERT
      expect(passed).toBe(false);
      expect(log).toEqual(expectedLog);
      expect(printed.at(-1)).toBe(expectedVerdict);
    });

    it('lets every step of a failing phase finish, and names each one that failed', async () => {
      // ARRANGE
      const { exec, log } = fakeExec({ lint: 1, test: 2 });
      const printed: string[] = [];
      const expectedEnds = ['end preflight', 'end lint', 'end test'];
      const expectedVerdict = '✖ verify: FAIL in lint, test';
      // ACT
      await runPlan(PLAN, exec, (text) => printed.push(text));
      const ends = log.filter((line) => line.startsWith('end '));
      // ASSERT
      expect(ends).toEqual(expectedEnds);
      expect(printed.at(-1)).toBe(expectedVerdict);
    });

    it('prints a failing step’s output as one block under its line', async () => {
      // ARRANGE
      const lintOutput = 'src/a.ts\n  1:1  error  no-unused-vars\n';
      const { exec } = fakeExec({ lint: 1 }, { lint: lintOutput, test: 'Tests 3 passed\n' });
      const printed: string[] = [];
      const expectedLintBlock = `✖ lint (1.5s)\n${lintOutput}`;
      const expectedTestLine = '✔ test (1.5s)';
      // ACT
      await runPlan(PLAN, exec, (text) => printed.push(text));
      // ASSERT
      expect(printed).toContain(expectedLintBlock);
      expect(printed).toContain(expectedTestLine);
    });
  });

  describe('edge cases', () => {
    it('reports a step that cannot start as failed, with the reason, while the rest of its phase finishes', async () => {
      // ARRANGE
      const { exec: inner, log } = fakeExec();
      const reason = 'spawn sh ENOENT';
      const exec: Exec = (step) => (step.name === 'lint' ? Promise.reject(new Error(reason)) : inner(step));
      const printed: string[] = [];
      const expectedLintBlock = `✖ lint (0.0s)\n${reason}\n`;
      const expectedVerdict = '✖ verify: FAIL in lint';
      // ACT
      const passed = await runPlan(PLAN, exec, (text) => printed.push(text));
      // ASSERT
      expect(passed).toBe(false);
      expect(log).toContain('end test');
      expect(printed).toContain(expectedLintBlock);
      expect(printed.at(-1)).toBe(expectedVerdict);
    });
  });

  describe('the named plans', () => {
    const commandOf = (plan: Plan, name: string) => plan.phases.flat().find((step) => step.name === name)?.command;

    it('quick plan runs whole-repo lint and format, typecheck and the tests of uncommitted changes', () => {
      // ARRANGE
      const expectedLabel = 'verify:quick';
      const expectedSteps = ['lint', 'format', 'typecheck', 'test'];
      const expectedTest = 'vitest run --changed';
      // ACT
      const steps = QUICK_PLAN.phases.flat().map((step) => step.name);
      // ASSERT
      expect(QUICK_PLAN.label).toBe(expectedLabel);
      expect(steps).toEqual(expectedSteps);
      expect(commandOf(QUICK_PLAN, 'test')).toBe(expectedTest);
      expect(commandOf(QUICK_PLAN, 'lint')).toBe(commandOf(VERIFY_PLAN, 'lint'));
      expect(commandOf(QUICK_PLAN, 'format')).toBe(commandOf(VERIFY_PLAN, 'format'));
    });

    it('commit plan runs only the tests that the change affects', () => {
      // ARRANGE
      const expectedTest = 'vitest run --changed';
      // ACT
      const command = commandOf(COMMIT_PLAN, 'test');
      // ASSERT
      expect(command).toBe(expectedTest);
    });

    it('commit plan checks only the staged files against the ADRs, while the verify plan checks the whole repo', () => {
      // ARRANGE
      const expectedCommitArchgate = 'archgate check --staged';
      const expectedVerifyArchgate = 'npm run -s archgate:full';
      // ACT
      const commitArchgate = commandOf(COMMIT_PLAN, 'archgate');
      const verifyArchgate = commandOf(VERIFY_PLAN, 'archgate');
      // ASSERT
      expect(commitArchgate).toBe(expectedCommitArchgate);
      expect(verifyArchgate).toBe(expectedVerifyArchgate);
    });

    it('only the full fast suite of the verify plan queues on the test lock', () => {
      // ARRANGE
      const expectedLocked = [{ plan: 'verify', step: 'test' }];
      // ACT
      const locked = [VERIFY_PLAN, QUICK_PLAN, COMMIT_PLAN].flatMap((plan) =>
        plan.phases
          .flat()
          .filter((step) => step.testLock)
          .map((step) => ({ plan: plan.label, step: step.name })),
      );
      // ASSERT
      expect(locked).toEqual(expectedLocked);
    });

    it('verify plan keeps CI parity: it runs the whole suite', () => {
      // ARRANGE
      const expectedTest = 'npm run -s test';
      // ACT
      const command = commandOf(VERIFY_PLAN, 'test');
      // ASSERT
      expect(command).toBe(expectedTest);
    });
  });
});

const pushed = (local: string, remote: string) => `refs/heads/${local} 1111111 refs/heads/${remote} 2222222\n`;

const MERGE_BASE = 'abc1234';

const tail = (plan: Plan) =>
  plan.phases
    .slice(VERIFY_PLAN.phases.length)
    .map((phase) => phase.map((step) => `${step.name}: ${step.command}${step.testLock ? ' [test lock]' : ''}`));

describe('pushPlan', () => {
  describe('success cases', () => {
    it('runs the verify plan, then the slow lane for what changed since the merge-base, then the build for an export change', () => {
      // ARRANGE
      const facts = { refs: pushed('feat/x', 'feat/x'), mergeBase: MERGE_BASE, changedPaths: ['src/app/page.tsx'] };
      const expectedLabel = 'verify:push';
      const expectedTail = [
        ['slow: npm run -s test:slow -- --changed abc1234 --passWithNoTests [test lock]'],
        ['build: npm run -s build'],
        ['test:build: npm run -s test:build'],
      ];
      const expectedNotes = ['an export input changed since abc1234: building'];
      // ACT
      const { plan, notes } = pushPlan(facts);
      // ASSERT
      expect(plan.label).toBe(expectedLabel);
      expect(plan.phases.slice(0, VERIFY_PLAN.phases.length)).toEqual(VERIFY_PLAN.phases);
      expect(tail(plan)).toEqual(expectedTail);
      expect(notes).toEqual(expectedNotes);
    });

    it('builds on a push to main, even when nothing the export reads changed', () => {
      // ARRANGE
      const facts = { refs: pushed('main', 'main'), mergeBase: MERGE_BASE, changedPaths: ['docs/a.md'] };
      const expectedBuild = [['build: npm run -s build'], ['test:build: npm run -s test:build']];
      const expectedNotes = ['push to main: building'];
      // ACT
      const { plan, notes } = pushPlan(facts);
      // ASSERT
      expect(tail(plan).slice(1)).toEqual(expectedBuild);
      expect(notes).toEqual(expectedNotes);
    });

    it('skips the build for a docs-only branch, and still runs the slow lane for what it changed', () => {
      // ARRANGE
      const facts = { refs: pushed('docs/x', 'docs/x'), mergeBase: MERGE_BASE, changedPaths: ['docs/a.md'] };
      const expectedTail = [['slow: npm run -s test:slow -- --changed abc1234 --passWithNoTests [test lock]']];
      const expectedNotes = ['no export input changed since abc1234: skipping the build'];
      // ACT
      const { plan, notes } = pushPlan(facts);
      // ASSERT
      expect(tail(plan)).toEqual(expectedTail);
      expect(notes).toEqual(expectedNotes);
    });
  });

  describe('edge cases', () => {
    it('runs the whole slow lane and builds when HEAD has no merge-base with main', () => {
      // ARRANGE
      const facts = { refs: pushed('orphan', 'orphan'), mergeBase: null, changedPaths: [] };
      const expectedTail = [
        ['slow: npm run -s test:slow [test lock]'],
        ['build: npm run -s build'],
        ['test:build: npm run -s test:build'],
      ];
      const expectedNotes = [
        'no merge-base with origin/main: running the whole slow lane',
        'no merge-base with origin/main: building',
      ];
      // ACT
      const { plan, notes } = pushPlan(facts);
      // ASSERT
      expect(tail(plan)).toEqual(expectedTail);
      expect(notes).toEqual(expectedNotes);
    });

    it('reads a push to main from the remote ref, not from the local branch name', () => {
      // ARRANGE
      const facts = { refs: pushed('main', 'feat/x'), mergeBase: MERGE_BASE, changedPaths: ['docs/a.md'] };
      const expectedNotes = ['no export input changed since abc1234: skipping the build'];
      // ACT
      const { notes } = pushPlan(facts);
      // ASSERT
      expect(notes).toEqual(expectedNotes);
    });
  });
});

function fakeHold(log: string[], refuse?: string): Hold {
  return async (fn) => {
    if (refuse !== undefined) throw new Error(refuse);
    log.push('take');
    try {
      await fn();
    } finally {
      log.push('release');
    }
  };
}

const step = (name: string, testLock?: true) => ({ name, command: name, ...(testLock ? { testLock } : {}) });

const LOCKED_PLAN: Plan = {
  label: 'verify:push',
  phases: [[step('lint'), step('test', true)], [step('slow', true)], [step('build')]],
};

describe('holdAcrossLockedSteps', () => {
  describe('success cases', () => {
    it('takes the lock once for the first locked step and holds it through the last, never around the build', async () => {
      // ARRANGE
      const { exec: inner, log } = fakeExec();
      const { exec, release } = holdAcrossLockedSteps(LOCKED_PLAN, inner, fakeHold(log));
      const expectedLog = [
        'start lint',
        'take',
        'start test',
        'end lint',
        'end test',
        'start slow',
        'end slow',
        'release',
        'start build',
        'end build',
      ];
      // ACT
      await runPlan(LOCKED_PLAN, exec, () => undefined);
      await release();
      // ASSERT
      expect(log).toEqual(expectedLog);
    });
  });

  describe('failure cases', () => {
    it('lets go once the plan stops before its last locked step', async () => {
      // ARRANGE
      const { exec: inner, log } = fakeExec({ lint: 1 });
      const { exec, release } = holdAcrossLockedSteps(LOCKED_PLAN, inner, fakeHold(log));
      const expectedBefore: string[] = [];
      const expectedAfter = ['release'];
      // ACT
      await runPlan(LOCKED_PLAN, exec, () => undefined);
      const beforeRelease = log.filter((entry) => entry === 'release');
      await release();
      const afterRelease = log.filter((entry) => entry === 'release');
      // ASSERT
      expect(beforeRelease).toEqual(expectedBefore);
      expect(afterRelease).toEqual(expectedAfter);
    });

    it('fails a locked step that cannot take the lock, naming why, without running it', async () => {
      // ARRANGE
      const { exec: inner, log } = fakeExec();
      const reason = 'timed out waiting for lock "test"';
      const { exec, release } = holdAcrossLockedSteps(LOCKED_PLAN, inner, fakeHold(log, reason));
      const printed: string[] = [];
      const expectedBlock = `✖ test (0.0s)\n${reason}\n`;
      const neverStarted = 'start test';
      // ACT
      const passed = await runPlan(LOCKED_PLAN, exec, (text) => printed.push(text));
      await release();
      // ASSERT
      expect(passed).toBe(false);
      expect(log).not.toContain(neverStarted);
      expect(printed).toContain(expectedBlock);
    });
  });

  describe('edge cases', () => {
    it('never takes the lock for a plan without a locked step', async () => {
      // ARRANGE
      const { exec: inner, log } = fakeExec();
      const { exec, release } = holdAcrossLockedSteps(QUICK_PLAN, inner, fakeHold(log));
      const taken = 'take';
      // ACT
      await runPlan(QUICK_PLAN, exec, () => undefined);
      await release();
      // ASSERT
      expect(log).not.toContain(taken);
    });
  });
});
