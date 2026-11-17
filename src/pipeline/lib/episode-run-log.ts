import { copyFileSync, existsSync, globSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { liveTraces, MARKER_PATH, parseMarker, type Marker } from './marker.pure.ts';
import { currentRun, fold, parseLog, type Folded, type RunLogLine } from './run-log.pure.ts';
import type { RunSource } from './run-query.pure.ts';

export const DEFAULT_PATTERNS = ['docs/episodes/*/events.jsonl', '.logs/new-episode/*/events.jsonl'];

export interface EpisodeLog {
  file: string;
  lines: RunLogLine[];
  errors: string[];
  folded: Folded;
  current: RunLogLine | null;
}

export const readOrNull = (file: string): string | null => (existsSync(file) ? readFileSync(file, 'utf8') : null);

export const episodeLogPath = (slug: string): string => path.join('docs/episodes', slug, 'events.jsonl');

export const readMarker = (root = '.'): Marker | null => parseMarker(readOrNull(path.join(root, MARKER_PATH)));

const liveTracesIn = (root: string): ReadonlySet<string> => liveTraces(readOrNull(path.join(root, MARKER_PATH)));

function parseFile(file: string, root: string): { full: string; lines: RunLogLine[]; errors: string[] } {
  const full = path.resolve(root, file);
  const { lines, errors } = parseLog(readOrNull(full) ?? '');
  return { full, lines, errors: errors.map((error) => `${full}: ${error}`) };
}

export function readLog(file: string, root = '.'): EpisodeLog {
  const { full, lines, errors } = parseFile(file, root);
  return { file: full, lines, errors, folded: fold(lines, { live: liveTracesIn(root) }), current: currentRun(lines) };
}

export const readEpisodeLog = (slug: string, root = '.'): EpisodeLog => readLog(episodeLogPath(slug), root);

const runsIn = (
  lines: readonly RunLogLine[],
  episode: string,
  live: ReadonlySet<string>,
): { trace: string; size: number; source: RunSource }[] =>
  [...new Set(lines.map((l) => l.trace_id))].map((trace) => {
    const run = lines.filter((l) => l.trace_id === trace);
    return { trace, size: run.length, source: { episode, folded: fold(run, { live }) } };
  });

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

function keepLargest(
  best: Map<string, { size: number; source: RunSource }>,
  { trace, size, source }: { trace: string; size: number; source: RunSource },
): void {
  if (size > (best.get(trace)?.size ?? 0)) best.set(trace, { size, source });
}

const DASHBOARD_FILES = ['events.jsonl', 'pipeline.yml'];
const RECORD_FILES = ['brief.md', 'spec/spec.html'];

export function archiveEpisodeLog(slug: string, root: string): string {
  const target = `.logs/new-episode/${slug}/`;
  const staging = path.dirname(episodeLogPath(slug));
  const present = RECORD_FILES.filter((file) => existsSync(path.join(root, staging, file)));
  for (const file of [...DASHBOARD_FILES, ...present]) {
    mkdirSync(path.dirname(path.join(root, target, file)), { recursive: true });
    copyFileSync(path.join(root, staging, file), path.join(root, target, file));
  }
  return target;
}
