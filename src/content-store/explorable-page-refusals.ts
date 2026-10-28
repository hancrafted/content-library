import { compositionRefusals } from './composition-refusals';
import type { ExplorablePage } from './schemas/explorable-page.schema';

/*
 * The Explorable page refusals (FE-013 Decision 3): a record and its composition folder go together, and its slug is its
 * primary Explorable's folder slug, so the load throws when a record has no composition folder or no Explorable, when a
 * folder has no record, and when two records share a slug. Each is one sentence naming the Explorable page.
 */

/**
 * Why the Explorable page records, the composition folders `src/episodes/explorable-pages/<slug>/` and the Explorables
 * `src/explorables/<slug>/` disagree: each record needs a folder and an Explorable, each folder a record.
 */
export function explorablePageRefusals(
  pages: readonly ExplorablePage[],
  compositions: readonly string[],
  explorables: readonly string[],
): string[] {
  const slugs = pages.map(({ slug }) => slug);
  return [
    ...compositionRefusals({
      noun: 'Explorable page',
      slugs,
      compositions,
      folders: 'src/episodes/explorable-pages',
      records: 'src/content-store/explorable-pages',
    }),
    ...slugs
      .filter((slug) => !explorables.includes(slug))
      .map(
        (slug) => `Explorable page ${slug}: its slug names no Explorable, no folder src/explorables/${slug}/ exists`,
      ),
  ];
}
