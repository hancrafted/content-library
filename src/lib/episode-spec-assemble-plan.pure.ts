/*
 * What the Slide plan adds to an assembled Spec (design-ADR 0016, Pipeline and evidence rule 14): a reused Slide
 * appears once, as it is, labelled with the Slide it reuses and the Episodes holding it, with no Options and no words
 * of its own; an adapted Slide is labelled with its origin and what changes, beside the designers' Options and the
 * origin they drew; every Slide the plan holds a candidate for carries the plan field Han flips it with at the Spec
 * Gate, `plan:<slide-slug>`, valued reuse, adapt or new.
 */

import { escape } from './episode-spec-assemble-words.pure.ts';
import { FORM } from './episode-spec-slide.pure.ts';
import { SLIDE_OUTCOMES, type SlidePlanItem } from './slide-plan.pure.ts';

/** The attribute that marks a reused or an adapted Slide's article, valued by the candidate's slug. */
export const PLAN_ATTRIBUTES = { reuse: 'data-reused', adapt: 'data-adapted' } as const;

const held = (item: SlidePlanItem) => (item.heldBy.length === 0 ? 'no Episode' : item.heldBy.join(', '));

/** The label of a reused Slide: `Reused from <slug>, held by <episodes>.` */
export function reusedLabel(item: SlidePlanItem): string {
  return `Reused from ${item.slug ?? ''}, held by ${held(item)}.`;
}

/** The label of an adapted Slide: `Adapted from <slug>, held by <episodes>: <what changes>.` */
export function adaptedLabel(item: SlidePlanItem): string {
  return `Adapted from ${item.slug ?? ''}, held by ${held(item)}: ${item.changes ?? ''}`;
}

/** The article attribute a planned Slide carries, or nothing for a new one. */
export function planAttribute(item: SlidePlanItem | undefined): string {
  if (item === undefined || item.outcome === 'new') return '';
  return ` ${PLAN_ATTRIBUTES[item.outcome]}="${item.slug ?? ''}"`;
}

/** The plan field of a Slide whose item names a candidate, its current outcome selected; nothing otherwise. */
export function planField(slug: string, item: SlidePlanItem | undefined): string {
  if (item?.slug === undefined) return '';
  const options = SLIDE_OUTCOMES.map(
    (outcome) => `<option value="${outcome}"${outcome === item.outcome ? ' selected' : ''}>${outcome}</option>`,
  ).join('');
  return `<label class="spec-plan">Plan <select form="${FORM}" name="plan:${slug}" data-current="${item.outcome}">${options}</select></label>`;
}

/** The plan's label for a reused or adapted Slide, nothing for a new one. */
export function planLabel(item: SlidePlanItem | undefined): string {
  if (item === undefined || item.outcome === 'new') return '';
  const [role, text] = item.outcome === 'reuse' ? ['reused', reusedLabel(item)] : ['adapted', adaptedLabel(item)];
  return `<p class="spec-plan-label" data-spec="${role}">${escape(text)}</p>`;
}
