// decision: FE-001 §3
export const PROGRESS_KEY = 'hancrafted:progress';

export interface ProgressEntry {
  readonly hash: string;
  readonly demo: boolean;
  readonly results: Readonly<Record<string, string>>;
  readonly prompts?: Readonly<Record<string, string>>;
}

export type ProgressStore = Readonly<Record<string, ProgressEntry>>;

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

const isOptionalTexts = (value: unknown): boolean =>
  value === undefined || (isRecord(value) && Object.values(value).every(isText));

export function isEntry(value: unknown): value is ProgressEntry {
  if (!isRecord(value)) return false;
  return (
    isText(value.hash) &&
    typeof value.demo === 'boolean' &&
    isRecord(value.results) &&
    Object.values(value.results).every(isText) &&
    isOptionalTexts(value.prompts)
  );
}

export function normalizedEntry<T extends Omit<ProgressEntry, 'hash'>>(entry: T): T {
  const { prompts, ...rest } = entry;
  return (prompts !== undefined && Object.keys(prompts).length > 0 ? entry : rest) as T;
}

export function parseProgress(raw: string | null): ProgressStore {
  const value = raw === null ? undefined : parseJson(raw);
  if (!isRecord(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([, each]) => isEntry(each))) as ProgressStore;
}

export function mergeProgress(raw: string | null, key: string, entry: ProgressEntry | null): string {
  const others = Object.entries(parseProgress(raw)).filter(([each]) => each !== key);
  return JSON.stringify(Object.fromEntries(entry === null ? others : [...others, [key, entry]]));
}

export function verdictOf(entry: ProgressEntry | undefined, hash: string): 'fresh' | 'resume' | 'stale' {
  if (!entry) return 'fresh';
  return entry.hash === hash ? 'resume' : 'stale';
}
