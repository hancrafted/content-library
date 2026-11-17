// decision: docs/decision-records/0008-pipeline-jobs-belong-to-stages.md
import type { Job } from './episode-pipeline-definition.pure';
import { repeated } from './finding.pure';

const BUILD_STAGE = 'build';
export const DASHBOARD_PORT = 4382;
const DEV_PORT_JOB = 'implement-episode-init';

export interface PortScope {
  perRun: boolean;
  expanded: boolean;
}

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
      .filter(({ id, stage, port }) => expanded && stage === BUILD_STAGE && port === undefined && id !== DEV_PORT_JOB)
      .map(
        ({ id }) =>
          `Job "${id}" of stage "${BUILD_STAGE}" lacks port; customize-pipeline gives every build job of an approved pipeline its own dev-server port.`,
      ),
  ];
}
