import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const WORKFLOW = '.github/workflows/ci.yml';
const DEPLOY_WORKFLOW = '.github/workflows/deploy-cloudflare.yml';

interface Workflow {
  name: string;
  jobs: Record<string, { if?: string; steps: { uses?: string; run?: string; with?: Record<string, unknown> }[] }>;
  on: {
    pull_request?: unknown;
    push?: { branches?: string[]; 'branches-ignore'?: string[] };
    workflow_run?: { workflows?: string[]; types?: string[]; branches?: string[] };
  };
  concurrency: { group: string; 'cancel-in-progress': boolean };
}

interface DeployJob {
  environment: { name: string; url: string };
}

const read = (file: string): Workflow =>
  parse(readFileSync(path.join(import.meta.dirname, '../..', file), 'utf8')) as Workflow;
const workflow = (): Workflow => read(WORKFLOW);
const deployWorkflow = (): Workflow => read(DEPLOY_WORKFLOW);

describe('the CI workflow', () => {
  it('runs on push only, so a push to a PR branch starts one run and a PR shows that run as its checks', () => {
    // ARRANGE
    const pushOnly = ['push'];
    // ACT
    const triggers = Object.keys(workflow().on);
    // ASSERT
    expect(triggers).toEqual(pushOnly);
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

  it('keeps one run per branch: a newer push cancels the older run', () => {
    // ARRANGE
    const perBranch = '${{ github.workflow }}-${{ github.ref }}';
    // ACT
    const { concurrency } = workflow();
    // ASSERT
    expect(concurrency.group).toBe(perBranch);
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

describe('the Cloudflare deploy workflow', () => {
  it('deploys production only after CI completes on main: no push trigger, previews and the manual run stay', () => {
    // ARRANGE
    const triggers = ['pull_request', 'workflow_dispatch', 'workflow_run'];
    const ciCompletedOnMain = { workflows: [workflow().name], types: ['completed'], branches: ['main'] };
    // ACT
    const { on } = deployWorkflow();
    // ASSERT
    expect(Object.keys(on).sort()).toEqual(triggers);
    expect(on.workflow_run).toEqual(ciCompletedOnMain);
  });

  it('builds after a CI run only when that run succeeded, so a failed or cancelled CI never deploys', () => {
    // ARRANGE
    const ciRun = "github.event_name == 'workflow_run' && github.event.workflow_run.conclusion == 'success'";
    // ACT
    const gate = deployWorkflow().jobs.build?.if;
    // ASSERT
    expect(gate).toContain(ciRun);
  });

  it('builds the commit CI tested, not whatever main points at by the time CI finishes', () => {
    // ARRANGE
    const testedCommit = '${{ github.event.workflow_run.head_sha }}';
    // ACT
    const checkout = deployWorkflow().jobs.build?.steps.find((step) => step.uses?.startsWith('actions/checkout@'));
    // ASSERT
    expect(checkout?.with?.ref).toBe(testedCommit);
  });

  it('treats every event but a pull request as production, so a run started by CI never lands in a preview', () => {
    // ARRANGE
    const pullRequestElseProduction =
      /\$\{\{ github\.event_name == 'pull_request' && .+ \|\| '(production|https:\/\/hancrafted\.net)' \}\}$/;
    const { concurrency, jobs } = deployWorkflow();
    const { environment } = jobs.deploy as unknown as DeployJob;
    // ACT
    const switches = [concurrency.group, environment.name, environment.url];
    // ASSERT
    for (const expression of switches) expect(expression).toMatch(pullRequestElseProduction);
  });
});
