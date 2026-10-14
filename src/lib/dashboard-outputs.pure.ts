/*
 * Where a Job's outputs and dev server sit for the dashboard. The dashboard is given one Episode folder,
 * `docs/episodes/<slug>`, so an output path names a file inside it once the staging prefix is stripped; the hook
 * walks the segments through the folder's handle. A Build Job's `port` is its agent's `next dev`.
 */

import type { DashboardState } from './dashboard-stages.pure';

/** Which of the pipeline's outputs exist in the chosen folder, and how to open one; the hook supplies both. */
export interface EpisodeOutputs {
  written: ReadonlySet<string>;
  open: (output: string) => void;
}

/** An output naming a pattern, one file per item of a draft's fan-out, rather than one file. */
export function isGlob(output: string): boolean {
  return output.includes('*');
}

/** The output's path inside the chosen folder, one segment per sub-folder and the file last; null when it names no file there. */
export function outputSegments(output: string, folder: string): string[] | null {
  const prefix = `docs/episodes/${folder}/`;
  if (!output.startsWith(prefix) || isGlob(output)) return null;
  const segments = output.slice(prefix.length).split('/');
  return segments.every((segment) => segment !== '' && segment !== '.' && segment !== '..') ? segments : null;
}

const STAGING = /^docs\/episodes\/[^/]+\//;

/** An output as the dashboard shows it: its path inside the staging folder, or the whole path outside one. */
export function outputLabel(output: string): string {
  return output.replace(STAGING, '');
}

/** The integration Job: its dev server runs in the Episode's worktree and outlives it (design-ADR-0008, Ports). */
const INTEGRATION_JOB = 'implement-episode-init';

/**
 * The port whose Preview the dashboard shows, or undefined while no server is meant to answer: the integration Job's
 * once it has started, a Section Job's only while its Job is open, since the orchestrator stops that server before
 * its worktree is removed.
 */
export function previewPort(job: { id: string; port?: number; state: DashboardState }): number | undefined {
  if (job.port === undefined || job.state === 'waiting') return undefined;
  const open = job.state === 'running' || job.state === 'gate';
  return job.id === INTEGRATION_JOB || open ? job.port : undefined;
}

export function previewHref(port: number): string {
  return `http://localhost:${port}`;
}
