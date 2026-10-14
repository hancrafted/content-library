// Shared by `query.ts` and `runs-csv.ts`: reads run logs from files or globs into query sources. With no
// arguments it reads every live log (`docs/episodes/*/events.jsonl`) and every archived one
// (`.logs/new-episode/*/*.jsonl`). A Run present in both is read once, from the first path that holds it.
import { globSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { liveTracesIn } from './run-files.ts';
import { fold, parseLog } from './run-log.pure.ts';
import type { RunSource } from './run-query.pure.ts';

const DEFAULT_PATTERNS = ['docs/episodes/*/events.jsonl', '.logs/new-episode/*/*.jsonl'];

function readLog(file: string, live: ReadonlySet<string>): { trace: string; source: RunSource } {
  const { lines, errors } = parseLog(readFileSync(file, 'utf8'));
  for (const error of errors) console.error(`! ${file}: ${error}`);
  const trace = lines.find((l) => l.kind === 'start-run')?.trace_id ?? file;
  return { trace, source: { episode: path.basename(path.dirname(file)), folded: fold(lines, { live }) } };
}

export function readLogs(patterns: readonly string[]): { sources: RunSource[]; files: string[] } {
  const wanted = patterns.length > 0 ? patterns : DEFAULT_PATTERNS;
  const files = [...new Set(wanted.flatMap((pattern) => globSync(pattern)))].sort();
  const live = liveTracesIn();
  const byTrace = new Map<string, RunSource>();
  for (const { trace, source } of files.map((file) => readLog(file, live))) if (!byTrace.has(trace)) byTrace.set(trace, source);
  return { sources: [...byTrace.values()], files };
}
