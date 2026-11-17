// decision: docs/adr/0004-episode-content-is-staged-then-promoted.md
import { checkResearchFolders, INDEX_ENTRY, researchCategoryNames } from './research-folder.pure.ts';
import { frontmatterField } from './staging-file.pure.ts';

const WIKI_RESEARCH = 'docs/llm-wiki/research';
const HEADING = /^### .* \(([A-Z]+)\)$/;

export interface ResearchMove {
  folder: string;
  to: string;
}

interface Section {
  heading: string;
  entries: string[];
}

export interface PromotionInput {
  index: string;
  glossary: string;
  wiki: readonly string[];
  research: Readonly<Record<string, string | null>>;
}

function categoryOf(folder: string): string {
  return folder.split('-')[0];
}

function folderOf(line: string): string {
  return (INDEX_ENTRY.exec(line)?.[1] ?? '').split('/').at(-2) ?? '';
}

function entry(folder: string, markdown: string): string {
  const title = frontmatterField(markdown, 'title') ?? '';
  const description = frontmatterField(markdown, 'description') ?? '';
  return `- [${title}](research/${categoryOf(folder)}/${folder}/research.md) — ${description}`;
}

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

export function promoteResearch(input: PromotionInput): { moves: ResearchMove[]; index: string } {
  const [researchIndex, raw] = input.index.split(/\n*(?=^## Raw$)/m);
  const { preamble, sections } = parseIndex(researchIndex);
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
    index: [render(preamble, sections), raw].filter(Boolean).join('\n'),
  };
}
