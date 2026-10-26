import { describe, expect, it } from 'vitest';
import { checkOutputs, type OutputScope } from './episode-pipeline-outputs.pure';

/*
 * The outputs check on hand-built job mappings: where a job writes, whether an approved per-run pipeline has
 * expanded its fan-out, and whether a job writing markdown queries the rules' intents first.
 */

const WHERE = 'Job "write-dossier"';
const STAGING = 'docs/episodes/demo';
const DRAFT: OutputScope = { staging: STAGING, expanded: false };
const APPROVED: OutputScope = { staging: STAGING, expanded: true };
const DOSSIER = `${STAGING}/dossier.md`;

describe('success cases', () => {
  it('finds nothing in a job that queries before writing markdown in its staging folder', () => {
    // ARRANGE
    const job = { outputs: [DOSSIER], before: ['mh-query'] };
    const expected: string[] = [];
    // ACT
    const findings = checkOutputs(WHERE, job, APPROVED);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('lets a draft keep its foreach and glob output until customize-pipeline expands them', () => {
    // ARRANGE
    const job = {
      foreach: `${STAGING}/research-plan.md#research-jobs`,
      outputs: [`${STAGING}/research/*/research.md`],
      before: ['mh-query'],
    };
    const expected: string[] = [];
    // ACT
    const findings = checkOutputs(WHERE, job, DRAFT);
    // ASSERT
    expect(findings).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a foreach and a glob output once the pipeline is approved', () => {
    // ARRANGE
    const glob = `${STAGING}/research/*/research.md`;
    const job = { foreach: `${STAGING}/research-plan.md#research-jobs`, outputs: [glob], before: ['mh-query'] };
    const expected = [
      `${WHERE} has foreach; an approved per-run pipeline names one job per item, which customize-pipeline expands.`,
      `${WHERE} writes "${glob}", a glob; an approved per-run pipeline names each file.`,
    ];
    // ACT
    const findings = checkOutputs(WHERE, job, APPROVED);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('refuses an output outside the staging folder', () => {
    // ARRANGE
    const stray = 'docs/llm-wiki/dossier.md';
    const job = { outputs: [stray], before: ['mh-query'] };
    const expected = [`${WHERE} writes "${stray}", outside its staging folder ${STAGING}.`];
    // ACT
    const findings = checkOutputs(WHERE, job, APPROVED);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('refuses a markdown output written without the query, and a query with no markdown to write', () => {
    // ARRANGE
    const unqueried = { outputs: [DOSSIER] };
    const idle = { outputs: [`${STAGING}/pipeline.yml`], before: ['mh-query'] };
    const expected = [
      [
        `${WHERE} writes markdown but lacks before: [mh-query]; its implementor queries each output's intents before writing it.`,
      ],
      [`${WHERE} has before: [mh-query] but writes no markdown, so it has nothing to query.`],
    ];
    // ACT
    const findings = [checkOutputs(WHERE, unqueried, APPROVED), checkOutputs(WHERE, idle, APPROVED)];
    // ASSERT
    expect(findings).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('finds nothing in a job that writes no output and queries nothing', () => {
    // ARRANGE
    const job = { outputs: [] };
    const expected: string[] = [];
    // ACT
    const findings = checkOutputs(WHERE, job, APPROVED);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('refuses a path that only starts like the staging folder', () => {
    // ARRANGE
    const sibling = `${STAGING}-old/dossier.md`;
    const job = { outputs: [sibling], before: ['mh-query'] };
    const expected = [`${WHERE} writes "${sibling}", outside its staging folder ${STAGING}.`];
    // ACT
    const findings = checkOutputs(WHERE, job, APPROVED);
    // ASSERT
    expect(findings).toEqual(expected);
  });
});
