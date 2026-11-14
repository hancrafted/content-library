// A Spec review turned into the next feedback round (design-ADR 0011): the feedback lines the served Spec posts (its
// page script is the one formatter), the Spec's Title slide and Slides, the round number and the clock in, the
// `feedback.md` text out, or the Slides and lines that break a rule: approve needs exactly one pick on every Slide. A
// Slide with no pick is set to Redesign, and a note is optional everywhere. The server reads and writes; nothing
// here touches the disk.

import { TITLE_ANCHOR } from '../../shared/lib/title-anchor.pure.ts';
import { SPEC_LINE_FORM, specLine, type SpecLine } from './episode-spec-feedback-line.pure.ts';
import type { SpecSlide } from './episode-spec-page.pure.ts';
import { HAN_ACTOR, utcSeconds } from './staging-file.pure.ts';

export interface Review {
  /** The feedback lines the page posted, one item per line, as its own formatter wrote them. */
  lines: string;
  slides: readonly SpecSlide[];
  /** The Brief card's note keys the Spec carries, `brief--<heading-slug>`; none once the Brief is approved. */
  brief?: readonly string[];
  /** The Title slide's Option ids, whose sets carry the section slides; absent when the Spec has no Title slide. */
  titleSlide?: readonly string[];
  round: number;
  now: Date;
}

/** A Slide or line the round is refused for, named so the user finds it on the page. */
export interface Fault {
  slide: string;
  message: string;
}

export type ReviewResult =
  { kind: 'saved'; file: string; text: string } | { kind: 'rejected'; faults: readonly Fault[] };

function pad(round: number): string {
  return String(round).padStart(2, '0');
}

const NEXT = 'next';
const ROUND_FOLDER = /^\d+$/;
/** A Next action line, whatever its action, so one that names a third action is told apart from a garbled line. */
const NEXT_LINE = /^- `next` · gate — (.*)$/;

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

/** A posted line and the form it has, `undefined` for a line that has none of them. */
interface Item {
  line: string;
  item: SpecLine | undefined;
}

/** The fault of a line that has no feedback form: a Next action naming a third action, else any other line. */
function unreadable(line: string): Fault {
  const next = NEXT_LINE.exec(line);
  if (next !== null) return { slide: NEXT, message: `The Next action "${next[1]}" is neither redesign nor approve.` };
  return { slide: line, message: `${SPEC_LINE_FORM}: "${line}".` };
}

/** The faults of one line against the Spec: a Slide, Option or Brief note it does not have. */
function lineFaults({ line, item }: Item, reviewed: readonly Reviewed[], review: Review): Fault[] {
  if (item === undefined) return [unreadable(line)];
  if (item.kind === 'brief' && !review.brief?.includes(item.key))
    return [{ slide: item.key, message: `The Spec has no note "${item.key}": reload the page and review again.` }];
  if (item.kind !== 'slide') return [];
  const slide = reviewed.find(({ anchor }) => anchor === item.anchor);
  if (slide === undefined)
    return [
      { slide: item.anchor, message: `The Spec has no Slide "${item.anchor}": reload the page and review again.` },
    ];
  return item.picks
    .filter((pick) => !slide.options.includes(pick))
    .map((pick) => ({ slide: slide.slug, message: `${slide.where} has no Option ${pick}.` }));
}

/** The fault of a Slide's pick count under approve: exactly one pick on every Slide, Redesign or several is refused. */
function approveFault({ slug, where }: Reviewed, count: number): Fault[] {
  if (count === 1) return [];
  const message =
    count === 0
      ? `${where} is set to Redesign: pick an Option before you approve.`
      : `${where} has ${count} picks: keep exactly one before you approve.`;
  return [{ slide: slug, message }];
}

/** The faults that refuse the round: lines with no form, Slides, Options or notes the Spec lacks, picks under approve. */
function faultsOf(items: readonly Item[], review: Review): Fault[] {
  const reviewed = reviewedSlides(review);
  const parsed = items.flatMap(({ item }) => item ?? []);
  const approving = parsed.filter((item) => item.kind === NEXT).at(-1)?.action === 'approve';
  const picksOf = (anchor: string) =>
    parsed.flatMap((item) => (item.kind === 'slide' && item.anchor === anchor ? [item.picks.length] : []));
  return [
    ...items.flatMap((item) => lineFaults(item, reviewed, review)),
    ...(approving ? reviewed.flatMap((slide) => approveFault(slide, picksOf(slide.anchor)[0] ?? 0)) : []),
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
  const lines = review.lines
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== '');
  if (lines.length === 0)
    return {
      kind: 'rejected',
      faults: [
        {
          slide: 'feedback',
          message: 'The review carries no feedback lines: reload the page and save again (the page needs its script).',
        },
      ],
    };
  const items = lines.map((line): Item => ({ line, item: specLine(line) }));
  const faults = faultsOf(items, review);
  if (faults.length > 0) return { kind: 'rejected', faults };
  const text = feedbackText(review.round, review.now, lines);
  return { kind: 'saved', file: `feedback/${pad(review.round)}/feedback.md`, text };
}
