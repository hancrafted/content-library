import { Document, isMap, isScalar, parse, Scalar } from 'yaml';

/** The one localStorage key every hands-on's progress lives under (FE-001 §3). */
export const PROGRESS_KEY = 'hancrafted:progress';

/** What is saved of one hands-on's run: the hash of its source, so an edited source never loads old results. */
export interface ProgressEntry {
  readonly hash: string;
  /** Teaching mode is progress, not a preference. */
  readonly teaching: boolean;
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isText = (value: unknown): value is string => typeof value === 'string';

function isEntry(value: unknown): value is ProgressEntry {
  if (!isRecord(value)) return false;
  return (
    isText(value.hash) &&
    typeof value.teaching === 'boolean' &&
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

const FILE_TYPE = 'application/x-yaml';

/** Block-literal style for every result, so a pasted Markdown result reads as it is. */
function blockResults(doc: Document): Document {
  const results = doc.get('results', true);
  if (!isMap(results)) return doc;
  for (const { value } of results.items) {
    if (isScalar(value) && typeof value.value === 'string') value.type = Scalar.BLOCK_LITERAL;
  }
  return doc;
}

/** The file a viewer downloads to keep a run: the Workflow, its hash, the teaching flag and the results, as YAML. */
export function progressFile(workflowId: string, entry: ProgressEntry): { name: string; text: string; type: string } {
  const slug = workflowId.replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '') || 'workflow';
  const doc = new Document({
    workflow: workflowId,
    hash: entry.hash,
    teaching: entry.teaching,
    results: entry.results,
  });
  return { name: `${slug}-progress.yml`, text: blockResults(doc).toString(), type: FILE_TYPE };
}

/** Why an uploaded progress file is not taken: it is no progress file, it is of another Workflow, or of an edited one. */
export type Refusal = 'unreadable' | 'other-workflow' | 'changed';

function parseYaml(text: string): unknown {
  try {
    return parse(text);
  } catch {
    return undefined;
  }
}

/** What an uploaded file holds for the Workflow shown now: its run, or the reason it is refused. */
export function readProgressFile(
  text: string,
  shown: { readonly workflow: string; readonly hash: string },
): { readonly entry: ProgressEntry } | { readonly refusal: Refusal } {
  const value = parseYaml(text);
  if (!isRecord(value) || !isText(value.workflow) || !isEntry(value)) return { refusal: 'unreadable' };
  if (value.workflow !== shown.workflow) return { refusal: 'other-workflow' };
  if (value.hash !== shown.hash) return { refusal: 'changed' };
  return { entry: { hash: value.hash, teaching: value.teaching, results: value.results } };
}
