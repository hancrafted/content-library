import { describe, expect, it } from 'vitest';
import { checkReferenceJobs } from './episode-reference-jobs.pure';

/*
 * A Brief's `## Episode Design Reference` against the outputs of a per-run pipeline's
 * convert-references job: one design-reference.md per listed file, no more.
 */

function brief(...references: string[]): string {
  const list = references.map((reference) => `- [A deck](${reference})`).join('\n');
  const section = references.length === 0 ? '' : `## Episode Design Reference\n\n${list}\n\n`;
  return `---\ntype: brief\n---\n\n# A title\n\n## Research questions\n\n1. Why?\n\n${section}## Open ideas\n\n- [Not a reference](reference/idea/design-reference.md)\n`;
}

function pipeline(...outputs: string[]): string {
  const job =
    outputs.length === 0 ? '' : `  - id: convert-references\n    needs: []\n    outputs: [${outputs.join(', ')}]\n`;
  return `status: draft\njobs:\n  - id: brief-grill\n    needs: []\n${job}`;
}

const FILE = 'docs/episodes/demo/pipeline.yml';
const DECK = 'docs/episodes/demo/reference/sales-deck/design-reference.md';
const SKETCH = 'docs/episodes/demo/reference/board-sketch/design-reference.md';

function messages(yaml: string, text: string): string[] {
  return checkReferenceJobs(FILE, yaml, text).map(({ message }) => message);
}

describe('success cases', () => {
  it('finds nothing when convert-references writes each file the Brief lists', () => {
    // ARRANGE
    const text = brief('reference/sales-deck/design-reference.md', 'reference/board-sketch/design-reference.md');
    const yaml = pipeline(DECK, SKETCH);
    // ACT
    const findings = messages(yaml, text);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('finds nothing when the Brief lists no Episode Design Reference and the pipeline has no convert-references job', () => {
    // ARRANGE
    const text = brief();
    const yaml = pipeline();
    // ACT
    const findings = messages(yaml, text);
    // ASSERT
    expect(findings).toEqual([]);
  });
});

describe('failure cases', () => {
  it('names a listed reference no output writes', () => {
    // ARRANGE
    const text = brief('reference/sales-deck/design-reference.md', 'reference/board-sketch/design-reference.md');
    const yaml = pipeline(DECK);
    const expected = [
      `The Brief lists ${SKETCH} under Episode Design Reference, which no convert-references output names; customize-pipeline writes one per reference.`,
    ];
    // ACT
    const findings = messages(yaml, text);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('names an output the Brief does not list', () => {
    // ARRANGE
    const text = brief('reference/sales-deck/design-reference.md');
    const yaml = pipeline(DECK, SKETCH);
    const expected = [
      `convert-references writes ${SKETCH}, which the Brief does not list under Episode Design Reference.`,
    ];
    // ACT
    const findings = messages(yaml, text);
    // ASSERT
    expect(findings).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('reads links only under Episode Design Reference, not a reference-shaped link elsewhere in the Brief', () => {
    // ARRANGE
    const text = brief();
    const yaml = pipeline(DECK);
    const expected = [
      `convert-references writes ${DECK}, which the Brief does not list under Episode Design Reference.`,
    ];
    // ACT
    const findings = messages(yaml, text);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('leaves a draft whose convert-references output is still the template glob to customize-pipeline', () => {
    // ARRANGE
    const text = brief('reference/sales-deck/design-reference.md');
    const yaml = pipeline('docs/episodes/demo/reference/*/design-reference.md');
    // ACT
    const findings = messages(yaml, text);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('leaves a pipeline that does not parse to the schema check', () => {
    // ARRANGE
    const text = brief('reference/sales-deck/design-reference.md');
    const yaml = 'jobs: [oops';
    // ACT
    const findings = messages(yaml, text);
    // ASSERT
    expect(findings).toEqual([]);
  });
});
