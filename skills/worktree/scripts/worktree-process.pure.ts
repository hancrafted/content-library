// Pure logic for `wt:done --kill` and `wt:sync`: which processes may be stopped, and what sync runs.

export interface Proc {
  pid: number;
  command: string;
}

/** Processes whose cwd sits inside the worktree, from `lsof -d cwd -Fpcn` output. */
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

/** The pid and every ancestor, walking `parentOf` until a pid has no parent. */
export function lineage(pid: number, parentOf: ReadonlyMap<number, number>): Set<number> {
  const seen = new Set<number>();
  for (let next: number | undefined = pid; next !== undefined && next > 0 && !seen.has(next); next = parentOf.get(next))
    seen.add(next);
  return seen;
}

/** The processes that may be stopped: each once, never the caller or one of its ancestors. */
export function killable(procs: readonly Proc[], protectedPids: ReadonlySet<number>): Proc[] {
  const unique = new Map<number, Proc>();
  for (const proc of procs) if (!protectedPids.has(proc.pid) && !unique.has(proc.pid)) unique.set(proc.pid, proc);
  return [...unique.values()];
}

export const describeProc = (proc: Proc): string => `pid ${proc.pid} (${proc.command})`;

export type SyncPlan = { error: string } | { target: string };

/** What `wt:sync` merges: origin/main, or the --base branch, into the current branch. */
export function planSync(input: { branch: string; base: string | null; dirty: boolean }): SyncPlan {
  const target = input.base ?? 'origin/main';
  if (input.branch === '') return { error: 'detached HEAD: check out a branch first' };
  if (input.branch === 'main') return { error: 'run wt:sync inside a worktree, not on main' };
  if (input.dirty) return { error: 'the working tree is dirty; commit or stash first' };
  if (input.branch === target) return { error: `${input.branch} cannot merge itself` };
  return { target };
}
