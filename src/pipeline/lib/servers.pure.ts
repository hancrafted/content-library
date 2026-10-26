// The Run's two servers, decided without touching the disk: which pair of ports a Run takes and what its draft
// pipeline.yml says. The disk and processes are `servers.ts`; begin-run is the caller (`run-commands.ts`).

/** The first port a Run's dashboard dev server may take; the Spec server takes the next one. */
export const FIRST_PORT = 4000;
/** The standing dashboard's port (`npx next dev -p 4382`); no Run takes it. */
export const DASHBOARD_PORT = 4382;
const LAST_PORT = 65534;

/** Where a Run's servers live: the worktree root, the Episode slug and the template's sha. */
export interface RunWhere {
  root: string;
  slug: string;
  sha: string;
}

/** The first `P` from 4000 with both `P` and `P + 1` free, never the dashboard's port. */
export function pickPorts(isFree: (port: number) => boolean): { dev: number; spec: number } {
  for (let dev = FIRST_PORT; dev <= LAST_PORT; dev++) {
    const spec = dev + 1;
    if ([dev, spec].includes(DASHBOARD_PORT)) continue;
    if (isFree(dev) && isFree(spec)) return { dev, spec };
  }
  throw new Error(`no two free ports in a row from ${FIRST_PORT}`);
}

/** The ports an existing pipeline names, or null when it names fewer than both. */
export function portsOf(yaml: string): { dev: number; spec: number } | null {
  const dev = /^dev_port:\s*(\d+)\s*$/m.exec(yaml)?.[1];
  const spec = /^spec_port:\s*(\d+)\s*$/m.exec(yaml)?.[1];
  return dev === undefined || spec === undefined ? null : { dev: Number(dev), spec: Number(spec) };
}

/** The template as the Run's draft: `<slug>` filled, and the template sha and both ports under `status: draft`. */
export function draftPipeline(
  template: string,
  { slug, sha, dev, spec }: { slug: string; sha: string; dev: number; spec: number },
): string {
  return template
    .replaceAll('<slug>', slug)
    .replace(/^status: draft$/m, `status: draft\ntemplate: ${sha}\ndev_port: ${dev}\nspec_port: ${spec}`);
}
