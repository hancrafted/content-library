import { describe, expect, it } from 'vitest';
import { readPipeline } from './episode-pipeline-jobs.pure';

/*
 * A new-episode pipeline read into its status and jobs: the one view of a job the schema check, the research-jobs
 * check and the status script share.
 */

const PIPELINE = `status: approved
jobs:
  - id: write-brief
    needs: []
    outputs: [docs/episodes/<slug>/brief.md]
    gate: human
  - id: write-research-1
    needs: [write-brief]
    wants: [write-brief]
    outputs: []
`;

describe('success cases', () => {
  it('reads the status and each job with its needs, wants, outputs and gate', () => {
    // ARRANGE
    const expected = {
      status: 'approved',
      jobs: [
        { id: 'write-brief', needs: [], wants: [], outputs: ['docs/episodes/<slug>/brief.md'], gate: true },
        { id: 'write-research-1', needs: ['write-brief'], wants: ['write-brief'], outputs: [], gate: false },
      ],
    };
    // ACT
    const pipeline = readPipeline(PIPELINE);
    // ASSERT
    expect(pipeline).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('answers null for text that is not YAML, not a mapping, or has no job list', () => {
    // ARRANGE
    const texts = ['jobs: [unclosed', '- just a list', 'status: draft\n'];
    // ACT
    const pipelines = texts.map(readPipeline);
    // ASSERT
    expect(pipelines).toEqual([null, null, null]);
  });
});

describe('edge cases', () => {
  it('reads a status of any shape as null unless it is text, and skips a job that is not a mapping', () => {
    // ARRANGE
    const yaml = 'status: [approved]\njobs:\n  - just-a-name\n  - id: a\n    needs: [b, 1]\n';
    const expected = { status: null, jobs: [{ id: 'a', needs: [], wants: [], outputs: [], gate: false }] };
    // ACT
    const pipeline = readPipeline(yaml);
    // ASSERT
    expect(pipeline).toEqual(expected);
  });
});
