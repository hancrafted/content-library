/*
 * A research folder's name is its lasting ID, `<category>-<####>__<question-slug>`:
 * it moves unchanged from a staging folder to `docs/llm-wiki/research/` at
 * Promotion, and a person reads the subject from it. The categories are the
 * IDs GLOSSARY.md lists under `## Research categories`; the number counts per
 * category across the repo.
 */

import type { Finding } from './finding.pure';

const CATEGORIES_HEADING = '## Research categories';
const NAME = /^([A-Z]+)-(\d{4})__([a-z0-9]+(?:-[a-z0-9]+)*)$/;
const SLUG_LENGTH = { min: 20, max: 40 };
const FORMAT = `<category>-<####>__<question-slug, ${SLUG_LENGTH.min}-${SLUG_LENGTH.max} chars kebab-case>`;

/** The category IDs GLOSSARY.md defines, one `**<ID>**:` term each under its section. */
export function researchCategories(glossary: string): string[] {
  const lines = glossary.split('\n');
  const start = lines.findIndex((line) => line.trim() === CATEGORIES_HEADING);
  if (start === -1) return [];
  const end = lines.findIndex((line, at) => at > start && line.startsWith('## '));
  return lines
    .slice(start + 1, end === -1 ? undefined : end)
    .map((line) => /^\*\*([A-Z]+)\*\*:/.exec(line)?.[1])
    .filter((id): id is string => id !== undefined);
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

/** One folder's name against the format and the known categories. */
function checkName(folder: string, categories: readonly string[]): Finding[] {
  const category = categoryOf(folder);
  if (category === null) return [finding(folder, `${folder} is no research folder name: ${FORMAT}.`)];
  if (categories.includes(category)) return [];
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
