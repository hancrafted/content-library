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
  /** The judge's case items and the reader probe's answer key; graders read them, a run never sees them. */
  readonly checklist?: string;
  readonly probe?: string;
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

/** Where a checklist item or probe answer comes from: a file beside it and a verbatim quote of that file. */
interface Sourced {
  readonly id: string;
  readonly source: { readonly file: string; readonly quote: string };
}

const squash = (text: string) => text.replace(/\s+/g, ' ').trim();

/**
 * One problem per checklist item or probe question whose quote is not in one of the case's attachments: an answer
 * key comes from the frozen input both arms received, never from calibration answers, a page or memory.
 */
export function answerKeyProblems(
  entry: Pick<ManifestCase, 'id' | 'attachments' | 'checklist' | 'probe'>,
  dir: string = CASES,
): string[] {
  const keyed = [
    [entry.checklist, 'items'],
    [entry.probe, 'questions'],
  ] as const;
  return keyed.flatMap(([file, list]) => {
    if (file === undefined) return [];
    const sourced = (JSON.parse(readFileSync(path.join(dir, file), 'utf8')) as Record<string, Sourced[]>)[list];
    return sourced.flatMap(({ id, source }) => {
      const input = path.join(path.dirname(file), source.file);
      const name = path.basename(file);
      if (!entry.attachments.includes(input))
        return [`${name} ${id} quotes ${source.file}, which is not an input of case "${entry.id}"`];
      const text = squash(readFileSync(path.join(dir, input), 'utf8'));
      return text.includes(squash(source.quote)) ? [] : [`${name} ${id} quotes text that ${source.file} does not hold`];
    });
  });
}
