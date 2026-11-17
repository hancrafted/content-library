export interface Proc {
  pid: number;
  command: string;
}

export function parseLsof(stdout: string, target: string): Proc[] {
  const found: Proc[] = [];
  let current: Proc = { pid: 0, command: '' };
  for (const line of stdout.split('\n')) {
    if (line.startsWith('p')) current = { pid: Number(line.slice(1)), command: '' };
    else if (line.startsWith('c')) current.command = line.slice(1);
    else if (line.startsWith('n') && (line.slice(1) + '/').startsWith(target + '/')) found.push({ ...current });
  }
  return found;
}

export function lineage(pid: number, parentOf: ReadonlyMap<number, number>): Set<number> {
  const seen = new Set<number>();
  for (let next: number | undefined = pid; next !== undefined && next > 0 && !seen.has(next); next = parentOf.get(next))
    seen.add(next);
  return seen;
}

export function killable(procs: readonly Proc[], protectedPids: ReadonlySet<number>): Proc[] {
  const unique = new Map<number, Proc>();
  for (const proc of procs) if (!protectedPids.has(proc.pid) && !unique.has(proc.pid)) unique.set(proc.pid, proc);
  return [...unique.values()];
}

export const describeProc = (proc: Proc): string => `pid ${proc.pid} (${proc.command})`;

export type SyncPlan = { error: string } | { target: string };

export function planSync(input: {
  branch: string;
  base: string | null;
  dirty: boolean;
  baseBranch: string;
  remote: string;
}): SyncPlan {
  const target = input.base ?? `${input.remote}/${input.baseBranch}`;
  if (input.branch === '') return { error: 'detached HEAD: check out a branch first' };
  if (input.branch === input.baseBranch) return { error: `run sync inside a worktree, not on ${input.baseBranch}` };
  if (input.dirty) return { error: 'the working tree is dirty; commit or stash first' };
  if (input.branch === target) return { error: `${input.branch} cannot merge itself` };
  return { target };
}
