// A staging file's trust tiers, read from its frontmatter alone (design-ADR 0005): `verified` is a list of
// `{ by, at }` entries (or one bare mapping, which OKF reads as a one-element list), and an entry counts only
// while its `at` is at or after `generated.at`. Like status.pure.ts this runs under bare node, so it shares
// no code with src/lib.

import { parse, parseDocument } from 'yaml';

export const MACHINE = 'process:markdown-harness';
export const HUMAN = 'human:han';

export type Tier = 'unverified' | 'checked' | 'approved';

export interface Entry {
  by: string;
  at: string;
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

function frontmatterOf(text: string): Record<string, unknown> {
  const yaml = FRONTMATTER.exec(text)?.[1];
  const value: unknown = yaml === undefined ? null : parse(yaml);
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

/** The instant a frontmatter value names, as milliseconds; null when it is not a datetime with a UTC offset. */
function instant(value: unknown): number | null {
  const text = value instanceof Date ? value.toISOString() : typeof value === 'string' ? value : '';
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(text)) return null;
  const at = Date.parse(text);
  return Number.isNaN(at) ? null : at;
}

function asEntries(value: unknown): { by: unknown; at: unknown }[] {
  const items = Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
  return items.filter((item): item is { by: unknown; at: unknown } => typeof item === 'object' && item !== null && !Array.isArray(item));
}

/** The `verified` entries of a file whose `by` is text and whose `at` is a datetime; a bare mapping reads as one entry. */
export function verifiedEntries(text: string): Entry[] {
  return asEntries(frontmatterOf(text).verified).flatMap(({ by, at }) =>
    typeof by === 'string' && instant(at) !== null ? [{ by, at: at instanceof Date ? at.toISOString() : String(at) }] : [],
  );
}

/**
 * The gate tier: approved when a `human:han` entry is at or after `generated.at`, else checked when a
 * `process:markdown-harness` entry is, else unverified. A file with no readable `generated.at` is unverified.
 */
export function gateTier(text: string): Tier {
  const generated = (frontmatterOf(text).generated as { at?: unknown } | null | undefined)?.at;
  const from = instant(generated);
  if (from === null) return 'unverified';
  const holds = (by: string) => verifiedEntries(text).some((entry) => entry.by === by && (instant(entry.at) ?? -Infinity) >= from);
  if (holds(HUMAN)) return 'approved';
  return holds(MACHINE) ? 'checked' : 'unverified';
}

/**
 * The file with `{ by, at }` appended to its `verified` list. Never overwrites an entry, turns a bare
 * mapping into a list, and leaves every other frontmatter key and the body as written. Throws when the
 * file has no frontmatter.
 */
export function appendVerified(text: string, entry: Entry): string {
  const match = FRONTMATTER.exec(text);
  if (match === null) throw new Error('the file has no frontmatter to append a verified entry to');
  const doc = parseDocument(match[1] as string);
  const kept = asEntries(doc.toJS().verified as unknown);
  doc.set('verified', doc.createNode([...kept, entry]));
  const end = match[0].endsWith('\n') ? '\n' : '';
  return `---\n${doc.toString().trimEnd()}\n---${end}${text.slice(match[0].length)}`;
}

const ACTOR = /^(?:human|process):[a-z0-9-]+$|^[a-z0-9-]+\/[A-Za-z0-9.-]+$/;

function entryProblems(item: unknown, at: number): string[] {
  const label = `verified entry ${at + 1}`;
  if (typeof item !== 'object' || item === null || Array.isArray(item)) return [`${label} is not a { by, at } mapping.`];
  const { by, at: when } = item as Record<string, unknown>;
  return [
    ...(typeof by === 'string' && ACTOR.test(by) ? [] : [`${label} needs an actor \`by\` (human:<id>, process:<id> or <producer>/<version>).`]),
    ...(instant(when) === null ? [`${label} needs an \`at\` datetime with a UTC offset.`] : []),
  ];
}

/** What is wrong with the `verified` entries of a file: each needs an actor `by` and an `at` datetime with a UTC offset. */
export function verifiedProblems(text: string): string[] {
  const value = frontmatterOf(text).verified;
  if (value === undefined) return [];
  const items = Array.isArray(value) ? value : [value];
  return items.length === 0 ? ['verified is empty; leave the key out instead.'] : items.flatMap(entryProblems);
}
