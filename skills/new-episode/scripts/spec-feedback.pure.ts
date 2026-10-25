// A Spec review turned into the next feedback round (design-ADR 0011): the form fields the served Spec posts, the
// Spec's Title slide and Slides, the round number and the clock in, the `feedback.md` text out, or the Slides that
// break the rule that a Slide with no pick carries a note. The server reads and writes; nothing here touches the disk.

import { BRIEF_KEYS } from '../../../src/lib/episode-spec-brief.pure.ts';
import type { SpecSlide } from '../../../src/lib/episode-spec-page.pure.ts';
import { TITLE_ANCHOR } from '../../../src/lib/episode.pure.ts';
import { SLIDE_OUTCOMES, type SlideFlip, type SlideOutcome } from '../../../src/lib/slide-plan.pure.ts';
import { HAN_ACTOR, utcSeconds } from '../../../src/lib/staging-file.pure.ts';

export interface Review {
  /** The posted form fields in order, as `URLSearchParams` yields them. */
  fields: readonly (readonly [string, string])[];
  slides: readonly SpecSlide[];
  /** The Brief card's note keys the Spec carries, `brief--<heading-slug>`; none once the Brief is approved. */
  brief?: readonly string[];
  /** The Title slide's Option ids, whose sets carry the section slides; absent when the Spec has no Title slide. */
  titleSlide?: readonly string[];
  round: number;
  now: Date;
}

/** A Slide or field the round is refused for, named so the user finds it on the page. */
export interface Fault {
  slide: string;
  message: string;
}

/** A saved round: its file and text, and Han's flips of the Slide plan, which the server applies to `slide-plan.md`. */
export type ReviewResult =
  | { kind: 'saved'; file: string; text: string; flips: readonly SlideFlip[] }
  | { kind: 'rejected'; faults: readonly Fault[] };

/** A dictated note on one line: every run of whitespace, newlines included, becomes one space. */
function oneLine(note: string): string {
  return note.replace(/\s+/g, ' ').trim();
}

function pad(round: number): string {
  return String(round).padStart(2, '0');
}

const VISUAL_LANGUAGE = 'visual-language';
const FIELD = /^(pick|note|plan):(.+)$/;
const ROUND_FOLDER = /^\d+$/;

/** The round after the highest numbered folder under `feedback/`, 1 when there is none. */
export function nextRound(folders: readonly string[]): number {
  return Math.max(0, ...folders.filter((name) => ROUND_FOLDER.test(name)).map(Number)) + 1;
}

/**
 * One reviewed Slide: its pick field slug, its feedback anchor, its Option ids, how a fault names it, and for a page
 * Slide the plan names a candidate for, its number and the outcome the plan holds.
 */
interface Reviewed {
  slug: string;
  anchor: string;
  options: readonly string[];
  where: string;
  number?: number;
  plan?: string;
}

/** The Title slide first, when the Spec has one, then the page Slides in page order. */
function reviewedSlides({ slides, titleSlide }: Review): Reviewed[] {
  const title: Reviewed[] =
    titleSlide === undefined
      ? []
      : [{ slug: TITLE_ANCHOR, anchor: TITLE_ANCHOR, options: titleSlide, where: 'The Title slide' }];
  return [
    ...title,
    ...slides.map(({ section, slug, options, number, plan }, index) => ({
      slug,
      anchor: `${section}--${slug}`,
      options,
      where: `Slide ${index + 1} "${slug}"`,
      number,
      plan,
    })),
  ];
}

/** What the review read off the form for one Slide: its picks, its note and its plan field's outcome, if flipped. */
interface Fields {
  picks: (slug: string) => string[];
  note: (slug: string) => string;
  flip: (slide: Reviewed) => SlideOutcome | undefined;
}

/** A reused Slide keeps its words: it needs nothing, a note only with a flip, and a flip to adapt says what changes. */
function planFaults(slide: Reviewed, { note, flip }: Fields): Fault[] {
  const fault = (message: string): Fault[] => [{ slide: slide.slug, message: `${slide.where} ${message}` }];
  const to = flip(slide);
  if (to === 'adapt' && note(slide.slug) === '') return fault('is flipped to adapt: say in its note what changes.');
  if (slide.plan === 'reuse' && to === undefined && note(slide.slug) !== '')
    return fault('is reused and keeps its words: flip it to adapt to change it.');
  return [];
}

/** The faults that refuse the round: picks and notes for Slides the Spec lacks, unknown Options, a Slide left blank. */
function faultsOf(review: Review, fields: Fields): Fault[] {
  const { picks, note } = fields;
  const reviewed = reviewedSlides(review);
  const known = new Set([VISUAL_LANGUAGE, ...(review.brief ?? []), ...reviewed.map(({ slug }) => slug)]);
  const strays = [
    ...new Set(review.fields.flatMap(([name]) => FIELD.exec(name)?.[2] ?? []).filter((slug) => !known.has(slug))),
  ];
  return [
    ...reviewed.flatMap((slide): Fault[] => {
      const { slug, options, where } = slide;
      const planned = planFaults(slide, fields);
      if (slide.plan === 'reuse' || planned.length > 0) return planned;
      const unknown = picks(slug).filter((pick) => !options.includes(pick));
      if (unknown.length > 0)
        return unknown.map((pick) => ({ slide: slug, message: `${where} has no Option ${pick}.` }));
      if (picks(slug).length === 0 && note(slug) === '')
        return [{ slide: slug, message: `${where} has no pick and no note: tick an Option or say what to try.` }];
      return [];
    }),
    ...strays.map((slug) => ({
      slide: slug,
      message: `The Spec has no Slide "${slug}": reload the page and review again.`,
    })),
  ];
}

/** The round's file: the `feedback` rule's frontmatter, the h1 naming the round, then the items. */
function feedbackText(round: number, now: Date, items: readonly string[]): string {
  const title = `Feedback round ${round}`;
  return [
    '---',
    'type: feedback',
    `title: ${title}`,
    'generated:',
    `  by: ${HAN_ACTOR}`,
    `  at: ${utcSeconds(now)}`,
    `round: ${round}`,
    'via: spec',
    '---',
    '',
    `# ${title}`,
    '',
    ...items,
    '',
  ].join('\n');
}

function fieldsOf({ fields }: Review): Fields {
  const values = (name: string) => fields.filter(([key]) => key === name).map(([, value]) => value);
  return {
    picks: (slug) => [...new Set(values(`pick:${slug}`))],
    note: (slug) => oneLine(values(`note:${slug}`).join(' ')),
    flip: ({ slug, plan }) => {
      const to = values(`plan:${slug}`).at(-1);
      return plan !== undefined && to !== plan && SLIDE_OUTCOMES.includes(to as SlideOutcome)
        ? (to as SlideOutcome)
        : undefined;
    },
  };
}

const withNote = (item: string, text: string) => (text === '' ? item : `${item} — ${text}`);

/**
 * A Slide's items: its picks, the note beside them, and a `plan:` item when Han flipped it. A reused Slide has no pick
 * item, so its note goes with the flip; a reused Slide left as it is has none.
 */
function slideItems(slide: Reviewed, { picks, note, flip }: Fields): string[] {
  const to = flip(slide);
  const planItem = to === undefined ? [] : [`- \`${slide.anchor}\` · design — plan: ${to}`];
  if (slide.plan === 'reuse') return planItem.map((item) => withNote(item, note(slide.slug)));
  const picked = picks(slide.slug);
  const pickItem = `- \`${slide.anchor}\` · design — picked: ${picked.length === 0 ? 'none' : picked.join(', ')}`;
  return [withNote(pickItem, note(slide.slug)), ...planItem];
}

/** The review as the next round's file and its path under the Episode folder, or every fault that refuses it. */
export function reviewToFeedback(review: Review): ReviewResult {
  const { round, now } = review;
  const fields = fieldsOf(review);
  const faults = faultsOf(review, fields);
  if (faults.length > 0) return { kind: 'rejected', faults };
  const { note } = fields;
  const items = reviewedSlides(review).flatMap((slide) => slideItems(slide, fields));
  for (const key of BRIEF_KEYS.filter((key) => review.brief?.includes(key) && note(key) !== ''))
    items.push(`- \`${key}\` · design — ${note(key)}`);
  const visualLanguage = note(VISUAL_LANGUAGE);
  if (visualLanguage !== '') items.push(`- \`${VISUAL_LANGUAGE}\` · design — ${visualLanguage}`);
  const flips = reviewedSlides(review).flatMap((slide): SlideFlip[] => {
    const to = fields.flip(slide);
    return to === undefined || slide.number === undefined ? [] : [{ number: slide.number, to, note: note(slide.slug) }];
  });
  const text = feedbackText(round, now, items);
  return { kind: 'saved', file: `feedback/${pad(round)}/feedback.md`, text, flips };
}
