export const FIRST_PORT = 4000;
export const DASHBOARD_PORT = 4382;
const LAST_PORT = 65534;

export interface RunWhere {
  root: string;
  slug: string;
  sha: string;
}

export function pickPorts(isFree: (port: number) => boolean): { dev: number; spec: number } {
  for (let dev = FIRST_PORT; dev <= LAST_PORT; dev++) {
    const spec = dev + 1;
    if ([dev, spec].includes(DASHBOARD_PORT)) continue;
    if (isFree(dev) && isFree(spec)) return { dev, spec };
  }
  throw new Error(`no two free ports in a row from ${FIRST_PORT}`);
}

export function portsOf(yaml: string): { dev: number; spec: number } | null {
  const dev = /^dev_port:\s*(\d+)\s*$/m.exec(yaml)?.[1];
  const spec = /^spec_port:\s*(\d+)\s*$/m.exec(yaml)?.[1];
  return dev === undefined || spec === undefined ? null : { dev: Number(dev), spec: Number(spec) };
}

export function draftPipeline(
  template: string,
  { slug, sha, dev, spec }: { slug: string; sha: string; dev: number; spec: number },
): string {
  return template
    .replaceAll('<slug>', slug)
    .replace(/^status: draft$/m, `status: draft\ntemplate: ${sha}\ndev_port: ${dev}\nspec_port: ${spec}`);
}
