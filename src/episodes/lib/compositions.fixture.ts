import { isEpisodeId, isToolingSlug } from '@/content-store/catalogue/record-routes';
import { EPISODES, TOOLING_PAGES } from './episode-registry.generated';

/*
 * For tests only: tests that walk the Episode folders or the `/episodes/` slug list hold a page's id as a string, not
 * its ref. The site reads a composition by ref, through `compositionOf` in `registry.ts`.
 */

/** The composition of the page an Episode id or tooling page's slug names; an id the registry does not hold throws. */
export function compositionAt(id: string) {
  if (isToolingSlug(id)) return TOOLING_PAGES[id];
  if (isEpisodeId(id)) return EPISODES[id];
  throw new Error(`No composition is registered for "${id}"`);
}
