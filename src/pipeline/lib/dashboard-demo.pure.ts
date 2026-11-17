const PRIVATE_FIELDS = ['transcript_path', 'gen_ai.input.messages'];

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

function eventObjects(events: string): Record<string, unknown>[] {
  return events
    .split('\n')
    .map(parsedObject)
    .filter((line) => line !== undefined);
}

export function publicDemoEvents(events: string, repo: string): string {
  const lines = eventObjects(events).map((line) => {
    const kept = Object.fromEntries(Object.entries(line).filter(([key]) => !PRIVATE_FIELDS.includes(key)));
    return JSON.stringify(relativePaths(kept, repo));
  });
  return lines.map((line) => `${line}\n`).join('');
}

export function publicDemoPipeline(pipeline: string): string {
  return pipeline
    .split('\n')
    .filter((line) => !LOCAL_PORT_LINE.test(line))
    .join('\n');
}

export function demoClock(events: string): () => number {
  const times = eventObjects(events)
    .map(({ t }) => (typeof t === 'string' ? Date.parse(t) : Number.NaN))
    .filter(Number.isFinite);
  if (times.length === 0) throw new Error('The demo events.jsonl has no event timestamp.');
  const latest = Math.max(...times);
  return () => latest;
}
