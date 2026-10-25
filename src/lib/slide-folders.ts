import { readdirSync } from 'node:fs';
import path from 'node:path';

/*
 * Every Slide folder the repository holds, by path and slug: each Episode's `src/components/episodes/<ep>/slides/`
 * and the Slide pool `src/components/slide-pool/` (design-ADR 0016, Slide reuse). It reads folder names and does not
 * judge: the content store decides whether two folders collide. Node only, so only the store's app wiring and the
 * tests import it.
 */

export const EPISODES_DIR = 'src/components/episodes';
export const SLIDE_POOL_DIR = 'src/components/slide-pool';

export interface SlideFolderPath {
  /** Relative to the repository root, forward slashes. */
  readonly path: string;
  /** The folder name, which is the Slide's slug. */
  readonly slug: string;
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

function slidesIn(root: string, dir: string): SlideFolderPath[] {
  return folders(path.join(root, dir)).map((slug) => ({ path: `${dir}/${slug}`, slug }));
}

/** Every Episode's Slide folders in folder order, then the Slide pool's; a missing pool is an empty one. */
export function readSlideFolders(root: string): SlideFolderPath[] {
  return [
    ...folders(path.join(root, EPISODES_DIR)).flatMap((episode) => slidesIn(root, `${EPISODES_DIR}/${episode}/slides`)),
    ...slidesIn(root, SLIDE_POOL_DIR),
  ];
}
