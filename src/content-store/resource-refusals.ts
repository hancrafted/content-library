import { duplicates } from './duplicates';
import type { Resource } from './schemas/resource.schema';

/*
 * The Resource refusals (FE-013 Decision 3, design-ADR 0019): a record and its composition folder go together, so the
 * load throws when either is alone, and when two records share a slug. Each is one sentence naming the Resource.
 */

/**
 * Why the Resource records and the composition folders `src/episodes/resources/<slug>/` disagree: each record needs a
 * folder, each folder a record.
 */
export function resourceRefusals(resources: readonly Resource[], compositions: readonly string[]): string[] {
  const slugs = resources.map(({ slug }) => slug);
  const unique = duplicates(slugs).map((slug) => `Resource ${slug}: slug is used by more than one Resource`);
  return [
    ...unique,
    ...slugs
      .filter((slug) => !compositions.includes(slug))
      .map((slug) => `Resource ${slug}: no composition folder src/episodes/resources/${slug}/ holds its Slides`),
    ...compositions
      .filter((slug) => !slugs.includes(slug))
      .map(
        (slug) =>
          `Resource ${slug}: the composition folder src/episodes/resources/${slug}/ has no record src/content-store/resources/${slug}.ts`,
      ),
  ];
}
