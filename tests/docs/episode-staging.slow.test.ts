import { checkPipeline } from '@/pipeline/lib/episode-pipeline.pure';
import { checkStagingFolder } from '@/pipeline/lib/episode-staging.pure';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  knownVisuals,
  perRunPipelines,
  pipelineContext,
  readFolder,
  stagingFolders,
} from './episode-staging.fixture.ts';

/*
 * The slow half of episode-staging.test.ts: every staging folder's files checked against each other, and every
 * per-run pipeline checked against the repo, its outputs answered by one batched `mh query`. They read docs/episodes/ and
 * skills/ from disk, so the slow lane reruns them whenever those change (ARCH-003-testing §4).
 */

describe('success cases', () => {
  it('finds no disagreement between the files of any staging folder or the sample Episode', () => {
    // ARRANGE
    const names = knownVisuals();
    const folders = Object.entries(stagingFolders());
    // ACT
    const findings = folders.flatMap(([where, folder]) =>
      checkStagingFolder(readFolder(folder), names).map((finding) => ({
        ...finding,
        file: `${where}/${finding.file}`,
      })),
    );
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('finds every per-run pipeline well formed, with no pending file tolerated', () => {
    // ARRANGE
    const pipelines = Object.entries(perRunPipelines());
    // ACT
    const findings = pipelines.flatMap(([file, yaml]) =>
      checkPipeline(file, yaml, pipelineContext([], path.dirname(file))),
    );
    // ASSERT
    expect(findings).toEqual([]);
  });
});
