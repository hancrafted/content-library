import type { DashboardState } from './dashboard-stages.pure';
import type { EpisodeFolder } from './episode-folder.pure';

export interface EpisodeOutputs {
  written: ReadonlySet<string>;
  open: (output: string) => void;
}

export function isGlob(output: string): boolean {
  return output.includes('*');
}

export function outputSegments(output: string, folder: string): string[] | null {
  const prefix = `docs/episodes/${folder}/`;
  if (!output.startsWith(prefix) || isGlob(output)) return null;
  const segments = output.slice(prefix.length).split('/');
  return segments.every((segment) => segment !== '' && segment !== '.' && segment !== '..') ? segments : null;
}

const pathIn = (folder: EpisodeFolder, output: string) => outputSegments(output, folder.name)?.join('/') ?? null;

export async function writtenOutputs(
  folder: EpisodeFolder,
  jobs: readonly { outputs: readonly string[] }[],
): Promise<Set<string>> {
  const outputs = [...new Set(jobs.flatMap((job) => job.outputs))];
  const found = await Promise.all(
    outputs.map(async (output) => {
      const path = pathIn(folder, output);
      return path !== null && (await folder.exists(path).catch(() => false));
    }),
  );
  return new Set(outputs.filter((_, at) => found[at]));
}

export async function readOutput(folder: EpisodeFolder, output: string): Promise<string | null> {
  const path = pathIn(folder, output);
  if (path === null) return null;
  return folder.readText(path).catch(() => null);
}

const STAGING = /^docs\/episodes\/[^/]+\//;

export function outputLabel(output: string): string {
  return output.replace(STAGING, '');
}

// decision: docs/decision-records/0008-pipeline-jobs-belong-to-stages.md
const INTEGRATION_JOB = 'implement-episode-init';

export function previewPort(job: { id: string; port?: number; state: DashboardState }): number | undefined {
  if (job.port === undefined || job.state === 'waiting') return undefined;
  const open = job.state === 'running' || job.state === 'gate';
  return job.id === INTEGRATION_JOB || open ? job.port : undefined;
}

export function previewHref(port: number): string {
  return `http://localhost:${port}`;
}
