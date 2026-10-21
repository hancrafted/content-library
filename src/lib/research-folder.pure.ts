/*
 * A research folder's name is its lasting ID, `<category>-<####>__<question-slug>`:
 * it moves unchanged from a staging folder to `docs/llm-wiki/research/<category>/`
 * at Promotion, and a person reads the subject from it. The categories are the
 * IDs GLOSSARY.md lists under `## Research categories`; the number counts per
 * category across the repo.
 */

import type { Finding } from './finding.pure';

/** One llm-wiki index line: `- [<title>](<path>) — <description>`, capturing the path and the description. */
export const INDEX_ENTRY = /^- \[[^\]]+\]\(([^)]+)\) — (.*)$/;

const CATEGORIES_HEADING = '## Research categories';
const LLM_WIKI_RESEARCH = 'docs/llm-wiki/research/';
const NAME = /^([A-Z]+)-(\d{4})__([a-z0-9]+(?:-[a-z0-9]+)*)$/;
const SLUG_LENGTH = { min: 20, max: 40 };
const FORMAT = `<category>-<####>__<question-slug, ${SLUG_LENGTH.min}-${SLUG_LENGTH.max} chars kebab-case>`;

/** Each category GLOSSARY.md defines, its ID to its name: `**<ID>**: <name>: <scope>` under its section. */
export function researchCategoryNames(glossary: string): Map<string, string> {
  const lines = glossary.split('\n');
  const start = lines.findIndex((line) => line.trim() === CATEGORIES_HEADING);
  if (start === -1) return new Map();
  const end = lines.findIndex((line, at) => at > start && line.startsWith('## '));
  return new Map(
    lines
      .slice(start + 1, end === -1 ? undefined : end)
      .map((line) => /^\*\*([A-Z]+)\*\*:\s*([^:]*)/.exec(line))
      .filter((match): match is RegExpExecArray => match !== null)
      .map((match) => [match[1], match[2].trim()] as const),
  );
}

/** The category IDs GLOSSARY.md defines, one `**<ID>**:` term each under its section. */
export function researchCategories(glossary: string): string[] {
  return [...researchCategoryNames(glossary).keys()];
}

function finding(file: string, message: string): Finding {
  return { kind: 'research-folder', file, message };
}

/** The category of a well-formed folder name, or null when the name breaks the format. */
function categoryOf(folder: string): string | null {
  const match = NAME.exec(folder.split('/').at(-1) ?? '');
  if (match === null) return null;
  const slug = match[3];
  return slug.length >= SLUG_LENGTH.min && slug.length <= SLUG_LENGTH.max ? match[1] : null;
}

/** An llm-wiki folder sits in the folder of its category: `docs/llm-wiki/research/<category>/<ID>__<slug>`. */
function checkPlace(folder: string, category: string): Finding[] {
  if (!folder.startsWith(LLM_WIKI_RESEARCH)) return [];
  const home = `${LLM_WIKI_RESEARCH}${category}/`;
  const inHome = folder.startsWith(home) && !folder.slice(home.length).includes('/');
  return inHome ? [] : [finding(folder, `${folder} sits outside its category folder: move it to ${home}.`)];
}

/** One folder's name against the format and the known categories, and an llm-wiki folder's place. */
function checkName(folder: string, categories: readonly string[]): Finding[] {
  const category = categoryOf(folder);
  if (category === null) return [finding(folder, `${folder} is no research folder name: ${FORMAT}.`)];
  if (categories.includes(category)) return checkPlace(folder, category);
  return [
    finding(
      folder,
      `${folder} names the category ${category}, which GLOSSARY.md does not list under Research categories.`,
    ),
  ];
}

/**
 * Checks research folders, repo paths, wherever they sit: each name, then
 * each ID used once. A folder listed twice (a pipeline output and the folder
 * it wrote) counts once.
 */
export function checkResearchFolders(folders: readonly string[], categories: readonly string[]): Finding[] {
  const unique = [...new Set(folders)];
  const byId = new Map<string, string[]>();
  for (const folder of unique) {
    const id = (folder.split('/').at(-1) ?? '').split('__')[0];
    byId.set(id, [...(byId.get(id) ?? []), folder]);
  }
  return [
    ...unique.flatMap((folder) => checkName(folder, categories)),
    ...[...byId]
      .filter(([, shared]) => shared.length > 1)
      .map(([id, shared]) =>
        finding(shared[0], `The research ID ${id} names ${shared.length} folders: ${shared.join(', ')}.`),
      ),
  ];
}
