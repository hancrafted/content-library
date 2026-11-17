import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Timing } from './lock.ts';

export const FAST: Timing = { pollMilliseconds: 10, timeoutMilliseconds: 5000 };

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

export function gate() {
  let open: () => void = () => undefined;
  const opened = new Promise<void>((resolve) => (open = resolve));
  return { open, opened };
}

export const deadPid = (): number =>
  Number(execFileSync(process.execPath, ['-e', 'console.log(process.pid)'], { encoding: 'utf8' }).trim());

export function plantLock(lock: string, owner: { pid: number; started: string }): void {
  mkdirSync(lock, { recursive: true });
  writeFileSync(path.join(lock, 'owner'), JSON.stringify(owner));
}

const MODULE = path.join(import.meta.dirname, 'lock.ts');

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
