import type { z } from 'zod';
import type { RecordKind } from './content-schemas.pure';

/*
 * Reading raw records through their Zod schemas for the content store: a record that fails becomes named refusals,
 * never a thrown parse error.
 */

/** One refusal: the kind of record, which one, and one sentence on what is wrong with it. */
export interface Refusal {
  readonly kind: RecordKind;
  /** The record's slug, id or path, whichever names it. */
  readonly record: string;
  readonly message: string;
}

export interface Parsed<T> {
  readonly value: T;
  readonly refusals: readonly Refusal[];
}

function refuse(kind: RecordKind, record: string, issues: readonly z.core.$ZodIssue[]): Refusal[] {
  return issues.map((issue) => {
    const where = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
    return { kind, record, message: `${where}${issue.message}` };
  });
}

/**
 * The name a raw record goes by: its slug, its id for a Playlist, its Episode for a Slide list, or its source item for
 * a Source baseline entry.
 */
function slugOfRaw(raw: unknown): string {
  const fields = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const value = fields.slug ?? fields.id ?? fields.episode ?? fields.source;
  return typeof value === 'string' ? value : '(unnamed)';
}

/** Every raw record read through its schema: the ones that pass, and a named refusal per issue of each that fails. */
export function readAll<S extends z.ZodType>(
  kind: RecordKind,
  schema: S,
  raws: readonly unknown[],
): Parsed<z.infer<S>[]> {
  const value: z.infer<S>[] = [];
  const refusals: Refusal[] = [];
  for (const raw of raws) {
    const result = schema.safeParse(raw);
    if (result.success) value.push(result.data);
    else refusals.push(...refuse(kind, slugOfRaw(raw), result.error.issues));
  }
  return { value, refusals };
}
