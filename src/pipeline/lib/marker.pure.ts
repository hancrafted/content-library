// The active-run marker: `.scratch/active-run`, JSON written at run start and removed at run end. It says which Run
// is live and which session orchestrates it. Pure: `skills/new-episode/scripts/run-marker.ts` writes it, and the run-log module (episode-run-log.ts) reads it
// from disk and derives liveness from it.

/** Where the marker sits, relative to the worktree root. */
export const MARKER_PATH = '.scratch/active-run';

/**
 * `log` is the log path, `session_id` the orchestrator's, `trace_id` the Run's, `job_span_id` the Job span the
 * orchestrator is in (the Run's own span between Jobs), which end-job reads to step the marker back to the Run.
 */
export interface Marker {
  log: string;
  session_id: string;
  trace_id: string;
  job_span_id: string;
  /** Every session that has driven this Run, oldest first (begin-run, then each resume): end-run counts their usage. */
  session_ids?: string[];
}

/** JSON text to a value, null when it is absent or malformed. */
export function parseJson(text: string | null): unknown {
  try {
    return text === null ? null : JSON.parse(text);
  } catch {
    return null;
  }
}

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Every session that has driven the marker's Run; a marker written before `session_ids` names only its own. */
export const sessionsOf = (marker: Marker): string[] => marker.session_ids ?? [marker.session_id];

export function parseMarker(text: string | null): Marker | null {
  const m = parseJson(text);
  if (!isRecord(m)) return null;
  const ok = ['log', 'session_id', 'trace_id', 'job_span_id'].every((k) => typeof m[k] === 'string' && m[k] !== '');
  return ok ? (m as unknown as Marker) : null;
}

/** The trace ids of the Runs that are live: the one the marker names, none when there is no marker. */
export function liveTraces(markerText: string | null): ReadonlySet<string> {
  const marker = parseMarker(markerText);
  return new Set(marker === null ? [] : [marker.trace_id]);
}

/** The worktree paths in `git worktree list --porcelain` output, main checkout first. */
export const worktreePaths = (porcelain: string): string[] =>
  porcelain
    .split('\n')
    .filter((line) => line.startsWith('worktree '))
    .map((line) => line.slice('worktree '.length));
