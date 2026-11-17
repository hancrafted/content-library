// What still runs in a worktree about to be removed: who holds it, and `--kill`, which stops them.
import { execFileSync, spawnSync } from 'node:child_process';
import { describeProc, killable, lineage, parseLsof, type Proc } from './worktree-process.pure.ts';

const capture = (cmd: string, args: string[]): string => execFileSync(cmd, args, { encoding: 'utf8' }).trim();

/** Processes whose cwd sits inside the worktree. */
function processesIn(target: string): Proc[] {
  // lsof exits 1 on harmless warnings, so read its output whatever the exit code.
  const { stdout } = spawnSync('lsof', ['-d', 'cwd', '-Fpcn'], {
    encoding: 'utf8',
  });
  return parseLsof(stdout, target);
}

/** This process and its ancestors (the agent's shell among them), which --kill never touches. */
function protectedPids(): Set<number> {
  const parentOf = new Map<number, number>();
  for (const line of capture('ps', ['-axo', 'pid=,ppid=']).split('\n')) {
    if (line.trim() === '') continue;
    const [pid, ppid] = line.trim().split(/\s+/).map(Number);
    parentOf.set(pid, ppid);
  }
  return lineage(process.pid, parentOf);
}

const isAlive = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

/** SIGTERM, a short wait, then SIGKILL for whatever is left. */
function killProcesses(procs: Proc[]): void {
  const signal = (proc: Proc, sig: NodeJS.Signals) => {
    try {
      process.kill(proc.pid, sig);
    } catch {
      // already gone
    }
  };
  for (const proc of procs) signal(proc, 'SIGTERM');
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline && procs.some((p) => isAlive(p.pid))) spawnSync('sleep', ['0.1']);
  for (const proc of procs.filter((p) => isAlive(p.pid))) signal(proc, 'SIGKILL');
  for (const proc of procs) console.log(`✔ stopped ${describeProc(proc)}`);
}

/** Why the finish cannot run from here, or null: it removes the folder it would run in. */
export function insideWorktree(target: string): boolean {
  return (process.cwd() + '/').startsWith(target + '/');
}

/** Refuses while something still runs in the worktree; with `kill`, stops it first. Run last, once every other guard passed. */
export function refuseWhileBusy(target: string, kill: boolean, fail: (message: string) => never): void {
  let busy = processesIn(target);
  if (kill && busy.length > 0) {
    killProcesses(killable(busy, protectedPids()));
    busy = processesIn(target);
  }
  if (busy.length > 0)
    fail(
      `still in use, stop these first (a dev server?) or rerun with --kill:\n  ${busy.map(describeProc).join('\n  ')}`,
    );
}
