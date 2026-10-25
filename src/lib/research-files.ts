import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

/*
 * Every research file the repository holds, as text: the wiki at `docs/llm-wiki/research/<category>/<folder>/` and
 * each Episode's Staging at `docs/episodes/<slug>/research/<folder>/`. It reads and does not judge: the content
 * store decides what a file is worth. Node only, so only the store's app wiring and the tests import it.
 */

export interface ResearchFile {
  /** Relative to the repository root, forward slashes. */
  readonly path: string;
  readonly markdown: string;
}

function folders(dir: string): string[] {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

function filesIn(root: string, relativeDirs: readonly string[]): ResearchFile[] {
  return relativeDirs.flatMap((dir) =>
    folders(path.join(root, dir)).flatMap((folder) => {
      const relative = `${dir}/${folder}/research.md`;
      try {
        return [{ path: relative, markdown: readFileSync(path.join(root, relative), 'utf8') }];
      } catch {
        return [];
      }
    }),
  );
}

/** The wiki's research files, then each Episode's staged ones, in folder order. */
export function readResearchFiles(root: string): ResearchFile[] {
  const wiki = 'docs/llm-wiki/research';
  const staged = folders(path.join(root, 'docs/episodes')).map((slug) => `docs/episodes/${slug}/research`);
  return filesIn(root, [...folders(path.join(root, wiki)).map((category) => `${wiki}/${category}`), ...staged]);
}
