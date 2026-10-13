// A run's state, read from disk alone: each job of a per-run pipeline.yml
// as done, blocked, ready or waiting, from the latest run-log.md entry per
// job id. The orchestrator builds its todo list from this, never from memory.
// It reads the pipeline and the gates through the same src/lib modules the
// pipeline check uses; they import nothing but `yaml`, so bare node runs them.

import { readPipeline, type Job } from '../../../../src/lib/episode-pipeline-jobs.pure.ts';
import { gateTier } from '../../../../src/lib/staging-file.pure.ts';

export type JobState = 'done' | 'gate' | 'blocked' | 'ready' | 'waiting';

/**
 * Whether one output opens its gate: a markdown staging file once its trust tier is approved (`gateTier`, from
 * `verified` and `generated.at`), and any other file, pipeline.yml, once its `status:` is approved (design-ADR
 * 0005 keeps `status: approved` there because it is config, not markdown).
 */
export function outputApproved(file: string, text: string): boolean {
  return file.endsWith('.md') ? gateTier(text) === 'approved' : readPipeline(text)?.status === 'approved';
}

/** A sub-issue as `gh api .../sub_issues` returns it, reduced to what the gate reads. */
export interface SubIssue {
  state: string;
  labels: { name: string }[];
}

/** The design gate's rule: the spec issue has sub-issues, and none still open carries `needs-triage`. */
export function subIssuesApproved(tickets: readonly SubIssue[]): boolean {
  const open = tickets.filter((ticket) => ticket.state === 'open');
  return tickets.length > 0 && open.every((ticket) => !ticket.labels.some((label) => label.name === 'needs-triage'));
}

const ENTRY = /^## (\S+) · \S+$/;
const METRIC = /^- \S+ · attempt (\d+) · (pass|fail)\b/;

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

/** How a gate is read: whether a staging output is approved (`outputApproved`), or, for a job with no output, its tickets. */
export interface GateReaders {
  outputApproved?: (output: string) => boolean;
  labelApproved?: (jobId: string) => boolean;
}

/** What the gate readers reach outside the process: a repo file's text, null when it is missing, and gh's stdout. */
export interface GateSources {
  read: (file: string) => string | null;
  /** Runs `gh` with these arguments and returns its stdout; throws when gh fails. */
  gh: (args: readonly string[]) => string;
}

/**
 * The gate readers for one Episode run. An output path names `<slug>`, filled in before it is read; a missing
 * output is not approved. A label gate asks gh for the spec issue labelled `episode:<slug>` and its sub-issues
 * (`subIssuesApproved`); any gh failure or unreadable answer reads as not approved, so the gate stays shut.
 */
export function gateReaders(slug: string, { read, gh }: GateSources): GateReaders {
  return {
    outputApproved: (output) => {
      const file = output.replaceAll('<slug>', slug);
      const text = read(file);
      return text !== null && outputApproved(file, text);
    },
    labelApproved: () => {
      try {
        const [spec] = JSON.parse(gh(['issue', 'list', '--label', `episode:${slug}`, '--state', 'all', '--json', 'number'])) as { number: number }[];
        if (spec === undefined) return false;
        return subIssuesApproved(JSON.parse(gh(['api', `repos/{owner}/{repo}/issues/${spec.number}/sub_issues`])) as SubIssue[]);
      } catch {
        return false;
      }
    },
  };
}

/**
 * Each job's state, in pipeline order. A job with no finished entry is
 * blocked when a job it needs is blocked, ready when every job it needs is
 * done and every job it wants is done or blocked, and waiting otherwise.
 * A `gate: human` job that is logged done reads `gate` until every output
 * it names is approved; `readers.outputApproved` reads one output (an output path with `<slug>` as written in
 * pipeline.yml) and is built by `gateReaders`. A gate job that names no output has no
 * status to read: it reads `gate` until `readers.labelApproved(jobId)` says its tickets are approved, and
 * stays `gate` when none is given, so an unreadable label never opens the gate.
 */
export function runStatus(
  pipelineYaml: string,
  runLog: string,
  readers: GateReaders = {},
): { id: string; state: JobState }[] {
  const jobs = readPipeline(pipelineYaml)?.jobs ?? [];
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

function stateFor(job: Job, fromLog: JobState | null, readers: GateReaders): JobState | null {
  if (fromLog === 'done' && job.gate && !approved(job, readers)) return 'gate';
  return fromLog;
}

function approved(job: Job, { outputApproved = () => false, labelApproved = () => false }: GateReaders): boolean {
  if (job.outputs.length === 0) return labelApproved(job.id);
  return job.outputs.every((output) => outputApproved(output));
}

function pending(job: Job, stateOf: (id: string) => JobState): JobState {
  const needs = job.needs.map(stateOf);
  if (needs.includes('blocked')) return 'blocked';
  const wantsFinished = job.wants.map(stateOf).every((state) => state === 'done' || state === 'blocked');
  return needs.every((state) => state === 'done') && wantsFinished ? 'ready' : 'waiting';
}
