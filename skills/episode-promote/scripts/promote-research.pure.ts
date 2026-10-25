// Promotion's research move (episode-promote step 7): every research file a Run staged moves into the llm-wiki and
// gets its index line, whether or not a Slide cites it (design-ADR-0004). Pure: the index, the glossary, the wiki's
// folders and the staged files in, the moves and the rewritten index out; `promote-research.ts` reads and writes the
// disk. It throws, before any move, on anything it would otherwise lose or overwrite.

import { readFrontmatter } from '../../../src/lib/frontmatter.pure.ts';
import { confirmedByHan, type Confirmable } from '../../../src/lib/han-confirmation.pure.ts';
import { checkResearchFolders, INDEX_ENTRY, researchCategoryNames } from '../../../src/lib/research-folder.pure.ts';
import { readResearchPlan } from '../../../src/lib/research-plan.pure.ts';
import { informsProblems } from '../../../src/lib/research-questions.pure.ts';
import { frontmatterField } from '../../../src/lib/staging-file.pure.ts';

const WIKI_RESEARCH = 'docs/llm-wiki/research';
const HEADING = /^### .* \(([A-Z]+)\)$/;

export interface ResearchMove {
  /** The staged folder, `<category>-<####>__<question-slug>`, under the Staging's `research/`. */
  folder: string;
  /** Its path relative to `docs/llm-wiki/`. */
  to: string;
}

/** What Promotion moves and writes, once nothing is refused. */
export interface Promotion {
  moves: ResearchMove[];
  /** The wiki research folders a refresh replaces, relative to `docs/llm-wiki/`. */
  removes: string[];
  /** The staged Concepts that move to `docs/llm-wiki/concepts/<id>/`. */
  concepts: string[];
  index: string;
}

interface Section {
  heading: string;
  entries: string[];
}

export interface PromotionInput {
  /** `docs/llm-wiki/index.md`. */
  index: string;
  /** `GLOSSARY.md`, whose `## Research categories` names each category's heading. */
  glossary: string;
  /** Every research folder already on disk in the llm-wiki, as a repo path. */
  wiki: readonly string[];
  /** Each staged research folder and its `research.md`, or null when it holds none. */
  research: Readonly<Record<string, string | null>>;
  /** The Staging folder, `docs/episodes/<staging>`. */
  staging: string;
  /** The Staging's `research-plan.md`, or null when it has none. */
  plan: string | null;
  /** Every Concept id the llm-wiki holds. */
  concepts: readonly string[];
  /** Each narrower Concept the Run staged at `<staging>/concepts/<id>/concept.md`, or null when it holds none. */
  stagedConcepts: Readonly<Record<string, string | null>>;
}

function categoryOf(folder: string): string {
  return folder.split('-')[0];
}

/** The research folder an index line links to. */
function folderOf(line: string): string {
  return (INDEX_ENTRY.exec(line)?.[1] ?? '').split('/').at(-2) ?? '';
}

function entry(folder: string, markdown: string): string {
  const title = frontmatterField(markdown, 'title') ?? '';
  const description = frontmatterField(markdown, 'description') ?? '';
  return `- [${title}](research/${categoryOf(folder)}/${folder}/research.md) — ${description}`;
}

/** The index split into the lines above its first category heading and one Section per category. */
function parseIndex(index: string): { preamble: string[]; sections: Map<string, Section> } {
  const lines = index.replace(/\n$/, '').split('\n');
  const first = lines.findIndex((line) => HEADING.test(line));
  const sections = new Map<string, Section>();
  if (first === -1) return { preamble: lines, sections };
  let current: Section = { heading: '', entries: [] };
  for (const line of lines.slice(first)) {
    const category = HEADING.exec(line)?.[1];
    if (category !== undefined) {
      current = { heading: line, entries: [] };
      sections.set(category, current);
    } else if (INDEX_ENTRY.test(line)) current.entries.push(line);
    else if (line.trim() !== '') throw new Error(`index.md holds "${line}" among its categories; promote by hand.`);
  }
  return { preamble: lines.slice(0, first), sections };
}

function render(preamble: string[], sections: Map<string, Section>): string {
  const body = [...sections.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, { heading, entries }]) => {
      const sorted = [...entries].sort((a, b) => folderOf(a).localeCompare(folderOf(b)));
      return [heading, '', ...sorted].join('\n');
    });
  const top = preamble.join('\n').replace(/\n*$/, '\n\n');
  return body.length === 0 ? `${preamble.join('\n')}\n` : `${top}${body.join('\n\n')}\n`;
}

/** The staged Concepts that may move: each reads as a Concept, Han has accepted it, and the wiki lacks its id. */
function conceptProblems(input: PromotionInput): string[] {
  return Object.entries(input.stagedConcepts).flatMap(([id, markdown]) => {
    const where = `The staged Concept ${id}`;
    if (markdown === null) return [`${where} holds no concept.md.`];
    if (input.concepts.includes(id)) return [`${where} is already in the llm-wiki.`];
    const front = evidenceFront(markdown);
    if (typeof front === 'string') return [`${where}: ${front}`];
    return confirmedByHan(front)
      ? []
      : [`${where}: Han has not accepted it; add his \`verified\` entry from the Promotion Gate, or remove it.`];
  });
}

/** Every Concept a promoted question may inform: the wiki's and the Run's staged ones. */
function knownConcepts(input: PromotionInput): string[] {
  return [...input.concepts, ...Object.keys(input.stagedConcepts)];
}

/** What Promotion reads of an evidence file's frontmatter, or why it cannot. */
type EvidenceFront = Confirmable & { readonly informs: readonly string[] };

/**
 * The frontmatter Promotion decides on: who confirmed the file since it was written, and what it informs. The
 * content store checks every field against its schema in `npm run verify`; this runs under bare node, so it reads
 * only these, as YAML.
 */
function evidenceFront(markdown: string): EvidenceFront | string {
  const front = readFrontmatter(markdown);
  if ('reason' in front) return front.reason;
  const data = (front.data ?? {}) as Record<string, unknown>;
  const instant = (value: unknown) => (value instanceof Date ? value.toISOString() : String(value ?? ''));
  const generated = (data.generated ?? {}) as Record<string, unknown>;
  const verified = [data.verified ?? []]
    .flat()
    .map((entry) => (entry ?? {}) as Record<string, unknown>)
    .map(({ by, at }) => ({ by: String(by ?? ''), at: instant(at) }));
  const informs = Array.isArray(data.informs) ? data.informs.map(String) : [];
  return { generated: { at: instant(generated.at) }, verified, informs };
}

/** Why one staged research file may not move yet: Han has not confirmed it, or it informs no Concept. */
function evidenceProblems(input: PromotionInput, folder: string, markdown: string): string[] {
  const front = evidenceFront(markdown);
  if (typeof front === 'string') return [`${folder}: ${front}`];
  return [
    ...(confirmedByHan(front)
      ? []
      : [
          `${folder}: Han has not confirmed its confidence and informs; add his \`verified\` entry from the Promotion Gate.`,
        ]),
    ...informsProblems([{ id: folder, informs: front.informs }], knownConcepts(input)).map(
      ({ message }) => `${folder}: ${message}.`,
    ),
  ];
}

function idOf(folder: string): string {
  return folder.split('__')[0];
}

/** The staged folders the research plan lists as `refresh` of their own id: each replaces the wiki question. */
function refreshes(input: PromotionInput): Set<string> {
  const items = input.plan === null ? [] : readResearchPlan(input.plan);
  return new Set(
    items.flatMap((item) => (item.kind === 'refresh' && idOf(item.folder) === item.stale ? [item.folder] : [])),
  );
}

/** Every research folder the llm-wiki holds, on disk or in its index, as a repo path. */
function heldFolders(input: PromotionInput, index: Map<string, Section>): string[] {
  const listed = [...index.values()].flatMap(({ entries }) =>
    entries.map((line) => `${WIKI_RESEARCH}/${categoryOf(folderOf(line))}/${folderOf(line)}`),
  );
  return [...new Set([...input.wiki, ...listed])];
}

/** The staged folders whose id the wiki already holds while the plan lists no refresh of it: an unlisted shadow. */
function shadowProblems(input: PromotionInput, held: readonly string[], refreshed: Set<string>): string[] {
  const heldIds = new Set(held.map((path) => idOf(path.split('/').at(-1) ?? '')));
  return Object.keys(input.research)
    .filter((folder) => heldIds.has(idOf(folder)) && !refreshed.has(folder))
    .map(
      (folder) =>
        `${idOf(folder)} is in the llm-wiki, and the research plan lists no refresh of it: reuse that question, or list \`refresh: ${folder}, question <n>, refreshes ${idOf(folder)}\`.`,
    );
}

/**
 * Throws on a staged folder with no research.md, a bad name or unknown category, a question Han has not confirmed,
 * an informs that is no Concept, or an id the wiki already holds that the plan does not refresh.
 */
function refuse(input: PromotionInput, index: Map<string, Section>, refreshed: Set<string>): void {
  const empty = Object.keys(input.research).filter((folder) => input.research[folder] === null);
  const held = heldFolders(input, index);
  const stagedIds = new Set(Object.keys(input.research).map(idOf));
  const others = held.filter((path) => !stagedIds.has(idOf(path.split('/').at(-1) ?? '')));
  const staged = Object.keys(input.research).map((folder) => `${WIKI_RESEARCH}/${categoryOf(folder)}/${folder}`);
  const findings = checkResearchFolders([...others, ...staged], [...researchCategoryNames(input.glossary).keys()]);
  const problems = [
    ...empty.map((folder) => `${folder} holds no research.md.`),
    ...Object.entries(input.research).flatMap(([folder, markdown]) =>
      markdown === null ? [] : evidenceProblems(input, folder, markdown),
    ),
    ...shadowProblems(input, held, refreshed),
    ...conceptProblems(input),
    ...findings.map(({ message }) => message),
  ];
  if (problems.length > 0) throw new Error(problems.join('\n'));
}

/** The moves that bring every staged research folder and accepted Concept into the llm-wiki, and its new index. */
export function promoteResearch(input: PromotionInput): Promotion {
  const { preamble, sections } = parseIndex(input.index);
  const refreshed = refreshes(input);
  refuse(input, sections, refreshed);
  const replaced = new Set([...refreshed].map(idOf));
  const removes = heldFolders(input, sections)
    .filter((path) => replaced.has(idOf(path.split('/').at(-1) ?? '')))
    .map((path) => path.slice('docs/llm-wiki/'.length));
  for (const section of sections.values())
    section.entries = section.entries.filter((line) => !replaced.has(idOf(folderOf(line))));
  const names = researchCategoryNames(input.glossary);
  const folders = Object.keys(input.research).sort();
  for (const folder of folders) {
    const category = categoryOf(folder);
    const section = sections.get(category) ?? { heading: `### ${names.get(category)} (${category})`, entries: [] };
    sections.set(category, section);
    section.entries.push(entry(folder, input.research[folder] ?? ''));
  }
  return {
    moves: folders.map((folder) => ({ folder, to: `research/${categoryOf(folder)}/${folder}` })),
    removes,
    concepts: Object.keys(input.stagedConcepts).sort(),
    index: render(preamble, sections),
  };
}
