/*
 * The line forms of a Spec review round (design-ADR 0011, `via: spec`): the one reader of what the served page's
 * formatter writes. The review server validates a posted review with it and the feedback check reads `feedback.md`
 * with it, so a line the page writes is a line the checks accept. A review has one item per page Slide, and one for
 * the Title slide whose Options carry the section slides, each with its picks (`none` meaning Redesign) and an
 * optional note; an optional `visual-language` item carrying the Visual language note alone; `brief--<heading-slug>`
 * items, one note each on a Brief card heading; and two items for the Spec as a whole: `page`, the general comment,
 * and `next`, the action after the Gate. Imports only `.ts` paths, so the new-episode scripts run it under bare node.
 */

import { TITLE_ANCHOR } from '../../shared/lib/title-anchor.pure.ts';
import { BRIEF_KEYS } from './episode-spec-brief.pure.ts';

/** One item line of a Spec review round, read: a Slide's picks, a note on a card, the general comment or the Next action. */
export type SpecLine =
  | { kind: 'slide'; anchor: string; picks: string[] }
  | { kind: 'brief'; key: string }
  | { kind: 'visual-language' }
  | { kind: 'page' }
  | { kind: 'next'; action: 'redesign' | 'approve' };

/** A Slide item: its anchor (`top`, or `<section>--<slide>`), its picks (`none` meaning Redesign) and an optional note. */
const SLIDE_ITEM = new RegExp(
  `^- \`(${TITLE_ANCHOR}|[a-z0-9-]+--[a-z0-9-]+)\` · design — picked: (none|\\d+[a-z](?:, \\d+[a-z])*)(?: — \\S.*)?$`,
);
const BRIEF_ITEM = new RegExp(`^- \`(${BRIEF_KEYS.join('|')})\` · design — \\S.*$`);
const VISUAL_LANGUAGE_ITEM = /^- `visual-language` · design — (?!picked:)\S.*$/;
const PAGE_ITEM = /^- `page` · design — (?!picked:)\S.*$/;
const NEXT_ITEM = /^- `next` · gate — (redesign|approve)$/;

/** A Slide item read, its picks split. */
function slideItem(line: string): SpecLine | undefined {
  const slide = SLIDE_ITEM.exec(line);
  if (slide === null) return undefined;
  return {
    kind: 'slide',
    anchor: slide[1] ?? '',
    picks: (slide[2] ?? '').split(', ').filter((pick) => pick !== 'none'),
  };
}

/** A note or Next action item read: a Brief heading's note, the Visual language, the general comment or the Next action. */
function otherItem(line: string): SpecLine | undefined {
  const brief = BRIEF_ITEM.exec(line);
  if (brief !== null) return { kind: 'brief', key: brief[1] ?? '' };
  const next = NEXT_ITEM.exec(line);
  if (next !== null) return { kind: 'next', action: next[1] === 'approve' ? 'approve' : 'redesign' };
  if (VISUAL_LANGUAGE_ITEM.test(line)) return { kind: 'visual-language' };
  return PAGE_ITEM.test(line) ? { kind: 'page' } : undefined;
}

/** The line as the form it has, or `undefined` when it has none of them. */
export function specLine(line: string): SpecLine | undefined {
  return otherItem(line) ?? slideItem(line);
}

/** What a line must look like, as a finding says it. */
export const SPEC_LINE_FORM =
  'Spec review line not of the form "- `<section>--<slide>` · design — picked: <option ids>|none, then an optional — note" (`top` for the Title slide) or "- `visual-language` · design — note" or "- `brief--<heading-slug>` · design — note" or "- `page` · design — note" or "- `next` · gate — redesign|approve"';
