// A Spec review turned into the next feedback round (design-ADR 0011): the form fields the served Spec posts, the
// Spec's Slides, the round number and the clock in, the `feedback.md` text out, or the Slides that break the rule
// that a Slide with no pick carries a note. The server reads and writes; nothing here touches the disk.

import { HAN_ACTOR } from '../../../src/lib/staging-file.pure.ts';

/** One Slide of the Spec: the Section it sits in, its slug and its Option ids in page order. */
export interface SpecSlide {
  section: string;
  slug: string;
  options: readonly string[];
}

export interface Review {
  /** The posted form fields in order, as `URLSearchParams` yields them. */
  fields: readonly (readonly [string, string])[];
  slides: readonly SpecSlide[];
  round: number;
  now: Date;
}

/** A Slide or field the round is refused for, named so Han finds it on the page. */
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
const FIELD = /^(pick|note):(.+)$/;
const ROUND_FOLDER = /^\d+$/;

/** The round after the highest numbered folder under `feedback/`, 1 when there is none. */
export function nextRound(folders: readonly string[]): number {
  return Math.max(0, ...folders.filter((name) => ROUND_FOLDER.test(name)).map(Number)) + 1;
}

/** The faults that refuse the round: picks and notes for Slides the Spec lacks, unknown Options, a Slide left blank. */
function faultsOf(review: Review, picks: (slug: string) => string[], note: (slug: string) => string): Fault[] {
  const known = new Set([VISUAL_LANGUAGE, ...review.slides.map(({ slug }) => slug)]);
  const strays = [
    ...new Set(review.fields.flatMap(([name]) => FIELD.exec(name)?.[2] ?? []).filter((slug) => !known.has(slug))),
  ];
  return [
    ...review.slides.flatMap(({ slug, options }, index): Fault[] => {
      const where = `Slide ${index + 1} "${slug}"`;
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
    `  at: ${now.toISOString().replace(/\.\d+Z$/, 'Z')}`,
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
  const { fields, slides, round, now } = review;
  const values = (name: string) => fields.filter(([key]) => key === name).map(([, value]) => value);
  const picks = (slug: string) => [...new Set(values(`pick:${slug}`))];
  const note = (slug: string) => oneLine(values(`note:${slug}`).join(' '));
  const faults = faultsOf(review, picks, note);
  if (faults.length > 0) return { kind: 'rejected', faults };
  const withNote = (item: string, text: string) => (text === '' ? item : `${item} — ${text}`);
  const items = slides.map(({ section, slug }) => {
    const picked = picks(slug);
    return withNote(
      `- \`${section}--${slug}\` · design — picked: ${picked.length === 0 ? 'none' : picked.join(', ')}`,
      note(slug),
    );
  });
  const visualLanguage = note(VISUAL_LANGUAGE);
  if (visualLanguage !== '') items.push(`- \`${VISUAL_LANGUAGE}\` · design — ${visualLanguage}`);
  const text = feedbackText(round, now, items);
  return { kind: 'saved', file: `feedback/${pad(round)}/feedback.md`, text };
}
