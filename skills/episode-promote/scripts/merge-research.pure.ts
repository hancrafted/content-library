// A duplicate merge at the Promotion Gate (design-ADR 0016, Pipeline and evidence rule 10), run only once Han has kept
// its card: the retired question's id joins the `supersedes` line of the question it merges into, every citation of
// it is re-pointed there, and its folder goes. The findings it adds are written into the kept question's Answer
// first, by hand. Pure: the files that can cite a Research question in, the writes and the folder to remove out;
// `merge-research.ts` reads and writes the disk. It throws, before any write, on a merge it cannot make safely.

export interface MergeInput {
  /** The id that retires, never reused once merged. */
  retired: string;
  /** The id the retired question merges into, the older of the two. */
  into: string;
  /** Every file that can hold a Research question or cite one, by repo path, the research files among them. */
  files: Readonly<Record<string, string>>;
}

export interface Merge {
  /** Each file the merge changes, by repo path, with its new text. */
  writes: Record<string, string>;
  /** The retired question's folder, by repo path. */
  removes: string[];
}

const WIKI = 'docs/llm-wiki/research/';
const RESEARCH_ID = /^([A-Z]+-\d{4})__/;
const SUPERSEDES = /^supersedes: \[(.*)\]$/m;

/** The research file holding an id, by its folder name. */
function researchFile(files: MergeInput['files'], id: string): string {
  const path = Object.keys(files).find(
    (each) => each.endsWith('/research.md') && RESEARCH_ID.exec(each.split('/').at(-2) ?? '')?.[1] === id,
  );
  if (path === undefined) throw new Error(`No research file holds ${id}.`);
  return path;
}

/** The ids a research file's `supersedes` line lists. */
function supersededBy(markdown: string): string[] {
  const listed = SUPERSEDES.exec(markdown)?.[1] ?? '';
  return listed
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id !== '');
}

/** The kept question's file with the retired ids added to its `supersedes` line, which opens after `informs`. */
function withSupersedes(markdown: string, ids: readonly string[]): string {
  const all = [...new Set([...supersededBy(markdown), ...ids])].sort();
  const line = `supersedes: [${all.join(', ')}]`;
  if (SUPERSEDES.test(markdown)) return markdown.replace(SUPERSEDES, line);
  return markdown.replace(/^(informs: .*)$/m, `$1\n${line}`);
}

/** The writes and the removal that merge `retired` into `into`; throws on an unknown id or a promoted `retired`. */
export function mergeResearch({ retired, into, files }: MergeInput): Merge {
  if (retired === into) throw new Error(`${retired} cannot merge into itself.`);
  const from = researchFile(files, retired);
  const to = researchFile(files, into);
  if (from.startsWith(WIKI))
    throw new Error(
      `${retired} is promoted: its page /research/${retired} is public, and retiring it would break every link to it. Merge the newer, staged question into it instead.`,
    );
  const folder = from.slice(0, -'/research.md'.length);
  const citation = new RegExp(`\\b${retired}\\b(?!__)`, 'g');
  const writes: Record<string, string> = {};
  for (const [path, text] of Object.entries(files)) {
    if (path === to || path.startsWith(`${folder}/`)) continue;
    const repointed = text.replaceAll(from, to).replace(citation, into);
    if (repointed !== text) writes[path] = repointed;
  }
  writes[to] = withSupersedes(files[to], [...supersededBy(files[from]), retired]);
  return { writes, removes: [folder] };
}
