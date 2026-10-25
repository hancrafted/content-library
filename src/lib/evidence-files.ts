import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

/*
 * Every evidence file the repository holds, as text: each Concept at `docs/llm-wiki/concepts/<id>/concept.md`, and
 * each research file in the wiki at `docs/llm-wiki/research/<category>/<folder>/` and in each Episode's Staging at
 * `docs/episodes/<slug>/research/<folder>/`. It reads and does not judge: the content store decides what a file is
 * worth. Node only, so only the store's app wiring and the tests import it.
 */

export interface EvidenceText {
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

function filesIn(root: string, relativeDirs: readonly string[], fileName: string): EvidenceText[] {
  return relativeDirs.flatMap((dir) =>
    folders(path.join(root, dir)).flatMap((folder) => {
      const relative = `${dir}/${folder}/${fileName}`;
      try {
        return [{ path: relative, markdown: readFileSync(path.join(root, relative), 'utf8') }];
      } catch {
        return [];
      }
    }),
  );
}

/** The wiki's research files, then each Episode's staged ones, in folder order. */
export function readResearchFiles(root: string): EvidenceText[] {
  const wiki = 'docs/llm-wiki/research';
  const staged = folders(path.join(root, 'docs/episodes')).map((slug) => `docs/episodes/${slug}/research`);
  const dirs = [...folders(path.join(root, wiki)).map((category) => `${wiki}/${category}`), ...staged];
  return filesIn(root, dirs, 'research.md');
}

/** Each Episode's research plan, `docs/episodes/<slug>/research-plan.md`, where its Staging has one. */
export function readResearchPlans(root: string): EvidenceText[] {
  return folders(path.join(root, 'docs/episodes')).flatMap((slug) => {
    const relative = `docs/episodes/${slug}/research-plan.md`;
    try {
      return [{ path: relative, markdown: readFileSync(path.join(root, relative), 'utf8') }];
    } catch {
      return [];
    }
  });
}

/** The wiki's Concept files, one flat folder per Concept, in folder order. */
export function readConceptFiles(root: string): EvidenceText[] {
  return filesIn(root, ['docs/llm-wiki/concepts'], 'concept.md');
}
