/*
 * Han's confirmation of an evidence file (a Research question, a staged Concept): a `verified` entry by `human:han` at
 * or after `generated.at`. A re-run that moves `generated.at` makes the file a proposal again, with nothing to
 * remember (design-ADR 0016, Citations rule 5).
 */

const HAN = 'human:han';

interface Verification {
  readonly by: string;
  readonly at: string;
}

/** What the confirmation reads of a file's frontmatter. */
export interface Confirmable {
  readonly generated: { readonly at: string };
  readonly verified?: Verification | readonly Verification[];
}

/** Whether Han has confirmed the file since it was last written. */
export function confirmedByHan({ verified, generated }: Confirmable): boolean {
  const entries = verified === undefined ? [] : Array.isArray(verified) ? verified : [verified];
  const since = Date.parse(generated.at);
  return entries.some(({ by, at }: Verification) => by === HAN && Date.parse(at) >= since);
}
