import { describe, expect, it } from 'vitest';
import type { Job } from './episode-pipeline-jobs.pure';
import { checkPorts } from './episode-pipeline-ports.pure';

/*
 * The port check on hand-built jobs: each Build job of an approved per-run pipeline names the dev-server port its
 * agent serves the Episode on, and the dashboard links it.
 */

function job(id: string, stage: string, port?: number): Job {
  return { id, stage, needs: [], wants: [], outputs: [], gate: false, agents: [], ...(port !== undefined && { port }) };
}

const APPROVED = { perRun: true, expanded: true };
const DRAFT = { perRun: true, expanded: false };
const TEMPLATE = { perRun: false, expanded: false };

describe('success cases', () => {
  it('finds nothing when every build job of an approved pipeline has its own port', () => {
    // ARRANGE
    const jobs = [
      job('write-spec', 'specification'),
      job('implement-episode-init', 'build', 4000),
      job('implement-section-why', 'build', 4001),
      job('implement-section-how', 'build', 4002),
    ];
    const expected: string[] = [];
    // ACT
    const findings = checkPorts(jobs, APPROVED);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('accepts a draft whose build jobs carry no port yet', () => {
    // ARRANGE
    const jobs = [job('implement-episode-init', 'build'), job('implement-section', 'build')];
    const expected: string[] = [];
    // ACT
    const findings = checkPorts(jobs, DRAFT);
    // ASSERT
    expect(findings).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('names a build job of an approved pipeline without a port', () => {
    // ARRANGE
    const jobs = [job('implement-episode-init', 'build', 4000), job('implement-section-why', 'build')];
    const expected = [
      'Job "implement-section-why" of stage "build" lacks port; customize-pipeline gives every build job of an approved pipeline its own dev-server port.',
    ];
    // ACT
    const findings = checkPorts(jobs, APPROVED);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('names a port on a job outside the build stage', () => {
    // ARRANGE
    const jobs = [job('write-spec', 'specification', 4005)];
    const expected = [
      'Job "write-spec" of stage "specification" has port 4005; only a job of the build stage serves a dev server.',
    ];
    // ACT
    const findings = checkPorts(jobs, DRAFT);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('names a port two jobs share once', () => {
    // ARRANGE
    const jobs = [
      job('implement-episode-init', 'build', 4000),
      job('implement-section-why', 'build', 4001),
      job('implement-section-how', 'build', 4001),
      job('implement-section-what', 'build', 4001),
    ];
    const expected = ['The port 4001 appears on more than one job; each build job serves on its own port.'];
    // ACT
    const findings = checkPorts(jobs, APPROVED);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it("names the dashboard's own dev port", () => {
    // ARRANGE
    const jobs = [job('implement-episode-init', 'build', 4382)];
    const expected = [
      'Job "implement-episode-init" has port 4382, the dashboard\'s own dev port; customize-pipeline skips it.',
    ];
    // ACT
    const findings = checkPorts(jobs, APPROVED);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('names a port in the template, which customize-pipeline assigns per run', () => {
    // ARRANGE
    const jobs = [job('implement-episode-init', 'build', 4000)];
    const expected = [
      'Job "implement-episode-init" has port 4000; the template assigns no port, customize-pipeline assigns one per run.',
    ];
    // ACT
    const findings = checkPorts(jobs, TEMPLATE);
    // ASSERT
    expect(findings).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('leaves a job with no stage to the stage check', () => {
    // ARRANGE
    const jobs: Job[] = [{ id: 'unstaged', needs: [], wants: [], outputs: [], gate: false, agents: [] }];
    const expected: string[] = [];
    // ACT
    const findings = checkPorts(jobs, APPROVED);
    // ASSERT
    expect(findings).toEqual(expected);
  });
});
