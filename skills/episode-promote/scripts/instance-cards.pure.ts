// The Promotion Gate's instance cards (design-ADR 0016, Slide reuse rule 4): one card per instance the Episode holds,
// for Han to decide whether it updates the shared Slide it was copied from or becomes a Slide of its own. The card
// names every Episode an update changes and warns when the shared Slide changed since the copy, which Han reconciles
// by hand. `harvest-report.ts` adds them as their own section; a decided card is applied with
// `npm run slides:promote` (episode-promote step 7). Pure: the instances in, the section out.

import type { Card, Section } from './harvest-report.pure.ts';

/** One instance of the Episode, as the Gate shows it. */
export interface InstanceFacts {
  readonly slug: string;
  /** Its folder, by repo path. */
  readonly folder: string;
  /** The pool Slide it was copied from. */
  readonly origin: string;
  /** Every Episode an update changes the shared Slide in, its own among them. */
  readonly affected: readonly string[];
  /** The commits, or uncommitted work, that changed the pool Slide since the copy. */
  readonly poolChanges: readonly string[];
}

/** `a`, `a and b`, `a, b and c`. */
function listed(items: readonly string[]): string {
  return items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

function changesSince(poolChanges: readonly string[]): string[] {
  return poolChanges.length === 0 ? [] : [`Changed since the copy: ${poolChanges.join('; ')}.`];
}

function card({ slug, folder, origin, affected, poolChanges }: InstanceFacts, at: number): Card {
  const adapted = `The Run adapted the shared Slide "${origin}" for this Episode and edited the copy.`;
  const warning =
    poolChanges.length === 0
      ? ''
      : ` The shared Slide changed since the copy (${poolChanges.length} change(s), named under evidence): carry them into the copy by hand before an update, then add --reconciled.`;
  return {
    id: `I${at + 1}`,
    title: `Make "${slug}" the shared Slide "${origin}", or keep it as a Slide of its own.`,
    ...(poolChanges.length > 0 && { weight: 'weak' as const }),
    changes: folder,
    happened: `${adapted}${warning}`,
    change: `Keep the card to update the shared Slide: npm run slides:promote -- ${slug} --update. Strike it to keep the copy as a Slide of its own: npm run slides:promote -- ${slug} --own.`,
    gain: "Every Slide has one home, and this Episode's links keep working either way.",
    before: { kind: 'stack', items: [{ label: origin }, { label: slug }] },
    after: { kind: 'stack', items: [{ label: `${origin}, changed in ${listed(affected)}` }] },
    // Commit subjects stay out of the fields the report checks for plain words: a subject may name a rule id.
    evidence: [`An update changes the shared Slide in: ${affected.join(', ')}.`, ...changesSince(poolChanges)].join(
      ' ',
    ),
  };
}

/** The Harvest report's instance section: a card per instance, in the order given. */
export function instanceSection(instances: readonly InstanceFacts[]): Section {
  return {
    key: 'instances',
    title: 'Adapted Slides',
    target: 'npm run slides:promote, once per card',
    cards: instances.map(card),
  };
}
