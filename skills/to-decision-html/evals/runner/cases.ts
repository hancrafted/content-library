// The frozen eval cases: cases/manifest.json lists each case's prompt, inputs and the sha256 of every frozen
// file. A case runs only while every hash still matches, so arms in any iteration see byte-identical inputs.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const CASES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../cases');

interface ManifestCase {
  readonly id: string;
  readonly mode?: string;
  readonly prompt: string;
  readonly attachments: readonly string[];
  readonly calibration?: string;
  readonly hashes: Readonly<Record<string, string>>;
}

/** A case ready to run headless. Paths are relative to CASES. */
export interface EvalCase {
  readonly id: string;
  /** skill-creator's numeric eval id: the case's position in the manifest, from 1. */
  readonly evalId: number;
  readonly mode: string;
  readonly prompt: string;
  /** The files copied beside the prompt: its attachments, then the calibration answers. */
  readonly inputs: readonly string[];
  readonly hashes: Readonly<Record<string, string>>;
}

export function readManifest(): { cases: ManifestCase[] } {
  return JSON.parse(readFileSync(path.join(CASES, 'manifest.json'), 'utf8')) as { cases: ManifestCase[] };
}

/** One problem per frozen file under `dir` that is missing or whose sha256 differs from `hashes`. */
export function hashProblems(dir: string, hashes: Readonly<Record<string, string>>): string[] {
  return Object.entries(hashes).flatMap(([file, hash]) => {
    const full = path.join(dir, file);
    if (!existsSync(full)) return [`${file} is missing`];
    const actual = createHash('sha256').update(readFileSync(full)).digest('hex');
    return actual === hash ? [] : [`${file} no longer matches its frozen hash; restore it, or freeze a new case`];
  });
}

export function loadCase(id: string): EvalCase {
  const { cases } = readManifest();
  const index = cases.findIndex((entry) => entry.id === id);
  if (index === -1) throw new Error(`no eval case "${id}"; cases: ${cases.map((entry) => entry.id).join(', ')}`);
  const { mode, prompt, attachments, calibration, hashes } = cases[index];
  if (mode === undefined || calibration === undefined)
    throw new Error(`case "${id}" has no mode or calibration answers, so it cannot run headless`);
  return { id, evalId: index + 1, mode, prompt, inputs: [...attachments, calibration], hashes };
}
