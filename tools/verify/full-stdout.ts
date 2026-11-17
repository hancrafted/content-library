import { spawnSync } from 'node:child_process';
import { closeSync, mkdtempSync, openSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

export function fullStdoutOf(command: string, args: string[], cwd: string): string {
  const folder = mkdtempSync(path.join(tmpdir(), 'full-stdout-'));
  const fileThatProcessExitCannotTruncate = path.join(folder, 'stdout');
  const descriptor = openSync(fileThatProcessExitCannotTruncate, 'w');
  try {
    spawnSync(command, args, { cwd, stdio: ['ignore', descriptor, 'ignore'] });
    return readFileSync(fileThatProcessExitCannotTruncate, 'utf8');
  } finally {
    closeSync(descriptor);
    rmSync(folder, { recursive: true, force: true });
  }
}
