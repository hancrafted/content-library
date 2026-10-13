import { describe, expect, it } from 'vitest';
import { checkResearchJobs } from './episode-research-jobs.pure';

/*
 * A Brief with two research questions against per-run pipelines with one
 * write-research job per question, and with one too few or too many.
 */

const BRIEF = `---
type: brief
status: approved
---

# A title

## Research questions

1. Why does the first claim hold?
2. Why does the second claim hold?

## Open ideas

- 1. An idea that is no question.
`;

function pipeline(...ids: string[]): string {
  const jobs = ids.map((id) => `  - id: ${id}\n    needs: []`).join('\n');
  return `status: draft\njobs:\n  - id: retrieval\n    needs: []\n${jobs}\n  - id: write-dossier\n    needs: []\n`;
}

const FILE = 'docs/episodes/demo/pipeline.yml';

describe('success cases', () => {
  it('finds nothing when the pipeline has one write-research job per research question', () => {
    // ARRANGE
    const yaml = pipeline('write-research-first-claim', 'write-research-second-claim');
    // ACT
    const findings = checkResearchJobs(FILE, yaml, BRIEF);
    // ASSERT
    expect(findings).toEqual([]);
  });
});

describe('failure cases', () => {
  it('names the counts when a research question has no job', () => {
    // ARRANGE
    const yaml = pipeline('write-research-first-claim');
    const expected = [
      'The pipeline has 1 write-research job for 2 research questions in the Brief; customize-pipeline writes one job per question.',
    ];
    // ACT
    const messages = checkResearchJobs(FILE, yaml, BRIEF).map(({ message }) => message);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('names the counts when a job answers no research question', () => {
    // ARRANGE
    const yaml = pipeline('write-research-first-claim', 'write-research-second-claim', 'write-research-third');
    const expected = [
      'The pipeline has 3 write-research jobs for 2 research questions in the Brief; customize-pipeline writes one job per question.',
    ];
    // ACT
    const messages = checkResearchJobs(FILE, yaml, BRIEF).map(({ message }) => message);
    // ASSERT
    expect(messages).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('counts only the ordered items under Research questions', () => {
    // ARRANGE
    const brief = BRIEF.replace('2. Why does the second claim hold?\n', '');
    const yaml = pipeline('write-research-first-claim');
    // ACT
    const findings = checkResearchJobs(FILE, yaml, brief);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('leaves a pipeline that does not parse to the schema check', () => {
    // ARRANGE
    const yaml = 'status: draft\njobs: [\n';
    // ACT
    const findings = checkResearchJobs(FILE, yaml, BRIEF);
    // ASSERT
    expect(findings).toEqual([]);
  });
});
