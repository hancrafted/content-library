// decision: docs/decision-records/0005-frontmatter-follows-okf.md
import { parse, parseDocument } from 'yaml';

export const HARNESS_ACTOR = 'process:markdown-harness';
export const HAN_ACTOR = 'human:han';

export type Tier = 'unverified' | 'checked' | 'approved';

export interface VerifiedEntry {
  by: string;
  at: string;
}

export function utcSeconds(instant: Date): string {
  return instant.toISOString().replace(/\.\d+Z$/, 'Z');
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

function isMapping(node: unknown): node is Record<string, unknown> {
  return typeof node === 'object' && node !== null && !Array.isArray(node);
}

function frontmatterOf(text: string): Record<string, unknown> {
  const yaml = FRONTMATTER.exec(text)?.[1];
  if (yaml === undefined) return {};
  try {
    const value: unknown = parse(yaml);
    return isMapping(value) ? value : {};
  } catch {
    return {};
  }
}

export function frontmatterValue(text: string, key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>((node, part) => (isMapping(node) ? node[part] : undefined), frontmatterOf(text));
}

export function frontmatterField(text: string, key: string): string | null {
  const found = frontmatterValue(text, key);
  return typeof found === 'string' || typeof found === 'number' || typeof found === 'boolean' ? String(found) : null;
}

export function bodyOf(text: string): string {
  const match = FRONTMATTER.exec(text);
  return match === null ? text : text.slice(match[0].length);
}

function instant(value: unknown): number | null {
  const text = value instanceof Date ? value.toISOString() : typeof value === 'string' ? value : '';
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(text)) return null;
  const at = Date.parse(text);
  return Number.isNaN(at) ? null : at;
}

function listOrBare(value: unknown): unknown[] {
  return Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
}

function asEntries(value: unknown): { by: unknown; at: unknown }[] {
  return listOrBare(value).filter((item): item is { by: unknown; at: unknown } => isMapping(item));
}

export function gateTier(text: string): Tier {
  const frontmatter = frontmatterOf(text);
  const from = instant(isMapping(frontmatter.generated) ? frontmatter.generated.at : undefined);
  if (from === null) return 'unverified';
  const entries = asEntries(frontmatter.verified);
  const holds = (by: string) => entries.some((entry) => entry.by === by && (instant(entry.at) ?? -Infinity) >= from);
  if (holds(HAN_ACTOR)) return 'approved';
  return holds(HARNESS_ACTOR) ? 'checked' : 'unverified';
}

export function appendVerified(text: string, entry: VerifiedEntry, generated?: VerifiedEntry): string {
  const match = FRONTMATTER.exec(text);
  if (match === null) throw new Error('the file has no frontmatter to append a verified entry to');
  const doc = parseDocument(match[1] as string);
  if (doc.errors.length > 0) throw new Error('the frontmatter is not valid YAML, so no verified entry can be appended');
  const kept = asEntries(doc.toJS().verified as unknown);
  if (generated !== undefined) doc.set('generated', doc.createNode({ by: generated.by, at: generated.at }));
  doc.set('verified', doc.createNode([...kept, entry]));
  const end = match[0].endsWith('\n') ? '\n' : '';
  return `---\n${doc.toString().trimEnd()}\n---${end}${text.slice(match[0].length)}`;
}

const META_BLOCK =
  /(<script\b(?=[^>]*\bid=["']spec-meta["'])(?=[^>]*\btype=["']application\/json["'])[^>]*>)([\s\S]*?)(<\/script>)/;

export function metaBlockText(html: string): string | undefined {
  return META_BLOCK.exec(html)?.[2];
}

// decision: docs/decision-records/0005-frontmatter-follows-okf.md
export function metaGateTier(html: string): Tier {
  const json = metaBlockText(html);
  return json === undefined ? 'unverified' : gateTier(`---\n${json.trim()}\n---\n`);
}

// decision: docs/decision-records/0011-episode-design-is-reviewed-as-a-static-html-spec.md
export function appendMetaVerified(html: string, entry: VerifiedEntry, generated?: VerifiedEntry): string {
  const match = META_BLOCK.exec(html);
  if (match === null)
    throw new Error(
      'the Spec has no meta block, a <script type="application/json" id="spec-meta">, to append a verified entry to',
    );
  const [, open, json, close] = match as unknown as [string, string, string, string];
  let meta: unknown;
  try {
    meta = JSON.parse(json);
  } catch {
    meta = undefined;
  }
  if (!isMapping(meta)) throw new Error('the meta block is not a JSON object, so no verified entry can be appended');
  const indent = /[ \t]*$/.exec(html.slice(0, match.index))?.[0] ?? '';
  const stamped = generated === undefined ? meta : { ...meta, generated: { by: generated.by, at: generated.at } };
  const value = { ...stamped, verified: [...asEntries(meta.verified), entry] };
  const body = JSON.stringify(value, null, 2).replaceAll('</', '<\\/').replaceAll('\n', `\n${indent}  `);
  const block = `${open}\n${indent}  ${body}\n${indent}${close}`;
  return html.slice(0, match.index) + block + html.slice(match.index + match[0].length);
}

const ACTOR = /^(?:human|process):[a-z0-9-]+$|^[a-z0-9-]+\/[A-Za-z0-9.-]+$/;

export function isActor(value: unknown): value is string {
  return typeof value === 'string' && ACTOR.test(value);
}

function entryProblems(item: unknown, index: number): string[] {
  const label = `verified entry ${index + 1}`;
  if (!isMapping(item)) return [`${label} is not a { by, at } mapping.`];
  return [
    ...(isActor(item.by) ? [] : [`${label} needs an actor \`by\` (human:<id>, process:<id> or <producer>/<version>).`]),
    ...(instant(item.at) === null ? [`${label} needs an \`at\` datetime with a UTC offset.`] : []),
  ];
}

export function verifiedProblems(text: string): string[] {
  const value = frontmatterOf(text).verified;
  if (value === undefined) return [];
  const items = listOrBare(value);
  return items.length === 0 ? ['verified is empty; leave the key out instead.'] : items.flatMap(entryProblems);
}
