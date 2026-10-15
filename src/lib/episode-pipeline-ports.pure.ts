/*
 * The dev-server ports of a new-episode pipeline (design-ADR-0008, Ports): customize-pipeline gives each Build job of
 * the run its own port, its agent serves the Episode there with `next dev`, and the dashboard links it. Whether a
 * port is a whole number in range is the field check's finding; this checks what the ports say together.
 */

import type { Job } from './episode-pipeline-definition.pure';
import { repeated } from './finding.pure';

/** The stage whose jobs serve a dev server. */
const BUILD_STAGE = 'build';
/** The dashboard's own dev port (`npx next dev -p 4382`); no job is assigned it. */
export const DASHBOARD_PORT = 4382;

/** A per-run pipeline or the template, and whether it is approved with every `foreach` expanded. */
export interface PortScope {
  perRun: boolean;
  expanded: boolean;
}

/** What one job's port says on its own: a port in the template, outside the build stage, or the dashboard's. */
function portFindings({ id, stage, port }: Job & { port: number }, perRun: boolean): string[] {
  return [
    ...(perRun
      ? []
      : [`Job "${id}" has port ${port}; the template assigns no port, customize-pipeline assigns one per run.`]),
    ...(stage === undefined || stage === BUILD_STAGE
      ? []
      : [`Job "${id}" of stage "${stage}" has port ${port}; only a job of the build stage serves a dev server.`]),
    ...(port === DASHBOARD_PORT
      ? [`Job "${id}" has port ${DASHBOARD_PORT}, the dashboard's own dev port; customize-pipeline skips it.`]
      : []),
  ];
}

export function checkPorts(jobs: readonly Job[], { perRun, expanded }: PortScope): string[] {
  const ported = jobs.filter((job): job is Job & { port: number } => job.port !== undefined);
  return [
    ...ported.flatMap((job) => portFindings(job, perRun)),
    ...repeated(ported.map(({ port }) => port)).map(
      (port) => `The port ${port} appears on more than one job; each build job serves on its own port.`,
    ),
    ...jobs
      .filter(({ stage, port }) => expanded && stage === BUILD_STAGE && port === undefined)
      .map(
        ({ id }) =>
          `Job "${id}" of stage "${BUILD_STAGE}" lacks port; customize-pipeline gives every build job of an approved pipeline its own dev-server port.`,
      ),
  ];
}
