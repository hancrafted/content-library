// A Spec review turned into the next feedback round (design-ADR 0011): the form fields the served Spec posts, the
// Spec's Title slide and Slides, the round number and the clock in, the `feedback.md` text out, or the Slides that
// break a rule: a Slide with no pick carries a note, and approve needs exactly one pick on every Slide. The server
// reads and writes; nothing here touches the disk.

import { TITLE_ANCHOR } from '../../shared/lib/title-anchor.pure.ts';
import { BRIEF_KEYS } from './episode-spec-brief.pure.ts';
import type { SpecSlide } from './episode-spec-page.pure.ts';
import { HAN_ACTOR, utcSeconds } from './staging-file.pure.ts';

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

export type ReviewResult =
  { kind: 'saved'; file: string; text: string } | { kind: 'rejected'; faults: readonly Fault[] };

/** A dictated note on one line: every run of whitespace, newlines included, becomes one space. */
function oneLine(note: string): string {
  return note.replace(/\s+/g, ' ').trim();
}

function pad(round: number): string {
  return String(round).padStart(2, '0');
}

const VISUAL_LANGUAGE = 'visual-language';
/** The general comment on the Spec as a whole, `note:page`, and the field that carries the Next action. */
const PAGE = 'page';
const NEXT = 'next';
/** What happens after the Gate; the `next` item carries one of these. */
const NEXT_ACTIONS: readonly string[] = ['redesign', 'approve'];
const FIELD = /^(pick|note):(.+)$/;
const ROUND_FOLDER = /^\d+$/;

/** The round after the highest numbered folder under `feedback/`, 1 when there is none. */
export function nextRound(folders: readonly string[]): number {
  return Math.max(0, ...folders.filter((name) => ROUND_FOLDER.test(name)).map(Number)) + 1;
}

/** One reviewed Slide: its pick field slug, its feedback anchor, its Option ids and how a fault names it. */
interface Reviewed {
  slug: string;
  anchor: string;
  options: readonly string[];
  where: string;
}

/** The Title slide first, when the Spec has one, then the page Slides in page order. */
function reviewedSlides({ slides, titleSlide }: Review): Reviewed[] {
  const title: Reviewed[] =
    titleSlide === undefined
      ? []
      : [{ slug: TITLE_ANCHOR, anchor: TITLE_ANCHOR, options: titleSlide, where: 'The Title slide' }];
  return [
    ...title,
    ...slides.map(({ section, slug, options }, index) => ({
      slug,
      anchor: `${section}--${slug}`,
      options,
      where: `Slide ${index + 1} "${slug}"`,
    })),
  ];
}

/** What the posted form says: the picks and note per field slug, and the Next action if one was posted. */
interface Posted {
  picks: (slug: string) => string[];
  note: (slug: string) => string;
  next: string | undefined;
}

/** The fault of a Slide's pick count under approve: exactly one pick on every Slide, none or several is refused. */
function approveFault({ slug, where }: Reviewed, count: number): Fault[] {
  if (count === 1) return [];
  const message =
    count === 0
      ? `${where} has no pick: pick an Option before you approve.`
      : `${where} has ${count} picks: keep exactly one before you approve.`;
  return [{ slide: slug, message }];
}

/** The faults of one reviewed Slide: an unknown Option, not exactly one pick under approve, or no pick and no note. */
function slideFaults(slide: Reviewed, { picks, note, next }: Posted): Fault[] {
  const { slug, options, where } = slide;
  const unknown = picks(slug).filter((pick) => !options.includes(pick));
  if (unknown.length > 0) return unknown.map((pick) => ({ slide: slug, message: `${where} has no Option ${pick}.` }));
  if (next === 'approve') return approveFault(slide, picks(slug).length);
  if (picks(slug).length === 0 && note(slug) === '')
    return [{ slide: slug, message: `${where} has no pick and no note: tick an Option or say what to try.` }];
  return [];
}

/** The faults that refuse the round: a Next action unknown, Slides lacking picks or notes, unknown Options, strays. */
function faultsOf(review: Review, posted: Posted): Fault[] {
  const reviewed = reviewedSlides(review);
  const known = new Set([VISUAL_LANGUAGE, PAGE, ...(review.brief ?? []), ...reviewed.map(({ slug }) => slug)]);
  const strays = [
    ...new Set(review.fields.flatMap(([name]) => FIELD.exec(name)?.[2] ?? []).filter((slug) => !known.has(slug))),
  ];
  const { next } = posted;
  return [
    ...(next === undefined || NEXT_ACTIONS.includes(next)
      ? []
      : [{ slide: NEXT, message: `The Next action "${next}" is neither redesign nor approve.` }]),
    ...reviewed.flatMap((slide) => slideFaults(slide, posted)),
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

/** The review as the next round's file and its path under the Episode folder, or every fault that refuses it. */
export function reviewToFeedback(review: Review): ReviewResult {
  const { fields, round, now } = review;
  const values = (name: string) => fields.filter(([key]) => key === name).map(([, value]) => value);
  const picks = (slug: string) => [...new Set(values(`pick:${slug}`))];
  const note = (slug: string) => oneLine(values(`note:${slug}`).join(' '));
  const next = values(NEXT).at(-1);
  const faults = faultsOf(review, { picks, note, next });
  if (faults.length > 0) return { kind: 'rejected', faults };
  const withNote = (item: string, text: string) => (text === '' ? item : `${item} — ${text}`);
  const items = reviewedSlides(review).map(({ slug, anchor }) => {
    const picked = picks(slug);
    return withNote(
      `- \`${anchor}\` · design — picked: ${picked.length === 0 ? 'none' : picked.join(', ')}`,
      note(slug),
    );
  });
  for (const key of BRIEF_KEYS.filter((key) => review.brief?.includes(key) && note(key) !== ''))
    items.push(`- \`${key}\` · design — ${note(key)}`);
  const visualLanguage = note(VISUAL_LANGUAGE);
  if (visualLanguage !== '') items.push(`- \`${VISUAL_LANGUAGE}\` · design — ${visualLanguage}`);
  if (note(PAGE) !== '') items.push(`- \`${PAGE}\` · design — ${note(PAGE)}`);
  if (next !== undefined) items.push(`- \`${NEXT}\` · gate — ${next}`);
  const text = feedbackText(round, now, items);
  return { kind: 'saved', file: `feedback/${pad(round)}/feedback.md`, text };
}
