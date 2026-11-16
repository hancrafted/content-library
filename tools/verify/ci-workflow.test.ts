import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const WORKFLOW = '.github/workflows/ci.yml';

interface Workflow {
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
});
