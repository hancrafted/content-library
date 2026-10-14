// The Episode run-log module: the one place that knows where a Run's events live (`docs/episodes/<slug>/events.jsonl`
// live, `.logs/new-episode/<slug>/<run id>.jsonl` archived), reads and folds them, applies liveness, and says which
// Run is current. Every reader and writer of the log goes through it. Real disk only; the shapes live in run-log.pure.ts.
// Liveness: a span with no end line is `running` only when the worktree's active-run marker names its Run, else `crashed`.
import { existsSync, globSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { liveTraces, type Marker, MARKER_PATH, parseMarker } from './marker.pure.ts';
import { currentRun, fold, parseLog, type Folded, type RunLogLine } from './run-log.pure.ts';
import type { RunSource } from './run-query.pure.ts';

/** Where read-all looks by default: every live log and every archived one. */
export const DEFAULT_PATTERNS = ['docs/episodes/*/events.jsonl', '.logs/new-episode/*/*.jsonl'];

/** One log file, read: its lines, the parse errors (already prefixed with the file), the folded Runs and the current Run. */
export interface EpisodeLog {
  /** The file read, joined onto the root. */
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

/** Reads one log file (relative to `root`, or absolute); a missing file reads as empty. */
export function readLog(file: string, root = '.'): EpisodeLog {
  const full = path.join(root, file);
  const { lines, errors } = parseLog(readOrNull(full) ?? '');
  return {
    file: full,
    lines,
    errors: errors.map((error) => `${full}: ${error}`),
    folded: fold(lines, { live: liveTracesIn(root) }),
    current: currentRun(lines),
  };
}

/** Reads an Episode's live log. */
export const readEpisodeLog = (slug: string, root = '.'): EpisodeLog => readLog(episodeLogPath(slug), root);

/**
 * Every Run in the logs matching `patterns` (default: all live and archived logs), as one source per Run.
 * A Run held by more than one log is read once, from the first path (sorted) that holds it; Runs are told
 * apart by trace id, so a live log holding Runs A and B plus an archive of A still yields both.
 */
export function readRuns(patterns: readonly string[] = [], root = '.'): { sources: RunSource[]; files: string[]; errors: string[] } {
  const wanted = patterns.length > 0 ? patterns : DEFAULT_PATTERNS;
  const files = [...new Set(wanted.flatMap((pattern) => globSync(pattern, { cwd: root })))].sort();
  const live = liveTracesIn(root);
  const byTrace = new Map<string, RunSource>();
  const errors: string[] = [];
  for (const file of files) {
    const { lines, errors: fileErrors } = parseLog(readFileSync(path.join(root, file), 'utf8'));
    errors.push(...fileErrors.map((error) => `${file}: ${error}`));
    const episode = path.basename(path.dirname(file));
    for (const trace of new Set(lines.map((l) => l.trace_id))) {
      if (!byTrace.has(trace)) byTrace.set(trace, { episode, folded: fold(lines.filter((l) => l.trace_id === trace), { live }) });
    }
  }
  return { sources: [...byTrace.values()], files, errors };
}
