/** The one localStorage key every hands-on's progress lives under (FE-001 §3). */
export const PROGRESS_KEY = 'hancrafted:progress';

/** What is saved of one hands-on's run: the hash of its source, so an edited source never loads old results. */
export interface ProgressEntry {
  readonly hash: string;
  /** Demo mode is progress, not a preference. */
  readonly demo: boolean;
  /** What the viewer pasted, keyed as the hands-on keys its results. */
  readonly results: Readonly<Record<string, string>>;
}

/** Every stored entry, by the hands-on's key. */
export type ProgressStore = Readonly<Record<string, ProgressEntry>>;

/** The key of a Workflow's run: the hands-on, shared by every Episode that shows it. */
export const progressKeyOf = (workflowId: string): string => `human-in-the-loop/${workflowId}`;

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isText = (value: unknown): value is string => typeof value === 'string';

export function isEntry(value: unknown): value is ProgressEntry {
  if (!isRecord(value)) return false;
  return (
    isText(value.hash) &&
    typeof value.demo === 'boolean' &&
    isRecord(value.results) &&
    Object.values(value.results).every(isText)
  );
}

/** Reads the stored store, keeping only valid entries; anything malformed yields `{}`. */
export function parseProgress(raw: string | null): ProgressStore {
  const value = raw === null ? undefined : parseJson(raw);
  if (!isRecord(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([, each]) => isEntry(each))) as ProgressStore;
}

/** The serialized store after setting `key` to `entry` (`null` removes it), the other entries kept. */
export function mergeProgress(raw: string | null, key: string, entry: ProgressEntry | null): string {
  const others = Object.entries(parseProgress(raw)).filter(([each]) => each !== key);
  return JSON.stringify(Object.fromEntries(entry === null ? others : [...others, [key, entry]]));
}

/** What a stored entry means for the source as it is now: no entry, one to resume, or one of an edited source. */
export function verdictOf(entry: ProgressEntry | undefined, hash: string): 'fresh' | 'resume' | 'stale' {
  if (!entry) return 'fresh';
  return entry.hash === hash ? 'resume' : 'stale';
}
