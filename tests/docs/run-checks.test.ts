import { describe, expect, it } from 'vitest';
import { researchFoldersOfRun, researchIdFindings } from './run-checks.ts';

const FOLDER = 'LLM-0099__two-runs-plan-the-same-question';
const planning = (staging: string): string =>
  `jobs:\n  - id: write-research\n    outputs: [${staging}/research/${FOLDER}/research.md]\n`;

describe('success cases', () => {
  it('finds no clash when only this Run plans a research ID', () => {
    // ARRANGE
    const own = researchFoldersOfRun([], planning('docs/episodes/a'), []);
    const elsewhere = researchFoldersOfRun([], undefined, []);
    // ACT
    const findings = researchIdFindings(own, elsewhere, ['LLM']);
    // ASSERT
    expect(findings).toEqual([]);
  });
});

describe('failure cases', () => {
  it('finds a research ID another Run only plans, before either Run has written the folder', () => {
    // ARRANGE
    const own = researchFoldersOfRun([], planning('docs/episodes/a'), []);
    const elsewhere = researchFoldersOfRun([], planning('docs/episodes/b'), []);
    // ACT
    const findings = researchIdFindings(own, elsewhere, ['LLM']);
    // ASSERT
    expect(findings).toEqual([
      `The research ID LLM-0099 names 2 folders: docs/episodes/a/research/${FOLDER}, docs/episodes/b/research/${FOLDER}.`,
    ]);
  });
});

describe('edge cases', () => {
  it('counts a planned folder Promotion already moved into the llm-wiki as that wiki folder', () => {
    // ARRANGE
    const wiki = [`docs/llm-wiki/research/LLM/${FOLDER}`];
    // ACT
    const own = researchFoldersOfRun([], planning('docs/episodes/a'), wiki);
    // ASSERT
    expect(own).toEqual([]);
  });
});
