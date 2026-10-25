// The pool listing (design-ADR 0016, Pipeline and evidence rule 12): every page Slide the repository holds, in each
// Episode's own `slides/` and in the Slide pool, with its title, the Concept it defines, where it lives, the Episodes
// whose Sections hold it and the Research questions its Speaker notes cite. `npm run slides:pool` prints it, so the
// slide-retrieval job reads one page and never the folders; the Slide plan check reads it to hold the plan to the
// repository. Title slides are left out: no Episode reuses another's. Reads through the view it is handed.

import type { ListedSlide } from '../src/lib/slide-plan-check.pure.ts';
import { EPISODES_DIR, importersOf, inside, isTitleSlide, SLIDE_POOL_DIR, type RepoView } from './slide-reuse.pure.ts';

/** One Slide as the listing shows it. */
export interface PoolEntry extends ListedSlide {
  readonly title: string;
  readonly defines: string | undefined;
}

const RESEARCH = /\bresearch:\s*['"]([A-Z]+-\d{4})['"]/g;

/** The Slide's `title` key in its English i18n file, or its slug when it has none. */
function titleOf(folder: string, slug: string, repo: RepoView): string {
  const file = `${folder}/i18n/en.json`;
  if (!repo.exists(file)) return slug;
  try {
    const title = (JSON.parse(repo.read(file)) as { title?: unknown }).title;
    return typeof title === 'string' ? title : slug;
  } catch {
    return slug;
  }
}

/** The Episodes with a file outside the Slide's folder that imports it. */
function holdersOf(folder: string, repo: RepoView): string[] {
  const files = repo.sourceFiles().filter((file) => inside(file, EPISODES_DIR));
  const episodes = importersOf(folder, files, repo).map((file) => file.slice(EPISODES_DIR.length + 1).split('/')[0]);
  return [...new Set(episodes)].sort();
}

/** Where a Slide folder sits: its path, its slug, and the Episode whose own `slides/` holds it, if any. */
interface Place {
  folder: string;
  slug: string;
  owner: string | undefined;
}

function entryOf({ folder, slug, owner }: Place, repo: RepoView): PoolEntry {
  const source = repo.exists(`${folder}/slide.tsx`) ? repo.read(`${folder}/slide.tsx`) : '';
  return {
    slug,
    title: titleOf(folder, slug, repo),
    defines: /\bdefines:\s*['"]([a-z0-9-]+)['"]/.exec(source)?.[1],
    owner,
    heldBy: holdersOf(folder, repo),
    cites: [...new Set([...source.matchAll(RESEARCH)].map((match) => match[1]))].sort(),
  };
}

/** Every page Slide: each Episode's own in folder order, then the pool's. */
export function listSlides(repo: RepoView): PoolEntry[] {
  const own = repo.folders(EPISODES_DIR).flatMap((episode) =>
    repo
      .folders(`${EPISODES_DIR}/${episode}/slides`)
      .filter((slug) => !isTitleSlide(episode, slug, repo))
      .map((slug) => entryOf({ folder: `${EPISODES_DIR}/${episode}/slides/${slug}`, slug, owner: episode }, repo)),
  );
  const pooled = repo
    .folders(SLIDE_POOL_DIR)
    .map((slug) => entryOf({ folder: `${SLIDE_POOL_DIR}/${slug}`, slug, owner: undefined }, repo));
  return [...own, ...pooled];
}

const listed = (values: readonly string[]) => (values.length === 0 ? 'none' : values.join(', '));

/** One line per Slide: `<slug> · "<title>"[ · defines <concept>] · in <Episode>|the Slide pool · held by … · cites …`. */
export function writeListing(entries: readonly PoolEntry[]): string {
  return entries
    .map((entry) =>
      [
        entry.slug,
        `"${entry.title}"`,
        ...(entry.defines === undefined ? [] : [`defines ${entry.defines}`]),
        entry.owner === undefined ? 'in the Slide pool' : `in ${entry.owner}`,
        `held by ${listed(entry.heldBy)}`,
        `cites ${listed(entry.cites)}`,
      ].join(' · '),
    )
    .join('\n');
}
