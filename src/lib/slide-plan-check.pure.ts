import { unless, type Finding } from './finding.pure.ts';
import { readSlidePlan, type SlidePlanItem } from './slide-plan.pure.ts';

/*
 * The Slide plan against the repository (design-ADR 0016, Pipeline and evidence rules 12, 13 and 15): each candidate
 * a page Slide some Episode or the Slide pool holds, its `held by`, `cites` and `moves from` as the pool listing gives
 * them, and an adapted Slide whose notes carry a grandfathered Source matched by a migrate research job.
 */

const NONE = 'none';

/** One Slide as the pool listing gives it (`npm run slides:pool`). */
export interface ListedSlide {
  readonly slug: string;
  /** The Episode whose own `slides/` holds it, or undefined for a pool Slide. */
  readonly owner: string | undefined;
  /** Every Episode whose Sections list it. */
  readonly heldBy: readonly string[];
  /** Every Research question its Speaker notes cite. */
  readonly cites: readonly string[];
}

/** What the plan is checked against: its Episode, every Slide the repository holds, the grandfathered Slides. */
export interface SlidePlanContext {
  /** The plan's Episode, which holds a reused Slide once the Build stage has run. */
  readonly episode: string;
  readonly slides: readonly ListedSlide[];
  /** The slugs of the Slides whose Speaker notes cite a Source of the Source baseline. */
  readonly grandfathered: readonly string[];
  /** The Staging's `research-plan.md`, when it exists. */
  readonly researchPlan: string | undefined;
}

const sameSet = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((value) => b.includes(value));

const named = (values: readonly string[]) => values.join(', ') || NONE;

/** The plan's `held by` against the listing's holders, this Episode left out: it holds the Slide once built. */
function holderProblems(item: SlidePlanItem, listed: ListedSlide, episode: string): string[] {
  const holders = listed.heldBy.filter((holder) => holder !== episode);
  return unless(
    sameSet(
      item.heldBy.filter((holder) => holder !== episode),
      holders,
    ),
    `Slide ${item.number}'s candidate ${listed.slug} is held by ${named(holders)}, not ${named(item.heldBy)}: copy \`held by\` from \`npm run slides:pool\`.`,
  );
}

/** The candidate against the listing: its holders, its citations and where it lives. */
function candidateProblems(item: SlidePlanItem, listed: ListedSlide, episode: string): string[] {
  const where = `Slide ${item.number}'s candidate ${listed.slug}`;
  const ownedElsewhere = listed.owner !== undefined && listed.owner !== episode;
  return [
    ...holderProblems(item, listed, episode),
    ...unless(
      sameSet(item.cites, listed.cites),
      `${where} cites ${named(listed.cites)}, not ${named(item.cites)}: copy \`cites\` from \`npm run slides:pool\`.`,
    ),
    ...unless(
      item.outcome === 'new' || !ownedElsewhere || item.movesFrom === listed.owner,
      `${where} lives in ${listed.owner ?? ''}'s own slides/: add \`moves from ${listed.owner ?? ''}\`, so its owner sees the move to the Slide pool.`,
    ),
  ];
}

/** An adapted Slide whose notes carry a grandfathered Source gets a migrate research job naming it. */
function migrateProblems(item: SlidePlanItem, context: SlidePlanContext): string[] {
  if (item.outcome !== 'adapt' || item.slug === undefined || !context.grandfathered.includes(item.slug)) return [];
  const slug = item.slug;
  const migrated = (context.researchPlan ?? '')
    .split('\n')
    .some((line) => new RegExp(`^[-*] migrate: [^,]+, ${slug}(,|\\.|$)`).test(line.trim()));
  return unless(
    migrated,
    `Slide ${item.number} adapts ${slug}, whose Speaker notes cite a Source of the Source baseline: the research plan needs \`migrate: <folder>, ${slug}, informs <concept-id>, …\`, so the baseline entries leave in this Run.`,
  );
}

/**
 * One finding per item whose candidate is no Slide the repository holds, or whose `held by`, `cites` or `moves from`
 * disagree with the pool listing, and per adapted Slide with grandfathered Sources and no migrate job.
 */
export function checkSlidePlan(file: string, markdown: string, context: SlidePlanContext): Finding[] {
  const messages = readSlidePlan(markdown).flatMap((item) => {
    if (item.slug === undefined) return [];
    const listed = context.slides.find(({ slug }) => slug === item.slug);
    if (listed === undefined)
      return [`Slide ${item.number} names ${item.slug}, which is no page Slide of any Episode or the Slide pool.`];
    return [...candidateProblems(item, listed, context.episode), ...migrateProblems(item, context)];
  });
  return messages.map((message): Finding => ({ kind: 'slide-plan', file, message }));
}
