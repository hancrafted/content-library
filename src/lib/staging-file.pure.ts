/*
 * A Staging file's frontmatter, read once for every caller: the cross-file checks in src/lib, the docs tests and
 * the new-episode skill scripts. It imports nothing but `yaml`, so the scripts run it under bare node.
 *
 * Its trust tiers follow design-ADR 0005: `verified` is a list of `{ by, at }` entries (or one bare mapping, which
 * OKF reads as a one-element list), and an entry counts only while its `at` is at or after `generated.at`.
 */

import { parse, parseDocument } from 'yaml';

export const HARNESS_ACTOR = 'process:markdown-harness';
export const HAN_ACTOR = 'human:han';

/** A file's gate tier: machine-confirmed is `checked`, Han's approval is `approved`. */
export type Tier = 'unverified' | 'checked' | 'approved';

export interface VerifiedEntry {
  by: string;
  at: string;
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

function isMapping(node: unknown): node is Record<string, unknown> {
  return typeof node === 'object' && node !== null && !Array.isArray(node);
}

/** The frontmatter as a mapping; empty when the file has none, or when it is not a YAML mapping. */
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

/** A frontmatter field's parsed YAML value at a dotted key, of any shape, or undefined when absent or unreadable. */
export function frontmatterValue(text: string, key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>((node, part) => (isMapping(node) ? node[part] : undefined), frontmatterOf(text));
}

/**
 * A frontmatter field's value as YAML reads it, as text, or null when the frontmatter has no such field, the
 * field is not a scalar, or the frontmatter is not valid YAML. A dotted key (`generated.at`) reads through nested
 * mappings, written in block or flow form, to any depth; a key that itself contains a dot cannot be addressed.
 */
export function frontmatterField(text: string, key: string): string | null {
  const found = frontmatterValue(text, key);
  return typeof found === 'string' || typeof found === 'number' || typeof found === 'boolean' ? String(found) : null;
}

/** The body: everything after the frontmatter, or the whole text when the file has none. */
export function bodyOf(text: string): string {
  const match = FRONTMATTER.exec(text);
  return match === null ? text : text.slice(match[0].length);
}

/** The instant a frontmatter value names, as milliseconds; null when it is not a datetime with a UTC offset. */
function instant(value: unknown): number | null {
  const text = value instanceof Date ? value.toISOString() : typeof value === 'string' ? value : '';
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(text)) return null;
  const at = Date.parse(text);
  return Number.isNaN(at) ? null : at;
}

/** The items of a `verified` value: a list as is, one bare mapping as a one-element list, nothing as an empty list. */
function listOrBare(value: unknown): unknown[] {
  return Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
}

function asEntries(value: unknown): { by: unknown; at: unknown }[] {
  return listOrBare(value).filter((item): item is { by: unknown; at: unknown } => isMapping(item));
}

/**
 * The gate tier: approved when a `human:han` entry is at or after `generated.at`, else checked when a
 * `process:markdown-harness` entry is, else unverified. A file with no readable `generated.at`, or with
 * frontmatter that is not valid YAML, is unverified.
 */
export function gateTier(text: string): Tier {
  const frontmatter = frontmatterOf(text);
  const from = instant(isMapping(frontmatter.generated) ? frontmatter.generated.at : undefined);
  if (from === null) return 'unverified';
  const entries = asEntries(frontmatter.verified);
  const holds = (by: string) => entries.some((entry) => entry.by === by && (instant(entry.at) ?? -Infinity) >= from);
  if (holds(HAN_ACTOR)) return 'approved';
  return holds(HARNESS_ACTOR) ? 'checked' : 'unverified';
}

/**
 * The file with `{ by, at }` appended to its `verified` list. Never overwrites an entry, turns a bare
 * mapping into a list, and leaves every other frontmatter key and the body as written. Throws when the
 * file has no frontmatter, or frontmatter that is not valid YAML.
 */
export function appendVerified(text: string, entry: VerifiedEntry): string {
  const match = FRONTMATTER.exec(text);
  if (match === null) throw new Error('the file has no frontmatter to append a verified entry to');
  const doc = parseDocument(match[1] as string);
  if (doc.errors.length > 0) throw new Error('the frontmatter is not valid YAML, so no verified entry can be appended');
  const kept = asEntries(doc.toJS().verified as unknown);
  doc.set('verified', doc.createNode([...kept, entry]));
  const end = match[0].endsWith('\n') ? '\n' : '';
  return `---\n${doc.toString().trimEnd()}\n---${end}${text.slice(match[0].length)}`;
}

const META_BLOCK =
  /(<script\b(?=[^>]*\bid=["']spec-meta["'])(?=[^>]*\btype=["']application\/json["'])[^>]*>)([\s\S]*?)(<\/script>)/;

/**
 * An HTML Spec with `{ by, at }` appended to its meta block's `verified` list, the frontmatter equivalent of
 * design-ADR 0011: the same never-overwrite rule as appendVerified, the JSON rewritten at the block's indent and
 * every other byte of the page as written. Throws when the page has no meta block, or one that is not a JSON object.
 */
export function appendMetaVerified(html: string, entry: VerifiedEntry): string {
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
  const value = { ...meta, verified: [...asEntries(meta.verified), entry] };
  const body = JSON.stringify(value, null, 2).replaceAll('</', '<\\/').replaceAll('\n', `\n${indent}  `);
  const block = `${open}\n${indent}  ${body}\n${indent}${close}`;
  return html.slice(0, match.index) + block + html.slice(match.index + match[0].length);
}

const ACTOR = /^(?:human|process):[a-z0-9-]+$|^[a-z0-9-]+\/[A-Za-z0-9.-]+$/;

/** Whether a value is an OKF actor: `human:<id>`, `process:<id>` or `<producer>/<version>`. */
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

/** What is wrong with the `verified` entries of a file: each needs an actor `by` and an `at` datetime with a UTC offset. */
export function verifiedProblems(text: string): string[] {
  const value = frontmatterOf(text).verified;
  if (value === undefined) return [];
  const items = listOrBare(value);
  return items.length === 0 ? ['verified is empty; leave the key out instead.'] : items.flatMap(entryProblems);
}
