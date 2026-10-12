/*
 * Cross-file checks for an Episode staging folder (design-ADR 0004): the rules
 * markdown-harness cannot see because they span two files or sit inside a
 * list item. Each check takes file text and returns findings; reading the disk
 * is the caller's job, so every rule tests against an in-memory folder.
 */

import { unless, type Finding } from './finding.pure';
import {
  blocksOf,
  bodyLines,
  frontmatterField,
  h4s,
  orderedList,
  paragraphCount,
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

function spineEntry({ level, slug }: Heading): string {
  return `h${level} {#${slug}}`;
}

function checkSpine(manuscript: readonly Heading[], dossier: readonly Heading[]): Finding[] {
  const malformed = dossier
    .filter(({ slug, text }) => slug === null && SLUG_ATTEMPT.test(text))
    .map(({ text }): Finding => ({
      kind: 'spine',
      file: 'dossier.md',
      message: `Dossier heading "${text}" has a malformed slug: a slug is lowercase letters, digits and hyphens, as {#my-slide}.`,
    }));
  const expected = manuscript.filter(({ slug }) => slug !== null).map(spineEntry);
  const actual = dossier.filter(({ slug }) => slug !== null).map(spineEntry);
  const at = expected.findIndex((entry, index) => actual[index] !== entry);
  const diverges = at !== -1 || actual.length > expected.length;
  if (!diverges) return malformed;
  const index = at === -1 ? expected.length : at;
  const departure: Finding = {
    kind: 'spine',
    file: 'dossier.md',
    message: `The Dossier spine departs from the Manuscript at heading ${index + 1}: the Manuscript has ${expected[index] ?? 'no further heading'}, the Dossier has ${actual[index] ?? 'no further heading'}. Slugged headings must match in slug, order and level.`,
  };
  return [...malformed, departure];
}

const VISUAL_LINE = /^master: (\S+) · motion: (\S+)$/;

function checkVisuals(blocks: readonly Block[], known: KnownVisuals): Finding[] {
  return h4s(blocks, 'Visual').flatMap(({ owner, body }) => {
    const first = body.find((line) => line.trim() !== '') ?? '';
    const where = `The Visual of {#${owner}}`;
    const finding = (message: string): Finding => ({ kind: 'visual', file: 'dossier.md', message });
    const match = VISUAL_LINE.exec(first);
    if (match === null)
      return [finding(`${where} must open with "master: <name> · motion: <effect>", but opens with "${first}".`)];
    const [, master, motion] = match;
    const masterNote = `${where} names master "${master}", which is neither a frame component nor a slide-master Slide.`;
    return [
      ...unless(known.masters.includes(master), finding(masterNote)),
      ...unless(
        known.motions.includes(motion),
        finding(`${where} names motion "${motion}", which is no motion effect.`),
      ),
    ];
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

function checkSegments(manuscript: readonly Block[], dossier: readonly Block[]): Finding[] {
  return h4s(dossier, 'Segments').flatMap(({ owner, body }) => {
    const heading = manuscript.find(({ heading }) => heading.slug === owner);
    if (heading === undefined) return [];
    const segments = orderedList(body).items.length;
    const paragraphs = paragraphCount(heading.body);
    if (segments === paragraphs) return [];
    const message = `{#${owner}} has ${segments} Segments items but ${paragraphs} paragraphs in the Manuscript: one segment per paragraph.`;
    return [{ kind: 'segments', file: 'dossier.md', message }];
  });
}

const FEEDBACK_FILE = /^feedback\/[^/]+\/feedback\.md$/;
const FEEDBACK_ITEM = /^- `([a-z0-9-]+--[a-z0-9-]+)` · (content|implementation|practice) — \S.*$/;

function checkFeedbackFile(file: string, markdown: string, anchors: readonly string[]): Finding[] {
  const practice = frontmatterField(markdown, 'via') === 'practice';
  const messages = bodyLines(markdown).flatMap((line) => {
    if (line.trim() === '') return [];
    const item = FEEDBACK_ITEM.exec(line);
    if (item === null) {
      const tags = practice ? 'content|implementation|practice' : 'content|implementation';
      return [`Feedback line not of the form "- \`<section>--<slide>\` · ${tags} — text": "${line}".`];
    }
    const [, anchor, tag] = item;
    return [
      ...unless(
        tag !== 'practice' || practice,
        `Feedback item "${line}" is tagged practice, which only a file with "via: practice" may use.`,
      ),
      ...unless(anchors.includes(anchor), `Feedback anchor "${anchor}" is no page slide in the Manuscript.`),
    ];
  });
  return messages.map((message): Finding => ({ kind: 'feedback', file, message }));
}

function checkFeedback(files: Readonly<Record<string, string>>, manuscript: readonly Block[]): Finding[] {
  const anchors = slideAnchors(manuscript);
  return Object.entries(files)
    .filter(([file]) => FEEDBACK_FILE.test(file))
    .flatMap(([file, markdown]) => checkFeedbackFile(file, markdown, anchors));
}

/**
 * Checks one staging folder's files against each other. `files` maps a path
 * relative to the folder (`dossier.md`, `feedback/01/feedback.md`) to its text.
 */
export function checkStagingFolder(files: Readonly<Record<string, string>>, known: KnownVisuals): Finding[] {
  const manuscript = files['manuscript.md'];
  const dossier = files['dossier.md'];
  if (manuscript === undefined || dossier === undefined) return [];
  const manuscriptBlocks = blocksOf(bodyLines(manuscript));
  const dossierBlocks = blocksOf(bodyLines(dossier));
  return [
    ...checkSpine(
      manuscriptBlocks.map(({ heading }) => heading),
      dossierBlocks.map(({ heading }) => heading),
    ),
    ...checkVisuals(dossierBlocks, known),
    ...checkSpeakerNotes(dossierBlocks),
    ...checkSegments(manuscriptBlocks, dossierBlocks),
    ...checkFeedback(files, manuscriptBlocks),
  ];
}

const INDEX_ENTRY = /^- \[[^\]]+\]\(([^)]+)\) — (.*)$/;

/**
 * Checks the llm-wiki index against its research files: one entry per file,
 * each entry's description byte-identical to the file's frontmatter
 * `description`. `research` maps a path relative to the index's folder
 * (`research/<question-slug>/research.md`) to its text. While the index does
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
export const RUNS_CSV_HEADER = 'run,episode,job,agent,attempt,result,failed_rubric,duration_s,tokens,at';

/** Checks that the runs CSV's first line is exactly {@link RUNS_CSV_HEADER}. */
export function checkRunsCsv(csv: string): Finding[] {
  const header = csv.split('\n')[0];
  if (header === RUNS_CSV_HEADER) return [];
  const message = `The runs CSV header is ${JSON.stringify(header)}; it must be exactly "${RUNS_CSV_HEADER}".`;
  return [{ kind: 'runs-header', file: 'runs.csv', message }];
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
