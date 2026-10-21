/*
 * Cross-file checks for an Episode staging folder (design-ADR 0004): the rules
 * markdown-harness cannot see because they span two files or sit inside a
 * list item. Each check takes file text and returns findings; reading the disk
 * is the caller's job, so every rule tests against an in-memory folder.
 */

import { SPEC_FILE, specSectionSlugs, specSlideAnchors } from './episode-spec-page.pure';
import { checkSpec, specStage } from './episode-spec.pure';
import { checkBrief } from './episode-staging-brief.pure';
import { checkFeedback } from './episode-staging-feedback.pure';
import { checkStagingOrder } from './episode-staging-order.pure';
import { checkTexts } from './episode-staging-texts.pure';
import { checkTitleSlide } from './episode-staging-title.pure';
import { unless, type Finding } from './finding.pure';
import { INDEX_ENTRY } from './research-folder.pure';
import { frontmatterField } from './staging-file.pure';
import {
  blocksOf,
  bodyLines,
  h4s,
  orderedList,
  sectionSlugs,
  slideAnchors,
  type Block,
  type Heading,
  type ListItem,
} from './staging-markdown.pure';

/** The names a Dossier `Visual` may use: frame components and slide-master Slides, and motion effects. */
export interface KnownVisuals {
  masters: readonly string[];
  motions: readonly string[];
}

const SLUG_ATTEMPT = /\{#[^}]*\}\s*$/;

function checkSlugs(dossier: readonly Heading[]): Finding[] {
  return dossier
    .filter(({ slug, text }) => slug === null && SLUG_ATTEMPT.test(text))
    .map(({ text }): Finding => ({
      kind: 'spine',
      file: 'dossier.md',
      message: `Dossier heading "${text}" has a malformed slug: a slug is lowercase letters, digits and hyphens, as {#my-slide}.`,
    }));
}

const VISUAL_LINE = /^master: (\S+) · motion: (\S.*)$/;
const TITLE_LINE = /^title: \S.*$/;
/** Motion entries: `none` stands alone, `local` is motion in the Slide's own folder, any other is a library motion. */
const NO_MOTION = 'none';
const LOCAL_MOTION = 'local';

function checkMotions(where: string, motion: string, known: KnownVisuals): string[] {
  const entries = motion.split(',').map((entry) => entry.trim());
  const allowed = [NO_MOTION, LOCAL_MOTION, ...known.motions];
  return [
    ...unless(entries.length === 1 || !entries.includes(NO_MOTION), `${where} lists "none" beside another motion.`),
    ...entries.flatMap((entry) => {
      return unless(
        allowed.includes(entry),
        `${where} names motion "${entry || 'empty'}", not "${NO_MOTION}", "${LOCAL_MOTION}" or a library motion.`,
      );
    }),
  ];
}

function checkVisualLines(where: string, lines: readonly string[], known: KnownVisuals): string[] {
  const [first = '', second = '', ...rest] = lines;
  const match = VISUAL_LINE.exec(first);
  if (match === null)
    return [`${where} must open with "master: <name> · motion: <motions>", but opens with "${first}".`];
  const [, master, motion] = match;
  return [
    ...unless(
      known.masters.includes(master),
      `${where} names master "${master}", which is neither a frame component nor a slide-master Slide.`,
    ),
    ...checkMotions(where, motion, known),
    ...unless(
      !second.startsWith('title:') || TITLE_LINE.test(second),
      `${where} has a title line not of the form "title: <on-screen title>": "${second}".`,
    ),
    ...rest
      .filter((line) => line.startsWith('title:'))
      .map((line) => `${where} has a title line "${line}" that is not directly after the master line.`),
  ];
}

function checkVisuals(blocks: readonly Block[], known: KnownVisuals): Finding[] {
  const pageSlides = new Set(
    blocks.filter(({ heading }) => heading.level === 3 && heading.slug !== null).map(({ heading }) => heading.slug),
  );
  return h4s(blocks, 'Visual').flatMap(({ owner, body }) => {
    const where = `The Visual of {#${owner}}`;
    const messages = pageSlides.has(owner)
      ? checkVisualLines(
          where,
          body.filter((line) => line.trim() !== ''),
          known,
        )
      : [
          `${where} does not belong: the Title slide and section slides carry no Visual, they use the kit's title and section layouts with motion: none.`,
        ];
    return messages.map((message): Finding => ({ kind: 'visual', file: 'dossier.md', message }));
  });
}

const SPEAKER_NOTE_ITEM = /^\*\*[^*]+\*\* — \S.*$/;
const SOURCE = /^sources: \[(\d+)\] \S.* — \S+$/;
const TARGET = /^target: \S.*$/;
const CITATION = /\[(\d+)\]/g;

function checkSpeakerNote(where: string, { text, nested }: ListItem): string[] {
  if (!SPEAKER_NOTE_ITEM.test(text))
    return [`${where} has an item not of the form "**header** — description [n]": "${text}".`];
  const sources = nested.flatMap((line) => SOURCE.exec(line)?.[1] ?? []);
  const unknown = nested.filter((line) => !SOURCE.test(line) && !TARGET.test(line));
  const targets = nested.filter((line) => TARGET.test(line));
  const unresolved = [...text.matchAll(CITATION)]
    .map(([citation, n]) => ({ citation, n }))
    .filter(({ n }) => !sources.includes(n));
  return [
    ...unless(sources.length > 0, `${where}: "${text}" has no nested "sources: [n] title — URL" line.`),
    ...unknown.map(
      (line) =>
        `${where}: "${text}" has a nested line that is neither "sources: [n] title — URL" nor "target:": "${line}".`,
    ),
    ...unless(targets.length <= 1, `${where}: "${text}" has more than one "target:" line.`),
    ...unresolved.map(({ citation }) => `${where}: "${text}" cites ${citation}, which resolves to no nested source.`),
  ];
}

function checkSpeakerNotes(blocks: readonly Block[]): Finding[] {
  return h4s(blocks, 'Speaker notes').flatMap(({ owner, body }) => {
    const where = `The Speaker notes of {#${owner}}`;
    const { items, strays } = orderedList(body);
    const messages = [
      ...strays.map((line) => `${where} hold a line outside the ordered list: "${line}".`),
      ...items.flatMap((item) => checkSpeakerNote(where, item)),
    ];
    return messages.map((message): Finding => ({ kind: 'speaker-note', file: 'dossier.md', message }));
  });
}

/**
 * Checks one staging folder's files against each other. `files` maps a path
 * relative to the folder (`dossier.md`, `feedback/01/feedback.md`) to its text;
 * `reviewAsset` is the shared review asset a Spec page must inline.
 */
export function checkStagingFolder(
  files: Readonly<Record<string, string>>,
  known: KnownVisuals,
  reviewAsset: string,
): Finding[] {
  return [
    ...checkStagingOrder(files),
    ...checkTexts(files),
    ...checkBrief(files),
    ...checkDossier(files, known),
    ...checkSpec(files, reviewAsset, specStage(files[SPEC_FILE] ?? '')),
    ...checkFeedbackRounds(files),
  ];
}

/**
 * The feedback rounds, keyed by the Dossier's Sections and page Slides while it exists and by the Spec's once its
 * Gate deleted the Dossier; none before either exists.
 */
function checkFeedbackRounds(files: Readonly<Record<string, string>>): Finding[] {
  const dossier = files['dossier.md'];
  const spec = files[SPEC_FILE];
  if (dossier !== undefined) {
    const blocks = blocksOf(bodyLines(dossier));
    return checkFeedback(files, { anchors: slideAnchors(blocks), sections: sectionSlugs(blocks), source: 'Dossier' });
  }
  if (spec !== undefined)
    return checkFeedback(files, { anchors: specSlideAnchors(spec), sections: specSectionSlugs(spec), source: 'Spec' });
  return [];
}

/** The checks that read the Dossier; none until it exists. */
function checkDossier(files: Readonly<Record<string, string>>, known: KnownVisuals): Finding[] {
  const dossier = files['dossier.md'];
  if (dossier === undefined) return [];
  const dossierBlocks = blocksOf(bodyLines(dossier));
  return [
    ...checkSlugs(dossierBlocks.map(({ heading }) => heading)),
    ...checkTitleSlide(dossierBlocks),
    ...checkVisuals(dossierBlocks, known),
    ...checkSpeakerNotes(dossierBlocks),
  ];
}

/**
 * Checks the llm-wiki index against its research files: one entry per file,
 * each entry's description byte-identical to the file's frontmatter
 * `description`. `research` maps a path relative to the index's folder
 * (`research/<category>/<ID>__<question-slug>/research.md`) to its text. While the index does
 * not exist (`undefined`), there is nothing to check.
 */
export function checkResearchIndex(index: string | undefined, research: Readonly<Record<string, string>>): Finding[] {
  if (index === undefined) return [];
  const entries = index.split('\n').flatMap((line) => {
    const match = INDEX_ENTRY.exec(line);
    return match === null ? [] : [{ file: match[1], description: match[2] }];
  });
  const finding = (file: string, message: string): Finding => ({ kind: 'research-index', file, message });
  const perFile = Object.entries(research).flatMap(([file, markdown]) => {
    const listed = entries.filter((entry) => entry.file === file);
    if (listed.length === 0) return [finding(file, `The llm-wiki index has no entry for ${file}.`)];
    if (listed.length > 1)
      return [finding(file, `The llm-wiki index lists ${file} ${listed.length} times; list it once.`)];
    const description = frontmatterField(markdown, 'description');
    const drift = `The llm-wiki index describes ${file} as "${listed[0].description}", but its frontmatter description is "${description}". Copy it byte for byte.`;
    return unless(listed[0].description === description, finding(file, drift));
  });
  const dangling = entries
    .filter(({ file }) => !Object.hasOwn(research, file))
    .map(({ file }) => finding(file, `The llm-wiki index lists ${file}, which is no research file.`));
  return [...perFile, ...dangling];
}

/** The header row of `docs/episodes/runs.csv`, one row per agent run below it. */
export const RUNS_CSV_HEADER =
  'run,episode,job,agent,attempt,result,failed_rubric,duration_s,tokens,cache_read_tokens,at';

/** Checks that the runs CSV's first line is exactly {@link RUNS_CSV_HEADER}. */
export function checkRunsCsv(csv: string): Finding[] {
  const header = csv.split('\n')[0];
  if (header === RUNS_CSV_HEADER) return [];
  const message = `The runs CSV header is ${JSON.stringify(header)}; it must be exactly "${RUNS_CSV_HEADER}".`;
  return [{ kind: 'runs-header', file: 'runs.csv', message }];
}
