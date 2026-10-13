// A run's state, read from disk alone: each job of a per-run pipeline.yml
// as done, blocked, ready or waiting, from the latest run-log.md entry per
// job id. The orchestrator builds its todo list from this, never from memory.
// It reads the YAML itself: node runs this script without the `@/` alias and
// extensionless imports of src/lib, so it shares no code with the pipeline check.

import { parse } from 'yaml';

export type JobState = 'done' | 'gate' | 'blocked' | 'ready' | 'waiting';

interface PipelineJob {
  id: string;
  needs: string[];
  wants: string[];
  gate: boolean;
  outputs: string[];
}

/** The `status:` value of a staging file, tolerant of quotes and trailing space; null when there is none. */
export function frontmatterStatus(text: string): string | null {
  return /^status:[ \t]*["']?([^\s"']+)["']?[ \t]*$/m.exec(text)?.[1] ?? null;
}

const ENTRY = /^## (\S+) · \S+$/;
const METRIC = /^- \S+ · attempt (\d+) · (pass|fail)\b/;

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function jobsOf(yaml: string): PipelineJob[] {
  const jobs = (parse(yaml) as { jobs?: unknown[] } | null)?.jobs ?? [];
  return jobs.map((job) => {
    const { id, needs, wants, gate, outputs } = job as Record<string, unknown>;
    return { id: String(id), needs: strings(needs), wants: strings(wants), gate: gate === 'human', outputs: strings(outputs) };
  });
}

/** The lines of each job's latest run-log entry, by job id. */
function latestEntries(runLog: string): Map<string, string[]> {
  const entries = new Map<string, string[]>();
  let current: string[] = [];
  for (const line of runLog.split('\n')) {
    const job = ENTRY.exec(line)?.[1];
    if (job !== undefined) {
      current = [];
      entries.set(job, current);
    } else current.push(line);
  }
  return entries;
}

/** The lines under one h3 of an entry. */
function section(lines: readonly string[], title: string): string[] {
  const start = lines.indexOf(`### ${title}`);
  if (start === -1) return [];
  const end = lines.findIndex((line, at) => at > start && line.startsWith('### '));
  return lines.slice(start + 1, end === -1 ? undefined : end).filter((line) => line.trim() !== '');
}

/** Blocked when a Notes line starts `Blocked:`; done when every agent run of the last attempt passed. */
function logged(lines: readonly string[]): JobState | null {
  if (section(lines, 'Notes').some((line) => /^(- )?Blocked:/.test(line))) return 'blocked';
  const runs = section(lines, 'Metrics').flatMap((line) => {
    const match = METRIC.exec(line);
    return match === null ? [] : [{ attempt: Number(match[1]), pass: match[2] === 'pass' }];
  });
  if (runs.length === 0) return null;
  const last = Math.max(...runs.map(({ attempt }) => attempt));
  const final = runs.filter(({ attempt }) => attempt === last);
  return final.every(({ pass }) => pass) ? 'done' : null;
}

/** How a gate is read: a staging output's `status:`, or, for a job with no output, its tickets' labels. */
export interface GateReaders {
  outputStatus?: (output: string) => string | null;
  labelApproved?: (jobId: string) => boolean;
}

/**
 * Each job's state, in pipeline order. A job with no finished entry is
 * blocked when a job it needs is blocked, ready when every job it needs is
 * done and every job it wants is done or blocked, and waiting otherwise.
 * A `gate: human` job that is logged done reads `gate` until every output
 * it names has `status: approved`; `readers.outputStatus` reads one output's status (an output path with
 * `<slug>` as written in pipeline.yml), null when unreadable. A gate job that names no output has no
 * status to read: it reads `gate` until `readers.labelApproved(jobId)` says its tickets are approved, and
 * stays `gate` when none is given, so an unreadable label never opens the gate.
 */
export function runStatus(
  pipelineYaml: string,
  runLog: string,
  readers: GateReaders = {},
): { id: string; state: JobState }[] {
  const jobs = jobsOf(pipelineYaml);
  const entries = latestEntries(runLog);
  const states = new Map<string, JobState>();
  const stateOf = (id: string): JobState => {
    const known = states.get(id);
    if (known !== undefined) return known;
    // Seeded before recursing, so a cycle the pipeline check would refuse reads as waiting, not a stack overflow.
    states.set(id, 'waiting');
    const job = jobs.find((candidate) => candidate.id === id);
    const fromLog = entries.has(id) ? logged(entries.get(id) ?? []) : null;
    const state =
      job === undefined ? (fromLog ?? 'waiting') : (stateFor(job, fromLog, readers) ?? pending(job, stateOf));
    states.set(id, state);
    return state;
  };
  return jobs.map(({ id }) => ({ id, state: stateOf(id) }));
}

function stateFor(job: PipelineJob, fromLog: JobState | null, readers: GateReaders): JobState | null {
  if (fromLog === 'done' && job.gate && !approved(job, readers)) return 'gate';
  return fromLog;
}

function approved(job: PipelineJob, { outputStatus = () => null, labelApproved = () => false }: GateReaders): boolean {
  if (job.outputs.length === 0) return labelApproved(job.id);
  return job.outputs.every((output) => outputStatus(output) === 'approved');
}

function pending(job: PipelineJob, stateOf: (id: string) => JobState): JobState {
  const needs = job.needs.map(stateOf);
  if (needs.includes('blocked')) return 'blocked';
  const wantsFinished = job.wants.map(stateOf).every((state) => state === 'done' || state === 'blocked');
  return needs.every((state) => state === 'done') && wantsFinished ? 'ready' : 'waiting';
}
