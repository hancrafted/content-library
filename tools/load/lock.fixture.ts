// What the lock's tests share: throwaway repositories, a promise a test opens by hand, and a second Node process
// that takes the lock as another `wt:done` or `verify` would.
import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Timing } from './lock.ts';

/** Short waits, so a test of a waiting taker takes milliseconds. */
export const FAST: Timing = { pollMs: 10, timeoutMs: 5000 };

/** A fresh repository with a linked worktree; the locks live in the git common directory both share. */
export function repo() {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'load-lock-')));
  const main = path.join(root, 'main');
  const linked = path.join(root, 'linked');
  execFileSync('git', ['init', '-q', main]);
  execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--allow-empty', '-m', 'init'], {
    cwd: main,
  });
  execFileSync('git', ['worktree', 'add', '-q', '-b', 'linked', linked], { cwd: main });
  return { root, main, linked, locks: path.join(main, '.git', 'locks') };
}

/** A promise and the function that settles it, so a test decides when a holder lets go. */
export function gate() {
  let open: () => void = () => undefined;
  const opened = new Promise<void>((resolve) => (open = resolve));
  return { open, opened };
}

/** A pid that belonged to a process which has exited. */
export const deadPid = (): number =>
  Number(execFileSync(process.execPath, ['-e', 'console.log(process.pid)'], { encoding: 'utf8' }).trim());

/** Plants a lock as a holder that is gone would have left it. */
export function plantLock(lock: string, owner: { pid: number; started: string }): void {
  mkdirSync(lock, { recursive: true });
  writeFileSync(path.join(lock, 'owner'), JSON.stringify(owner));
}

const MODULE = path.join(import.meta.dirname, 'lock.ts');

/**
 * Runs `body` in its own Node process with `withLock` and `fs` imported, as a second `wt:done` or `verify` would;
 * `onLine` sees each line it prints, with a way to signal it.
 */
export function child(
  body: string,
  args: string[],
  onLine?: (line: string, kill: (signal: NodeJS.Signals) => void) => void,
) {
  const code = `import { withLock } from ${JSON.stringify(MODULE)};\nimport fs from 'node:fs';\n${body}`;
  return new Promise<{ code: number | null; signal: NodeJS.Signals | null; output: string }>((resolve) => {
    const proc = spawn(process.execPath, ['--input-type=module', '-e', code, ...args]);
    let output = '';
    proc.stdout.on('data', (chunk: Buffer) => {
      output += chunk.toString();
      for (const line of chunk.toString().split('\n')) if (line) onLine?.(line, (signal) => proc.kill(signal));
    });
    proc.stderr.on('data', (chunk: Buffer) => (output += chunk.toString()));
    proc.on('close', (exit, signal) => resolve({ code: exit, signal, output }));
  });
}
