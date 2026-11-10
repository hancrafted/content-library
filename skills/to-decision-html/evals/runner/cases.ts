// The frozen eval cases: cases/manifest.json lists each case's prompt, inputs and the sha256 of every frozen
// file. A case runs only while every hash still matches, so arms in any iteration see byte-identical inputs.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { asMode, type Mode } from '../../scripts/grader/check.ts';
import type { CaseItem } from './judge.pure.ts';
import { UNKNOWN, type ProbeQuestion } from './probe.pure.ts';
import type { Source } from './quality.pure.ts';

export const CASES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../cases');

interface ManifestCase {
  readonly id: string;
  readonly mode?: string;
  readonly prompt: string;
  readonly attachments: readonly string[];
  readonly calibration?: string;
  /** The judge's case items and the reader probe with its answer key; grading files the run never sees. */
  readonly checklist?: string;
  readonly probe?: string;
  readonly hashes: Readonly<Record<string, string>>;
}

/** A case ready to run headless. Paths are relative to CASES. */
export interface EvalCase {
  readonly id: string;
  /** skill-creator's numeric eval id: the case's position in the manifest, from 1. */
  readonly evalId: number;
  readonly mode: Mode;
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
  const { prompt, attachments, calibration, hashes } = cases[index];
  const mode = asMode(cases[index].mode);
  if (mode === null || calibration === undefined)
    throw new Error(`case "${id}" has no known mode or no calibration answers, so it cannot run headless`);
  return { id, evalId: index + 1, mode, prompt, inputs: [...attachments, calibration], hashes };
}

/** What the judge and the reader probe ask about a case's page: checklist.json's items and probe.json's questions. */
export interface QualityKeys {
  readonly checklist: readonly CaseItem[];
  readonly probe: readonly ProbeQuestion[];
}

const readCaseJson = <T>(file: string | undefined, fallback: T): T =>
  file === undefined ? fallback : (JSON.parse(readFileSync(path.join(CASES, file), 'utf8')) as T);

/** The case's checklist items and probe questions; null when it has neither, so only mechanical graders apply. */
export function qualityKeys(id: string): QualityKeys | null {
  const entry = readManifest().cases.find((candidate) => candidate.id === id);
  if (entry === undefined) throw new Error(`no eval case "${id}"`);
  if (entry.checklist === undefined && entry.probe === undefined) return null;
  return {
    checklist: readCaseJson<{ items: CaseItem[] }>(entry.checklist, { items: [] }).items,
    probe: readCaseJson<{ questions: ProbeQuestion[] }>(entry.probe, { questions: [] }).questions,
  };
}

/**
 * A key must come from what the run itself sees (its prompt, attachments and calibration answers), quoted verbatim,
 * never from a generated page or a provenance-only file. One problem per key that does not.
 */
export function keyProblems(dir: string, evalCase: EvalCase, { checklist, probe }: QualityKeys): string[] {
  const folder = path.dirname(evalCase.prompt);
  const seen = new Set([evalCase.prompt, ...evalCase.inputs].map((file) => path.basename(file)));
  const sourced = (label: string, { file, quote }: Source): string[] => {
    if (!seen.has(file)) return [`${label} quotes ${file}, which the run never sees`];
    const text = readFileSync(path.join(dir, folder, file), 'utf8');
    return text.includes(quote) ? [] : [`${label} quotes text not in ${file}: "${quote}"`];
  };
  const keyed = ({ id, choices, answer }: ProbeQuestion): string[] => {
    if (answer.length === 0) return [`probe ${id} has no key`];
    if (UNKNOWN in choices) return [`probe ${id} offers "${UNKNOWN}", which every question already offers`];
    return answer
      .filter((choice) => !(choice in choices))
      .map((choice) => `probe ${id} keys ${choice}, which is not one of its choices`);
  };
  return [
    ...(checklist.length >= 3 && checklist.length <= 5
      ? []
      : [`checklist has ${checklist.length} items; a case has 3 to 5`]),
    ...checklist.flatMap((item) => sourced(`checklist ${item.id}`, item.source)),
    ...probe.flatMap((question) => [...sourced(`probe ${question.id}`, question.source), ...keyed(question)]),
  ];
}
