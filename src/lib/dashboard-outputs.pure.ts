/*
 * Where a Job's outputs and dev server sit for the dashboard. The dashboard is given one Episode folder,
 * `docs/episodes/<slug>`, so an output path names a file inside it once the staging prefix is stripped; the hook
 * walks the segments through the folder's handle. A Build Job's `port` is its agent's `next dev`.
 */

/** Which of the pipeline's outputs exist in the chosen folder, and how to open one; the hook supplies both. */
export interface EpisodeOutputs {
  written: ReadonlySet<string>;
  open: (output: string) => void;
}

/** The output's path inside the chosen folder, one segment per sub-folder and the file last; null when it names no file there. */
export function outputSegments(output: string, folder: string): string[] | null {
  const prefix = `docs/episodes/${folder}/`;
  if (!output.startsWith(prefix) || output.includes('*')) return null;
  const segments = output.slice(prefix.length).split('/');
  return segments.every((segment) => segment !== '' && segment !== '.' && segment !== '..') ? segments : null;
}

const STAGING = /^docs\/episodes\/[^/]+\//;

/** An output as the dashboard shows it: its path inside the staging folder, or the whole path outside one. */
export function outputLabel(output: string): string {
  return output.replace(STAGING, '');
}

export function previewHref(port: number): string {
  return `http://localhost:${port}`;
}
