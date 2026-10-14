// The active-run marker: `.scratch/active-run`, JSON written at run start and removed at run end. It says which Run
// is live and which session orchestrates it. Pure: `run-state.ts` writes it, `run-files.ts` reads it from disk,
// and the Claude Code adapter and every reader of open spans parse it here.

/** Where the marker sits, relative to the worktree root. */
export const MARKER_PATH = '.scratch/active-run';

/**
 * `log` is the log path, `session_id` the orchestrator's, `trace_id` the Run's, `job_span_id` the
 * orchestrator-session Job span that agents with an unparsed description join.
 */
export interface Marker {
  log: string;
  session_id: string;
  trace_id: string;
  job_span_id: string;
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
