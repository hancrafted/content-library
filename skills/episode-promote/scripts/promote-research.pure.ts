// Promotion's research move (episode-promote step 7): every research file a Run staged moves into the llm-wiki and
// gets its index line, whether or not a Slide cites it (design-ADR-0004). Pure: the index, the glossary, the wiki's
// folders and the staged files in, the moves and the rewritten index out; `promote-research.ts` reads and writes the
// disk. It throws, before any move, on anything it would otherwise lose or overwrite.

import { checkResearchFolders, INDEX_ENTRY, researchCategoryNames } from '../../../src/lib/research-folder.pure.ts';
import { frontmatterField } from '../../../src/lib/staging-file.pure.ts';

const WIKI_RESEARCH = 'docs/llm-wiki/research';
const HEADING = /^### .* \(([A-Z]+)\)$/;

export interface ResearchMove {
  /** The staged folder, `<category>-<####>__<question-slug>`, under the Staging's `research/`. */
  folder: string;
  /** Its path relative to `docs/llm-wiki/`. */
  to: string;
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

/** Throws on a staged folder with no research.md, a bad name, an unknown category or an ID the wiki already holds. */
function refuse(input: PromotionInput, index: Map<string, Section>): void {
  const empty = Object.keys(input.research).filter((folder) => input.research[folder] === null);
  const listed = [...index.values()].flatMap(({ entries }) =>
    entries.map((line) => `${WIKI_RESEARCH}/${categoryOf(folderOf(line))}/${folderOf(line)}`),
  );
  const held = new Set([...input.wiki, ...listed]);
  const staged = Object.keys(input.research).map((folder) => `${WIKI_RESEARCH}/${categoryOf(folder)}/${folder}`);
  const findings = checkResearchFolders([...held, ...staged], [...researchCategoryNames(input.glossary).keys()]);
  const problems = [
    ...empty.map((folder) => `${folder} holds no research.md.`),
    ...staged.filter((path) => held.has(path)).map((path) => `${path.split('/').at(-1)} is already in the llm-wiki.`),
    ...findings.map(({ message }) => message),
  ];
  if (problems.length > 0) throw new Error(problems.join('\n'));
}

/** The moves that bring every staged research folder into the llm-wiki, and the index that lists them. */
export function promoteResearch(input: PromotionInput): { moves: ResearchMove[]; index: string } {
  const { preamble, sections } = parseIndex(input.index);
  refuse(input, sections);
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
    index: render(preamble, sections),
  };
}
