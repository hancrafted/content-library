export const MARKER_PATH = '.scratch/active-run';

export interface Marker {
  log: string;
  session_id: string;
  trace_id: string;
  job_span_id: string;
  session_ids?: string[];
}

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

export const sessionsOf = (marker: Marker): string[] => marker.session_ids ?? [marker.session_id];

export function parseMarker(text: string | null): Marker | null {
  const m = parseJson(text);
  if (!isRecord(m)) return null;
  const ok = ['log', 'session_id', 'trace_id', 'job_span_id'].every((k) => typeof m[k] === 'string' && m[k] !== '');
  return ok ? (m as unknown as Marker) : null;
}

export function liveTraces(markerText: string | null): ReadonlySet<string> {
  const marker = parseMarker(markerText);
  return new Set(marker === null ? [] : [marker.trace_id]);
}

export const worktreePaths = (porcelain: string): string[] =>
  porcelain
    .split('\n')
    .filter((line) => line.startsWith('worktree '))
    .map((line) => line.slice('worktree '.length));
