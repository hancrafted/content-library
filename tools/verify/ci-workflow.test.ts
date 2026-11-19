import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const WORKFLOW = '.github/workflows/ci.yml';
const DEPLOY_WORKFLOW = '.github/workflows/deploy-cloudflare.yml';

interface Step {
  id?: string;
  if?: string;
  uses?: string;
  run?: string;
  with?: Record<string, unknown>;
}

interface Workflow {
  name: string;
  jobs: Record<
    string,
    {
      name?: string;
      if?: string;
      needs?: string[];
      env?: Record<string, string>;
      outputs?: Record<string, string>;
      steps: Step[];
    }
  >;
  permissions?: Record<string, string>;
  on: {
    pull_request?: unknown;
    workflow_dispatch?: { inputs?: Record<string, { required?: boolean }> };
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
function evaluate(expression: string | undefined, context: Record<string, string>): string {
  const match = /^\$\{\{ (\S+) (==|!=) '([^']*)' && '([^']*)' \|\| '([^']*)' \}\}$/.exec(expression ?? '');
  if (!match) throw new Error(`unsupported expression: ${expression}`);
  const [, key, operator, literal, whenTrue, otherwise] = match;
  const condition = (context[key!] === literal) === (operator === '==');
  return condition && whenTrue ? whenTrue : otherwise!;
}
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

const stepRunning = (job: string, run: string | RegExp): Step | undefined =>
  workflow().jobs[job]?.steps.find((step) => (typeof run === 'string' ? step.run === run : run.test(step.run ?? '')));
const NOT_DOCS_ONLY = "steps.kind.outputs.docs-only != 'true'";

describe('the CI preview and post-build jobs', () => {
  it('gates the preview job on the export job and its build output', () => {
    // ARRANGE
    const { export: exportJob, preview } = workflow().jobs;
    // ACT
    const needs = [preview?.needs ?? []].flat();
    // ASSERT
    expect(needs).toContain('export');
    expect(exportJob?.outputs).toHaveProperty('build');
    expect(preview?.if).toContain('needs.export.outputs.build');
  });

  it('runs the post-build suite in a build-test job beside the preview, not inside export', () => {
    // ARRANGE
    const { export: exportJob, preview, 'build-test': buildTest } = workflow().jobs;
    const runs = (job?: { steps?: Step[] }) => (job?.steps ?? []).map((step) => step.run ?? '');
    // ACT
    const previewNeeds = [preview?.needs ?? []].flat();
    // ASSERT
    expect([buildTest?.needs ?? []].flat()).toEqual(['export']);
    expect(previewNeeds).not.toContain('build-test');
    expect(runs(buildTest)).toContain('npm run test:build');
    expect(runs(exportJob)).not.toContain('npm run test:build');
  });

  it('builds the post-build suite with the same env as the export it tests', () => {
    // ARRANGE
    const { export: exportJob, 'build-test': buildTest } = workflow().jobs;
    // ACT
    // ASSERT
    expect(exportJob?.env).toBeDefined();
    expect(buildTest?.env).toEqual(exportJob?.env);
  });

  it('keeps main out of the preview, since production publishes it', () => {
    // ARRANGE
    const condition = workflow().jobs.preview?.if ?? '';
    // ACT
    // ASSERT
    expect(condition).toContain("github.ref != 'refs/heads/main'");
  });

  it('keeps forks and Dependabot away from the preview', () => {
    // ARRANGE
    const condition = workflow().jobs.preview?.if ?? '';
    // ACT
    // ASSERT
    expect(condition).toContain('github.repository');
    expect(condition).toContain('dependabot[bot]');
  });
});

describe('the CI docs lane', () => {
  it('asks verify:change-kind itself in each of the three jobs, after npm ci and never on main', () => {
    // ARRANGE
    const jobs = ['static', 'unit', 'export'];
    // ACT
    const detects = jobs.map((job) => {
      const steps = workflow().jobs[job]?.steps ?? [];
      const detect = steps.find((step) => step.id === 'kind');
      return {
        afterInstall: steps.findIndex((step) => step === detect) > steps.findIndex((step) => step.run === 'npm ci'),
        run: detect?.run,
        main: detect?.if,
      };
    });
    // ASSERT
    for (const { afterInstall, run, main } of detects) {
      expect(afterInstall).toBe(true);
      expect(run).toContain('git merge-base origin/main HEAD');
      expect(run).toContain('verify:change-kind');
      expect(run).toContain('$GITHUB_OUTPUT');
      expect(main).toBe("github.ref != 'refs/heads/main'");
    }
  });

  it('skips lint, typecheck and knip only on docs-only, and keeps preflight, archgate, format and check:docs always', () => {
    // ARRANGE
    const steps = workflow().jobs.static?.steps ?? [];
    const skipped = ['npm run lint', 'npm run typecheck', 'npm run knip'];
    const kept = ['npm run preflight', 'npm run archgate:full', 'npm run format:check', 'npm run check:docs'];
    // ACT
    const conditionOf = (run: string) => steps.find((step) => step.run === run);
    // ASSERT
    for (const run of skipped) expect(conditionOf(run)?.if).toBe(NOT_DOCS_ONLY);
    for (const run of kept) {
      expect(conditionOf(run)).toBeDefined();
      expect(conditionOf(run)?.if).toBeUndefined();
    }
  });

  it('runs the full fast suite and its budget unless docs-only, and vitest --changed origin/main on docs-only', () => {
    // ARRANGE
    const steps = workflow().jobs.unit?.steps ?? [];
    // ACT
    const full = steps.find((step) => step.run?.startsWith('npm test'));
    const budget = steps.find((step) => step.run?.includes('over-budget.ts'));
    const changed = steps.find((step) => step.run?.includes('--changed origin/main'));
    // ASSERT
    expect(full?.if).toBe(NOT_DOCS_ONLY);
    expect(budget?.if).toBe(NOT_DOCS_ONLY);
    expect(changed?.if).toBe("steps.kind.outputs.docs-only == 'true'");
    expect(changed?.run).toMatch(/^npx vitest run --changed origin\/main/);
  });

  it('skips the build and the upload only on docs-only, and publishes both outputs', () => {
    // ARRANGE
    const { export: job } = workflow().jobs;
    const build = stepRunning('export', 'npm run build');
    const upload = job?.steps.find((step) => step.uses?.startsWith('actions/upload-artifact@'));
    // ACT
    // ASSERT
    expect(build?.if).toBe(NOT_DOCS_ONLY);
    expect(upload?.if).toBe(NOT_DOCS_ONLY);
    expect(job?.outputs).toEqual({
      build: '${{ steps.kind.outputs.build }}',
      'docs-only': '${{ steps.kind.outputs.docs-only }}',
    });
  });

  it('skips nothing on main: every skip reads an output the detect step leaves empty there', () => {
    // ARRANGE
    const conditions = Object.values(workflow().jobs).flatMap((job) => job.steps.map((step) => step.if ?? ''));
    // ACT
    const readsDocsOnly = conditions.filter((condition) => condition.includes('docs-only'));
    // ASSERT
    expect(readsDocsOnly.length).toBeGreaterThan(0);
    for (const condition of readsDocsOnly)
      expect(condition).toMatch(/^steps\.kind\.outputs\.docs-only (!=|==) 'true'$/);
    expect(workflow().jobs['build-test']?.if).toBe("needs.export.outputs.docs-only != 'true'");
  });

  it('skips build-test, and so the preview, on docs-only, and keeps their job names for the required checks', () => {
    // ARRANGE
    const { 'build-test': buildTest, preview } = workflow().jobs;
    // ACT
    // ASSERT
    expect(buildTest?.if).toBe("needs.export.outputs.docs-only != 'true'");
    expect(preview?.if).toContain("needs.export.outputs.build == 'true'");
    expect(Object.values(workflow().jobs).map((job) => job.name)).toEqual([
      'preflight, archgate, lint, typecheck',
      'unit tests',
      'build',
      'post-build tests',
      'build, post-build tests',
      'deploy to Cloudflare Pages (preview)',
    ]);
  });

  it('lets the gate accept a skipped build-test only on docs-only', () => {
    // ARRANGE
    const { gate } = workflow().jobs;
    const run = gate?.steps.map((step) => step.run ?? '').join('\n') ?? '';
    const run_ = (build: string, postBuild: string, docsOnly: string) =>
      spawnSync('sh', ['-c', run], {
        env: { ...process.env, BUILD: build, POST_BUILD: postBuild, DOCS_ONLY: docsOnly },
      }).status;
    // ACT
    const verdicts = {
      passes: run_('success', 'success', ''),
      docsOnlySkip: run_('success', 'skipped', 'true'),
      otherSkip: run_('success', 'skipped', ''),
      skipAfterFailedBuild: run_('failure', 'skipped', 'true'),
      failedTests: run_('success', 'failure', 'true'),
    };
    // ASSERT
    expect(gate?.if).toBe('always()');
    expect(verdicts).toEqual({ passes: 0, docsOnlySkip: 0, otherSkip: 1, skipAfterFailedBuild: 1, failedTests: 1 });
  });
});

describe('the Cloudflare deploy workflow', () => {
  it('deploys production only after CI completes on main: no push trigger and no pull_request trigger, the manual run stays', () => {
    // ARRANGE
    const triggers = ['workflow_dispatch', 'workflow_run'];
    const ciCompletedOnMain = { workflows: [workflow().name], types: ['completed'], branches: ['main'] };
    // ACT
    const { on } = deployWorkflow();
    // ASSERT
    expect(Object.keys(on).sort()).toEqual(triggers);
    expect(on.workflow_run).toEqual(ciCompletedOnMain);
  });

  it('builds after a CI run only when that run succeeded, so a failed or cancelled CI never deploys', () => {
    // ARRANGE
    // ACT
    const gate = deployWorkflow().jobs.deploy?.if;
    // ASSERT
    expect(gate).toContain("github.event.workflow_run.conclusion == 'success'");
  });

  it('publishes the artifact of the CI run that tested the commit: no checkout, no install, no build', () => {
    // ARRANGE
    const { steps } = deployWorkflow().jobs.deploy ?? { steps: [] };
    // ACT
    const download = steps.find((step) => step.uses?.startsWith('actions/download-artifact@'));
    const runs = steps.map((step) => step.run ?? '').join('\n');
    // ASSERT
    expect(download?.with?.['run-id']).toBe('${{ steps.run.outputs.id }}');
    expect(steps.some((step) => step.uses?.startsWith('actions/checkout@'))).toBe(false);
    expect(runs).not.toMatch(/npm (ci|run build)/);
  });

  it('lets a manual run name a CI run to redeploy, and reads that run through actions: read', () => {
    // ARRANGE
    const { on, permissions } = deployWorkflow();
    // ACT
    const input = on.workflow_dispatch?.inputs?.['run-id'];
    // ASSERT
    expect(input?.required).toBe(false);
    expect(permissions?.actions).toBe('read');
  });

  it("keeps main's export for 30 days so an older run can be redeployed, and other refs' for a day", () => {
    // ARRANGE
    const upload = workflow().jobs.export?.steps.find((step) => step.uses?.startsWith('actions/upload-artifact@'));
    // ACT
    const retention = String(upload?.with?.['retention-days']);
    // ASSERT
    expect(retention).toContain("refs/heads/main' && 30 || 1");
  });

  it('builds the production shape on main and the preview shape elsewhere', () => {
    // ARRANGE
    const { export: build, 'build-test': buildTest } = workflow().jobs;
    // ACT
    const listed = (job: typeof build, ref: string) =>
      evaluate(job?.env?.LIST_UPCOMING_EPISODES, { 'github.ref': ref });
    // ASSERT
    for (const job of [build, buildTest]) {
      expect(listed(job, 'refs/heads/main')).not.toBe('true');
      expect(listed(job, 'refs/heads/feat/x')).toBe('true');
    }
  });

  it('reports the required check from a gate job that fails unless build and post-build tests both succeeded, or the latter was skipped on docs-only', () => {
    // ARRANGE
    const { gate } = workflow().jobs;
    // ACT
    const run = gate?.steps.map((step) => step.run ?? '').join('\n');
    // ASSERT
    expect(gate?.name).toBe('build, post-build tests');
    expect(gate?.needs).toEqual(['export', 'build-test']);
    expect(gate?.if).toBe('always()');
    expect(run).toContain('"$BUILD" = success');
    expect(run).toContain('"$POST_BUILD" = success');
    expect(run).toContain('"$DOCS_ONLY" = true');
    expect(Object.values(workflow().jobs).filter((job) => job.name === 'build, post-build tests')).toHaveLength(1);
  });

  it('deploys every event as production, so a run started by CI never lands in a preview, and never cancels one', () => {
    // ARRANGE
    const { concurrency, jobs } = deployWorkflow();
    const { environment } = jobs.deploy as unknown as DeployJob;
    // ACT
    const target = [concurrency.group, environment.name, environment.url];
    // ASSERT
    expect(target).toEqual(['cloudflare-pages-production', 'production', 'https://hancrafted.net']);
    expect(concurrency['cancel-in-progress']).toBe(false);
  });
});
