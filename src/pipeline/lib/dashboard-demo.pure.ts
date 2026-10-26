/*
 * The dashboard's demo Run: a recorded pipeline.yml and events.jsonl, published under public/dashboard-demo/.
 * `tools/demo/dashboard-demo.ts` makes the public copy from a local Run folder with the two functions below; the
 * dashboard replays it with its clock stopped at the Run's last event, so nothing in it reads as still running.
 */

/** Fields that carry an agent's full prompt or a path into the author's home folder; the demo shows neither. */
const PRIVATE_FIELDS = ['transcript_path', 'gen_ai.input.messages'];

/** Lines naming a local dev server port; on the public site those links would point at the reader's own machine. */
const LOCAL_PORT_LINE = /^\s*(?:dev_port|spec_port|port):/;

function relativePaths(value: unknown, repo: string): unknown {
  if (typeof value === 'string') {
    const worktree = new RegExp(`${repo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/(?:\\.worktrees/[^/\\s]+/)?`, 'g');
    return value.replace(worktree, '');
  }
  if (Array.isArray(value)) return value.map((item) => relativePaths(item, repo));
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, relativePaths(item, repo)]));
  }
  return value;
}

function parsedObject(raw: string): Record<string, unknown> | undefined {
  try {
    const value: unknown = JSON.parse(raw);
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

/** The JSON object lines of an events.jsonl; blank and unparseable lines are left out. */
function eventObjects(events: string): Record<string, unknown>[] {
  return events
    .split('\n')
    .map(parsedObject)
    .filter((line) => line !== undefined);
}

/** The public copy of a Run's events.jsonl: prompts and transcript paths dropped, repository paths made relative. */
export function publicDemoEvents(events: string, repo: string): string {
  const lines = eventObjects(events).map((line) => {
    const kept = Object.fromEntries(Object.entries(line).filter(([key]) => !PRIVATE_FIELDS.includes(key)));
    return JSON.stringify(relativePaths(kept, repo));
  });
  return lines.map((line) => `${line}\n`).join('');
}

/** The public copy of a Run's pipeline.yml: the local dev server ports removed. */
export function publicDemoPipeline(pipeline: string): string {
  return pipeline
    .split('\n')
    .filter((line) => !LOCAL_PORT_LINE.test(line))
    .join('\n');
}

/** A clock stopped at the latest event timestamp in events.jsonl, epoch milliseconds. */
export function demoClock(events: string): () => number {
  const times = eventObjects(events)
    .map(({ t }) => (typeof t === 'string' ? Date.parse(t) : Number.NaN))
    .filter(Number.isFinite);
  if (times.length === 0) throw new Error('The demo events.jsonl has no event timestamp.');
  const latest = Math.max(...times);
  return () => latest;
}
