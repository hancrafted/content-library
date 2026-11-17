import { spawn } from 'node:child_process';
import type { Step, StepRun } from './verify.pure.ts';

export function runCommand(step: Step): Promise<StepRun> {
  const started = performance.now();
  return new Promise((resolve, reject) => {
    const child = spawn(step.command, { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
    const chunks: Buffer[] = [];
    child.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => chunks.push(chunk));
    child.on('error', reject);
    child.on('close', (code) =>
      resolve({ code: code ?? 1, output: Buffer.concat(chunks).toString('utf8'), ms: performance.now() - started }),
    );
  });
}
