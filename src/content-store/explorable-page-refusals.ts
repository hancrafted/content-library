import { compositionRefusals } from './composition-refusals';
import type { ExplorablePage } from './schemas/explorable-page.schema';

// decision: FE-013 §3
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
