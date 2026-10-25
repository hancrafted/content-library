/*
 * The Research questions as the pipeline reads them before it commissions research (design-ADR 0016, Pipeline and
 * evidence rules 1 to 3): one listing of the wiki and every open Staging, narrowed by a Concept, each entry with its
 * confidence and whether it is still fresh, so `retrieval` decides reuse, refresh or new without opening folders and
 * sees another Run's staged questions; and the next free id of a prefix across both, for `categorize-research`.
 */

/** What the listing needs of a Research question. */
export interface CatalogueEntry {
  readonly id: string;
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly confidence: string;
  readonly informs: readonly string[];
  readonly stale_after: string;
  readonly staged: boolean;
}

const PREFIX = /^[A-Z]+$/;
const ID = /^([A-Z]+)-(\d{4})$/;

function where({ staged, path }: CatalogueEntry): string {
  return staged ? `staged in ${path.split('/')[2]}` : 'wiki';
}

/** `fresh until <date>` while `stale_after` is after today, `stale since <date>` from then on. */
function freshness(staleAfter: string, today: string): string {
  const date = staleAfter.slice(0, 10);
  return date > today ? `fresh until ${date}` : `stale since ${date}`;
}

/**
 * One block per Research question that informs the Concept (every one without a Concept), in the order given: a head
 * line `<id> · <confidence> · fresh until|stale since <date> · informs <ids> · wiki|staged in <slug>`, then its question,
 * its one-sentence Answer and its path. `today` is `YYYY-MM-DD`.
 */
export function researchCatalogue(
  entries: readonly CatalogueEntry[],
  { concept, today }: { readonly concept?: string; readonly today: string },
): string[] {
  return entries
    .filter(({ informs }) => concept === undefined || informs.includes(concept))
    .map((entry) =>
      [
        [
          entry.id,
          entry.confidence,
          freshness(entry.stale_after, today),
          `informs ${entry.informs.join(', ')}`,
          where(entry),
        ].join(' · '),
        `  ${entry.title}`,
        `  ${entry.description}`,
        `  ${entry.path}`,
      ].join('\n'),
    );
}

/** The next free id of a prefix: one past the highest number any id of it holds, so a retired number is never reused. */
export function nextFreeId(prefix: string, ids: readonly string[]): string {
  if (!PREFIX.test(prefix))
    throw new Error(
      `The prefix "${prefix}" is not upper-case letters, the part before the dash of a Research question id.`,
    );
  const numbers = ids.flatMap((id) => {
    const match = ID.exec(id);
    return match && match[1] === prefix ? [Number(match[2])] : [];
  });
  return `${prefix}-${String(Math.max(0, ...numbers) + 1).padStart(4, '0')}`;
}
