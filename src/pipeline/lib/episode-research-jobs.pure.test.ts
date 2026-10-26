import { describe, expect, it } from 'vitest';
import { checkResearchJobs } from './episode-research-jobs.pure';

/*
 * A research plan that lists two research jobs, one new and one refresh, against per-run pipelines with one
 * write-research job per listed folder, and with one too few or one no item asks for.
 */

const FIRST = 'AIE-0003__why-the-first-claim-holds-up';
const SECOND = 'AIE-0001__why-the-second-claim-holds-up';

const RESEARCH_PLAN = `# Research plan

## Research jobs

- new: ${FIRST}, question 1.
- refresh: ${SECOND}, question 2.

## Reuse

- Question 3: reuse \`docs/llm-wiki/research/AIE/AIE-0002__why-a-third-claim-holds-up/research.md\`.
`;

function job(folder: string): string {
  const slug = folder.split('__')[1];
  return `  - id: write-research-${slug}\n    needs: []\n    outputs: [docs/episodes/demo/research/${folder}/research.md]`;
}

function pipeline(...jobs: string[]): string {
  return `status: draft\njobs:\n  - id: retrieval\n    needs: []\n${jobs.join('\n')}\n  - id: write-dossier\n    needs: []\n`;
}

const FILE = 'docs/episodes/demo/pipeline.yml';

describe('success cases', () => {
  it('finds nothing when the pipeline has one write-research job per research job the research plan lists', () => {
    // ARRANGE
    const yaml = pipeline(job(FIRST), job(SECOND));
    // ACT
    const findings = checkResearchJobs(FILE, yaml, RESEARCH_PLAN);
    // ASSERT
    expect(findings).toEqual([]);
  });
});

describe('failure cases', () => {
  it('names the listed research job no write-research job writes', () => {
    // ARRANGE
    const yaml = pipeline(job(FIRST));
    const expected = [
      `The research plan lists the research job ${SECOND}, which no write-research job writes; customize-pipeline writes one job per item under the research plan's Research jobs.`,
    ];
    // ACT
    const messages = checkResearchJobs(FILE, yaml, RESEARCH_PLAN).map(({ message }) => message);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('names a write-research job whose folder the research plan does not list', () => {
    // ARRANGE
    const third = 'AIE-0002__why-a-third-claim-holds-up';
    const yaml = pipeline(job(FIRST), job(SECOND), job(third));
    const expected = [
      `Job "write-research-why-a-third-claim-holds-up" writes ${third}, which the research plan's Research jobs do not list; retrieval reuses that question's research.`,
    ];
    // ACT
    const messages = checkResearchJobs(FILE, yaml, RESEARCH_PLAN).map(({ message }) => message);
    // ASSERT
    expect(messages).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('reads the Research jobs list of a run log kept by a branch in flight', () => {
    // ARRANGE
    const runLog = `# Run log\n\n## retrieval · 2026-10-12T09:30:00Z\n\n### Research jobs\n\n- new: ${FIRST}, question 1.\n\n### Notes\n\nNone.\n`;
    const yaml = pipeline(job(FIRST));
    // ACT
    const findings = checkResearchJobs(FILE, yaml, runLog);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('asks for no research job when retrieval reused every question or has not written the plan', () => {
    // ARRANGE
    const yaml = pipeline();
    // ACT
    const findings = [checkResearchJobs(FILE, yaml, '# Research plan\n'), checkResearchJobs(FILE, yaml, undefined)];
    // ASSERT
    expect(findings).toEqual([[], []]);
  });

  it('leaves the scaffold alone while it keeps the unexpanded write-research job', () => {
    // ARRANGE
    const yaml = pipeline(
      '  - id: write-research\n    needs: []\n    outputs: [docs/episodes/demo/research/*/research.md]',
    );
    // ACT
    const findings = checkResearchJobs(FILE, yaml, RESEARCH_PLAN);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('leaves a pipeline that does not parse to the schema check', () => {
    // ARRANGE
    const yaml = 'status: draft\njobs: [\n';
    // ACT
    const findings = checkResearchJobs(FILE, yaml, RESEARCH_PLAN);
    // ASSERT
    expect(findings).toEqual([]);
  });
});
