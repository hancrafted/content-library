import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const WORKFLOW = '.github/workflows/ci.yml';

interface Workflow {
  jobs: Record<string, { steps: { run?: string }[] }>;
  on: { pull_request?: unknown; push?: { branches?: string[]; 'branches-ignore'?: string[] } };
  concurrency: { group: string; 'cancel-in-progress': boolean };
}

const workflow = (): Workflow =>
  parse(readFileSync(path.join(import.meta.dirname, '../..', WORKFLOW), 'utf8')) as Workflow;

describe('the CI workflow', () => {
  it('runs on pull requests', () => {
    // ARRANGE
    const { on } = workflow();
    // ACT
    const triggers = Object.keys(on);
    // ASSERT
    expect(triggers).toContain('pull_request');
  });

  it('runs on a push to every branch, so a branch pushed without a PR is still checked', () => {
    // ARRANGE
    const everyBranch = ['**'];
    // ACT
    const { push } = workflow().on;
    // ASSERT
    expect(push?.branches).toEqual(everyBranch);
    expect(push?.['branches-ignore']).toBeUndefined();
  });

  it('cancels the run in progress when a newer one starts on the same ref', () => {
    // ARRANGE
    const perRef = '${{ github.ref }}';
    // ACT
    const { concurrency } = workflow();
    // ASSERT
    expect(concurrency.group).toContain(perRef);
    expect(concurrency['cancel-in-progress']).toBe(true);
  });

  it('runs the typecheck in a lane of its own, because next build skips it', async () => {
    // ARRANGE
    const { default: nextConfig } = await import('../../next.config');
    // ACT
    const lanesWithTypecheck = Object.values(workflow().jobs).filter((job) =>
      job.steps.some((step) => step.run === 'npm run typecheck'),
    );
    // ASSERT
    expect(nextConfig.typescript?.ignoreBuildErrors).toBe(true);
    expect(lanesWithTypecheck).toHaveLength(1);
  });

  it('fails the fast-suite lane on any test over 3 s, from the JSON report its test run writes (ARCH-003 §4.4)', () => {
    // ARRANGE
    const report = 'fast-suite.json';
    const budget = `node tools/test-budget/over-budget.ts ${report} 3000`;
    const fastLane = Object.values(workflow().jobs).find((job) =>
      job.steps.some((step) => step.run?.startsWith('npm test')),
    );
    // ACT
    const runs = (fastLane?.steps ?? []).map((step) => step.run ?? '');
    const testRun = runs.find((run) => run.startsWith('npm test'));
    const budgetRun = runs.find((run) => run.includes('over-budget.ts'));
    // ASSERT
    expect(testRun).toContain(`--outputFile.json=${report}`);
    expect(budgetRun).toContain(budget);
    expect(budgetRun).toContain('exit 1');
  });
});
