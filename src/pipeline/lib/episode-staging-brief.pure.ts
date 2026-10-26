/*
 * The Brief's checks (design-ADR 0004) beyond markdown-harness: its spine,
 * the `## Slides` Han settles in the Brief grill and write-dossier keeps,
 * read inside each list item and across to the Dossier and the event log's notes; and
 * the headings the grill left `Not settled.`.
 */

import { type Finding } from './finding.pure';
import { fold, parseLog } from './run-log-fold.pure';
import { blocksOf, bodyLines, orderedList, type Block } from './staging-markdown.pure';

/** One page Slide of the Brief's spine. */
interface BriefSlide {
  /** The Section's h3 title. */
  section: string;
  /** The item text as written, for messages. */
  text: string;
  /** The bold title, or null when the item is not of the Slide entry's shape. */
  title: string | null;
  /** The research question numbers after `_Research:_`, none when the item names none. */
  research: number[];
  /** The leading `(A)` or `(B)`, or null for an untagged item. */
  thread: string | null;
}

/**
 * `(A) **title** — purpose. _Visual:_ idea. _Research:_ 1, 2`, the tag and
 * research optional. A title holds no `{`, so a Dossier `{#slug}` stays out.
 */
const SLIDE_ITEM = /^(?:\([AB]\) )?\*\*([^*{}]+)\*\* — \S.*_Visual:_ \S.*$/;
/** Read apart from the shape, so a malformed item still counts as citing its questions. */
const RESEARCH = / _Research:_ ([\d, ]+)$/;
const THREAD_TAG = /^\(([AB])\) /;
const THREADS = ['A', 'B'];

/**
 * With Threads, the spine tells both in turns, so each tag appears at least
 * once; without them, no Slide carries a tag.
 */
function checkThreads(slides: readonly BriefSlide[], hasThreads: boolean): Finding[] {
  if (!hasThreads) {
    return slides
      .filter(({ thread }) => thread !== null)
      .map(({ text }): Finding => ({
        kind: 'brief-thread',
        file: 'brief.md',
        message: `Brief Slide "${text}" is tagged with a Thread, but the Brief has no Threads: drop the tag, or settle the Threads.`,
      }));
  }
  const tagged = new Set(slides.map(({ thread }) => thread));
  return THREADS.filter((thread) => !tagged.has(thread)).map((thread): Finding => ({
    kind: 'brief-thread',
    file: 'brief.md',
    message: `The Brief has Threads, but no Slide is tagged (${thread}): tag each Slide with the Thread it tells, so both alternate.`,
  }));
}

/** The h3 blocks under `## Slides`, up to the next h2. */
function sectionBlocks(blocks: readonly Block[]): Block[] {
  const start = blocks.findIndex(({ heading }) => heading.level === 2 && heading.text === 'Slides');
  if (start === -1) return [];
  const end = blocks.findIndex(({ heading }, index) => index > start && heading.level <= 2);
  return blocks.slice(start + 1, end === -1 ? blocks.length : end).filter(({ heading }) => heading.level === 3);
}

function briefSlides(blocks: readonly Block[]): BriefSlide[] {
  return sectionBlocks(blocks).flatMap(({ heading, body }) =>
    orderedList(body).items.map(({ text }) => {
      const numbers = RESEARCH.exec(text)?.[1] ?? '';
      const research = numbers.split(',').flatMap((n) => (n.trim() === '' ? [] : [Number(n)]));
      const thread = THREAD_TAG.exec(text)?.[1] ?? null;
      const title = SLIDE_ITEM.exec(text)?.[1] ?? null;
      return { section: heading.text, text, title, research, thread };
    }),
  );
}

/** How many ordered items sit under `## Research questions`. */
function researchQuestions(blocks: readonly Block[]): number {
  const block = blocks.find(({ heading }) => heading.level === 2 && heading.text === 'Research questions');
  return block === undefined ? 0 : orderedList(block.body).items.length;
}

function checkResearch(slides: readonly BriefSlide[], questions: number): Finding[] {
  const cited = new Set(slides.flatMap(({ research }) => research));
  const uncited = Array.from({ length: questions }, (_, index) => index + 1)
    .filter((n) => !cited.has(n))
    .map((n): Finding => ({
      kind: 'brief-research',
      file: 'brief.md',
      message: `Research question ${n} is cited by no Brief Slide: name it after "_Research:_" on the Slide whose claim needs it, or cut the question.`,
    }));
  return [...unknownResearch(slides, questions), ...uncited];
}

function unknownResearch(slides: readonly BriefSlide[], questions: number): Finding[] {
  return slides.flatMap(({ text, research }) =>
    research
      .filter((n) => !Number.isInteger(n) || n < 1 || n > questions)
      .map((n): Finding => ({
        kind: 'brief-research',
        file: 'brief.md',
        message: `Brief Slide "${text}" names research question "${n}", but the Brief has ${questions}.`,
      })),
  );
}

function checkShapes(slides: readonly BriefSlide[]): Finding[] {
  return slides
    .filter(({ title }) => title === null)
    .map(({ section, text }): Finding => ({
      kind: 'brief-slide',
      file: 'brief.md',
      message: `Brief Slide "${text}" in Section "${section}" is not of the form "**<title>** — <purpose>. _Visual:_ <idea>", with an optional "_Research:_ <n, m>" at the end and no "{#slug}" in the title.`,
    }));
}

const SLUG = / \{#[a-z0-9-]+\}$/;

/** The Dossier's page Slide titles, in order, without their `{#slug}`. */
function dossierTitles(dossier: string): string[] {
  return blocksOf(bodyLines(dossier))
    .filter(({ heading }) => heading.level === 3 && heading.slug !== null)
    .map(({ heading }) => heading.text.replace(SLUG, ''));
}

const SPINE_CHANGE = /^(.+?) — \S/;

/** The titles named by `spine-change` notes the event log holds for write-dossier, each `<Slide title> — <why>`. */
function spineChanges(events: string | undefined): string[] {
  if (events === undefined) return [];
  const { spans } = fold(parseLog(events).lines, {});
  return spans
    .filter((span) => span.job === 'write-dossier')
    .flatMap((span) => span.events ?? [])
    .flatMap(({ attributes }) =>
      'note.type' in attributes && attributes['note.type'] === 'spine-change' ? [attributes['note.text']] : [],
    )
    .flatMap((text) => SPINE_CHANGE.exec(text)?.[1] ?? []);
}

function longest(runs: readonly number[][]): number[] {
  return runs.reduce<number[]>((best, run) => (run.length > best.length ? run : best), []);
}

/**
 * The titles both lists hold that the Dossier took out of the Brief's order:
 * every common title outside a longest run the two lists share in order.
 */
function movedTitles(planned: readonly string[], kept: readonly string[]): string[] {
  const common = kept.filter((title) => planned.includes(title));
  const rank = common.map((title) => planned.indexOf(title));
  // runs[i] is the longest in-order run of positions in `common` that ends at i.
  const runs = rank.reduce<number[][]>(
    (done, value, index) => [...done, [...longest(done.filter((_, at) => rank[at] < value)), index]],
    [],
  );
  const inOrder = new Set(longest(runs));
  return common.filter((_, index) => !inOrder.has(index));
}

function spineFinding(message: string): Finding {
  return { kind: 'brief-spine', file: 'dossier.md', message };
}

/**
 * write-dossier keeps the Brief's spine: the Brief's Slide titles and the
 * Dossier's page Slide titles are the same list, except the titles a
 * `spine-change` note on write-dossier names.
 */
function checkSpine(slides: readonly BriefSlide[], dossier: string | undefined, events: string | undefined): Finding[] {
  if (dossier === undefined) return [];
  const planned = slides.flatMap(({ title }) => title ?? []);
  const kept = dossierTitles(dossier);
  const changed = spineChanges(events);
  const unlogged = (title: string): boolean => !changed.includes(title);
  const why = (title: string): string => `record \`note write-dossier spine-change "${title} — <why>"\``;
  return [
    ...planned
      .filter((title) => !kept.includes(title) && unlogged(title))
      .map((title) =>
        spineFinding(`Brief Slide "${title}" is no Dossier page Slide: keep its title as an h3, or ${why(title)}.`),
      ),
    ...kept
      .filter((title) => !planned.includes(title) && unlogged(title))
      .map((title) =>
        spineFinding(`Dossier page Slide "${title}" is no Brief Slide: take the Brief's title, or ${why(title)}.`),
      ),
    ...movedTitles(planned, kept)
      .filter(unlogged)
      .map((title) =>
        spineFinding(`Dossier page Slide "${title}" leaves the Brief's order: put it back, or ${why(title)}.`),
      ),
  ];
}

/**
 * Checks a staging folder's Brief beyond markdown-harness: its Slide entries,
 * their research numbers and Thread tags, and the Dossier's hold on the spine.
 * `files` maps a path relative to the
 * folder (`brief.md`, `dossier.md`, `events.jsonl`) to its text; without a
 * Brief there is nothing to check.
 */
export function checkBrief(files: Readonly<Record<string, string>>): Finding[] {
  const brief = files['brief.md'];
  if (brief === undefined) return [];
  const blocks = blocksOf(bodyLines(brief));
  const slides = briefSlides(blocks);
  const hasThreads = blocks.some(({ heading }) => heading.level === 2 && heading.text === 'Threads');
  return [
    ...checkShapes(slides),
    ...checkResearch(slides, researchQuestions(blocks)),
    ...checkThreads(slides, hasThreads),
    ...checkSpine(slides, files['dossier.md'], files['events.jsonl']),
  ];
}

const NOT_SETTLED = 'Not settled.';
/**
 * The Brief headings whose body is only `Not settled.`, the marker the Brief
 * grill writes when time runs out. markdown-harness accepts it as prose, so
 * the orchestrator asks this before it starts on a Brief.
 */
export function unsettledBriefSections(brief: string): string[] {
  return blocksOf(bodyLines(brief))
    .filter(({ body }) => {
      const text = body.filter((line) => line.trim() !== '');
      return text.length === 1 && text[0].trim() === NOT_SETTLED;
    })
    .map(({ heading }) => heading.text);
}
