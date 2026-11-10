// A run's sandbox: a fresh temp folder holding only the case's prompt and inputs and, for a skill arm, a copy of
// that arm's skill without its evals. After the agent stops, its pages move into the run folder and the sandbox goes.
import { createHash } from 'node:crypto';
import { cpSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { CASES, type EvalCase } from './cases.ts';

export interface Sandbox {
  /** The folder as created, then as the OS resolves it (macOS: /var → /private/var). The first is the agent's cwd. */
  readonly roots: readonly [string, string];
  /** File names copied beside prompt.md. */
  readonly inputs: readonly string[];
}

/** Everything in a skill folder but its evals: the run must not see its own cases, graders or results. */
const skillFilter = (skill: string) => (source: string) => path.relative(skill, source).split(path.sep)[0] !== 'evals';

export function makeSandbox(evalCase: EvalCase, skill: string | null): Sandbox {
  const dir = mkdtempSync(path.join(tmpdir(), 'decision-eval-'));
  for (const file of [evalCase.prompt, ...evalCase.inputs])
    cpSync(path.join(CASES, file), path.join(dir, path.basename(file)));
  if (skill !== null) cpSync(skill, path.join(dir, 'skill'), { recursive: true, filter: skillFilter(skill) });
  return { roots: [dir, realpathSync(dir)], inputs: evalCase.inputs.map((file) => path.basename(file)) };
}

/** Every file under `dir`, relative, sorted. */
export function filesUnder(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(dir, path.join(entry.parentPath, entry.name)))
    .sort();
}

/** The sha256 of a skill's files and contents, evals excluded: which skill version an arm ran. */
export function skillDigest(skill: string): string {
  const hash = createHash('sha256');
  for (const file of filesUnder(skill).filter((file) => skillFilter(skill)(path.join(skill, file)))) {
    hash.update(`${file}\0`).update(readFileSync(path.join(skill, file)));
  }
  return hash.digest('hex');
}

/** Copies the .html pages the agent wrote (the skill copy excluded) into `pages`, then deletes the sandbox. */
export function collectPages({ roots: [dir] }: Sandbox, pages: string): string[] {
  const written = filesUnder(dir).filter((file) => file.endsWith('.html') && !file.startsWith(`skill${path.sep}`));
  for (const page of written) cpSync(path.join(dir, page), path.join(pages, page.replaceAll(path.sep, '--')));
  rmSync(dir, { recursive: true, force: true });
  return written;
}
