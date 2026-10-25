/*
 * What the Slides of an assembled Spec are drawn from (design-ADR 0011): the designers' fragments by Slide slug, the
 * picks Han locked in the feedback rounds, and the Slide plan's items by Slide number.
 */

import { fragmentSlides } from './episode-spec-fragment.pure.ts';
import { readSlidePlan, type SlidePlanItem } from './slide-plan.pure.ts';

export interface Parts {
  fragments: Map<string, string>;
  locks: Map<string, string>;
  plan: Map<number, SlidePlanItem>;
}

/** The picks that lock a Slide: its latest feedback item with exactly one pick, by Slide slug. */
const PICK_LINE = /^- `([a-z0-9-]+(?:--[a-z0-9-]+)?)` · design — picked: (none|\d+[a-z](?:, \d+[a-z])*)/;

/** A feedback line's Slide slug and the Options it picked, none for a line of another form. */
function pickOf(line: string): { slug: string; picks: string[] } | undefined {
  const item = PICK_LINE.exec(line);
  if (item === null) return undefined;
  return {
    slug: (item[1] ?? '').split('--').at(-1) ?? '',
    picks: (item[2] ?? '').split(', ').filter((pick) => pick !== 'none'),
  };
}

function locksOf(rounds: readonly string[]): Map<string, string> {
  const locks = new Map<string, string>();
  const picked = rounds.flatMap((round) => round.split('\n').flatMap((line) => pickOf(line) ?? []));
  for (const { slug, picks } of picked) {
    if (picks.length === 1) locks.set(slug, picks[0] ?? '');
    else locks.delete(slug);
  }
  return locks;
}

/** The parts of a page, from the fragment files, the feedback rounds and the Slide plan the assembly is handed. */
export function partsOf(inputs: {
  fragments?: readonly string[];
  feedback?: readonly string[];
  slidePlan?: string;
}): Parts {
  const fragments = new Map(
    (inputs.fragments ?? []).flatMap((file) =>
      fragmentSlides(file).map(({ slug, html }) => [slug, html.trim()] as const),
    ),
  );
  const plan = new Map(readSlidePlan(inputs.slidePlan ?? '').map((item) => [item.number, item] as const));
  return { fragments, locks: locksOf(inputs.feedback ?? []), plan };
}
