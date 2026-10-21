// Promotion's research move (episode-promote step 7): every research file a Run staged moves into the llm-wiki and
// gets its index line, whether or not a Slide cites it (design-ADR-0004). Pure: the index, the glossary and the
// staged files in, the moves and the rewritten index out; `promote-research.ts` reads and writes the disk.

import { frontmatterField } from '../../../src/lib/staging-file.pure.ts';

export interface ResearchMove {
  /** The staged folder, `<category>-<####>__<question-slug>`, under the Staging's `research/`. */
  folder: string;
  /** Its path relative to `docs/llm-wiki/`. */
  to: string;
}

interface Input {
  /** `docs/llm-wiki/index.md`. */
  index: string;
  /** `GLOSSARY.md`, whose `## Research categories` names each category's heading. */
  glossary: string;
  /** Each staged research folder and its `research.md`. */
  research: Readonly<Record<string, string>>;
}

const HEADING = /^### .* \(([A-Z]+)\)$/;
const ENTRY_FOLDER = /\(research\/[A-Z]+\/([^/]+)\/research\.md\)/;

const GLOSSARY_CATEGORY = /^\*\*([A-Z]+)\*\*: ([^:]+):/;

/** Each category's heading, `### <name> (<category>)`, from the glossary's `## Research categories`. */
function headings(glossary: string): Map<string, string> {
  const section = glossary.split(/^## /m).find((part) => part.startsWith('Research categories')) ?? '';
  return new Map(
    section.split('\n').flatMap((line) => {
      const match = GLOSSARY_CATEGORY.exec(line);
      return match === null ? [] : [[match[1], `### ${match[2]} (${match[1]})`] as const];
    }),
  );
}

function categoryOf(folder: string): string {
  return folder.split('-')[0];
}

function entry(folder: string, markdown: string): string {
  const field = (key: string): string => frontmatterField(markdown, key) ?? '';
  const path = `research/${categoryOf(folder)}/${folder}/research.md`;
  return `- [${field('title')}](${path}) — ${field('description')}`;
}

function folderOf(line: string): string {
  return ENTRY_FOLDER.exec(line)?.[1] ?? '';
}

interface Section {
  heading: string;
  entries: string[];
}

/** The index split into the lines above its first category heading and one Section per category. */
function parseIndex(index: string): { preamble: string[]; sections: Map<string, Section> } {
  const lines = index.replace(/\n$/, '').split('\n');
  const firstHeading = lines.findIndex((line) => HEADING.test(line));
  const sections = new Map<string, Section>();
  let current: Section = { heading: '', entries: [] };
  for (const line of lines.slice(firstHeading)) {
    const category = HEADING.exec(line)?.[1];
    if (category !== undefined) {
      current = { heading: line, entries: [] };
      sections.set(category, current);
    } else if (line.startsWith('- ')) current.entries.push(line);
  }
  return { preamble: lines.slice(0, firstHeading), sections };
}

/** The Section a staged folder joins, opened under the glossary's heading when the index has none yet. */
function sectionFor(folder: string, sections: Map<string, Section>, named: Map<string, string>): Section {
  const category = categoryOf(folder);
  const heading = named.get(category);
  if (!sections.has(category) && heading === undefined)
    throw new Error(`${folder} has category ${category}, which GLOSSARY.md does not name under Research categories.`);
  if (!sections.has(category)) sections.set(category, { heading: heading ?? '', entries: [] });
  return sections.get(category) as Section;
}

function render(preamble: string[], sections: Map<string, Section>): string {
  const body = [...sections.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, { heading, entries }]) => {
      const sorted = [...entries].sort((a, b) => folderOf(a).localeCompare(folderOf(b)));
      return [heading, '', ...sorted].join('\n');
    });
  return `${preamble.join('\n')}\n${body.join('\n\n')}\n`;
}

/** The moves that bring every staged research folder into the llm-wiki, and the index that lists them. */
export function promoteResearch({ index, glossary, research }: Input): { moves: ResearchMove[]; index: string } {
  const { preamble, sections } = parseIndex(index);
  const named = headings(glossary);
  const held = new Set([...sections.values()].flatMap(({ entries }) => entries.map(folderOf)));
  const folders = Object.keys(research).sort();
  for (const folder of folders) {
    if (held.has(folder)) throw new Error(`${folder} is already in the llm-wiki; a refresh takes a new number.`);
    sectionFor(folder, sections, named).entries.push(entry(folder, research[folder]));
  }
  return {
    moves: folders.map((folder) => ({ folder, to: `research/${categoryOf(folder)}/${folder}` })),
    index: render(preamble, sections),
  };
}
