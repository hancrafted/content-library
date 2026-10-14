// The Episode run-log module: the one place that knows where a Run's events live (`docs/episodes/<slug>/events.jsonl`
// live, `.logs/new-episode/<slug>/<run id>.jsonl` archived), reads and folds them, applies liveness, and says which
// Run is current. Every reader and writer of the log goes through it. Real disk only; the shapes live in run-log.pure.ts.
// Liveness: a span with no end line is `running` only when the worktree's active-run marker names its Run, else `crashed`.
import { existsSync, globSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { liveTraces, MARKER_PATH, parseMarker, type Marker } from './marker.pure.ts';
import { currentRun, fold, parseLog, type Folded, type RunLogLine } from './run-log.pure.ts';
import type { RunSource } from './run-query.pure.ts';

/** Where read-all looks by default: every live log and every archived one. */
export const DEFAULT_PATTERNS = ['docs/episodes/*/events.jsonl', '.logs/new-episode/*/*.jsonl'];

/** One log file, read: its lines, the parse errors (already prefixed with the file), the folded Runs and the current Run. */
export interface EpisodeLog {
  /** The file read, resolved against the root. */
  file: string;
  lines: RunLogLine[];
  errors: string[];
  /** The lines folded with liveness applied. */
  folded: Folded;
  /** The newest `start-run` line, null when the log holds no Run. */
  current: RunLogLine | null;
}

/** The file's text, null when it does not exist. */
export const readOrNull = (file: string): string | null => (existsSync(file) ? readFileSync(file, 'utf8') : null);

/** The live log of an Episode, relative to the worktree root. */
export const episodeLogPath = (slug: string): string => path.join('docs/episodes', slug, 'events.jsonl');

/** The active-run marker of the worktree at `root`, null when absent or malformed. */
export const readMarker = (root = '.'): Marker | null => parseMarker(readOrNull(path.join(root, MARKER_PATH)));

const liveTracesIn = (root: string): ReadonlySet<string> => liveTraces(readOrNull(path.join(root, MARKER_PATH)));

/** One log file parsed: its resolved path, lines and parse errors, each error prefixed with that path. A missing file reads as empty. */
function parseFile(file: string, root: string): { full: string; lines: RunLogLine[]; errors: string[] } {
  const full = path.resolve(root, file);
  const { lines, errors } = parseLog(readOrNull(full) ?? '');
  return { full, lines, errors: errors.map((error) => `${full}: ${error}`) };
}

/** Reads one log file (relative to `root`, or absolute); a missing file reads as empty. */
export function readLog(file: string, root = '.'): EpisodeLog {
  const { full, lines, errors } = parseFile(file, root);
  return { file: full, lines, errors, folded: fold(lines, { live: liveTracesIn(root) }), current: currentRun(lines) };
}

/** Reads an Episode's live log. */
export const readEpisodeLog = (slug: string, root = '.'): EpisodeLog => readLog(episodeLogPath(slug), root);

/** The Runs of one log, each with its line count, folded with liveness applied. */
const runsIn = (
  lines: readonly RunLogLine[],
  episode: string,
  live: ReadonlySet<string>,
): { trace: string; size: number; source: RunSource }[] =>
  [...new Set(lines.map((l) => l.trace_id))].map((trace) => {
    const run = lines.filter((l) => l.trace_id === trace);
    return { trace, size: run.length, source: { episode, folded: fold(run, { live }) } };
  });

/**
 * Every Run in the logs matching `patterns` (default: all live and archived logs), as one source per Run.
 * Runs are told apart by trace id, so a live log holding Runs A and B plus an archive of A still yields both.
 * A Run held by more than one log is read from the copy with the most lines (the live log is a superset of an
 * archive taken mid-Run); on a tie the first path (sorted) wins.
 */
export function readRuns(
  patterns: readonly string[] = [],
  root = '.',
): { sources: RunSource[]; files: string[]; errors: string[] } {
  const files = [
    ...new Set(
      (patterns.length > 0 ? patterns : DEFAULT_PATTERNS).flatMap((pattern) => globSync(pattern, { cwd: root })),
    ),
  ].sort();
  const live = liveTracesIn(root);
  const best = new Map<string, { size: number; source: RunSource }>();
  const errors: string[] = [];
  for (const file of files) {
    const parsed = parseFile(file, root);
    errors.push(...parsed.errors);
    for (const run of runsIn(parsed.lines, path.basename(path.dirname(file)), live)) keepLargest(best, run);
  }
  return { sources: [...best.values()].map(({ source }) => source), files, errors };
}

/** Keeps `run` unless `best` already holds a copy of that Run with at least as many lines. */
function keepLargest(
  best: Map<string, { size: number; source: RunSource }>,
  { trace, size, source }: { trace: string; size: number; source: RunSource },
): void {
  if (size > (best.get(trace)?.size ?? 0)) best.set(trace, { size, source });
}
