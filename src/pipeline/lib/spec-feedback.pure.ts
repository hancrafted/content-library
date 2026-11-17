// decision: docs/decision-records/0011-episode-design-is-reviewed-as-a-static-html-spec.md
import { TITLE_ANCHOR } from '../../shared/lib/title-anchor.pure.ts';
import { SPEC_LINE_FORM, specLine, type SpecLine } from './episode-spec-feedback-line.pure.ts';
import type { SpecSlide } from './episode-spec-page.pure.ts';
import { HAN_ACTOR, utcSeconds } from './staging-file.pure.ts';

export interface Review {
  lines: string;
  slides: readonly SpecSlide[];
  brief?: readonly string[];
  titleSlide?: readonly string[];
  round: number;
  now: Date;
}

export interface Fault {
  slide: string;
  message: string;
}

export type ReviewResult =
  | { kind: 'saved'; file: string; text: string }
  | { kind: 'rejected'; faults: readonly Fault[] };

function pad(round: number): string {
  return String(round).padStart(2, '0');
}

const NEXT = 'next';
const ROUND_FOLDER = /^\d+$/;
const NEXT_LINE = /^- `next` · gate — (.*)$/;

export function nextRound(folders: readonly string[]): number {
  return Math.max(0, ...folders.filter((name) => ROUND_FOLDER.test(name)).map(Number)) + 1;
}

interface Reviewed {
  slug: string;
  anchor: string;
  options: readonly string[];
  where: string;
}

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

interface Item {
  line: string;
  item: SpecLine | undefined;
}

function unreadable(line: string): Fault {
  const next = NEXT_LINE.exec(line);
  if (next !== null) return { slide: NEXT, message: `The Next action "${next[1]}" is neither redesign nor approve.` };
  return { slide: line, message: `${SPEC_LINE_FORM}: "${line}".` };
}

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

function approveFault({ slug, where }: Reviewed, count: number): Fault[] {
  if (count === 1) return [];
  const message =
    count === 0
      ? `${where} is set to Redesign: pick an Option before you approve.`
      : `${where} has ${count} picks: keep exactly one before you approve.`;
  return [{ slide: slug, message }];
}

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
