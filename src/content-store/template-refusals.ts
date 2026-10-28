import { duplicates } from './duplicates';
import type { Template } from './schemas/template.schema';

/*
 * The Template refusals (FE-013 Decision 3, design-ADR 0019): a record and its composition folder go together, so the
 * load throws when either is alone, and when two records share a slug. Each is one sentence naming the Template.
 */

/**
 * Why the Template records and the composition folders `src/episodes/templates/<slug>/` disagree: each record needs a
 * folder, each folder a record.
 */
export function templateRefusals(templates: readonly Template[], compositions: readonly string[]): string[] {
  const slugs = templates.map(({ slug }) => slug);
  const unique = duplicates(slugs).map((slug) => `Template ${slug}: slug is used by more than one Template`);
  return [
    ...unique,
    ...slugs
      .filter((slug) => !compositions.includes(slug))
      .map((slug) => `Template ${slug}: no composition folder src/episodes/templates/${slug}/ holds its Slides`),
    ...compositions
      .filter((slug) => !slugs.includes(slug))
      .map(
        (slug) =>
          `Template ${slug}: the composition folder src/episodes/templates/${slug}/ has no record src/content-store/templates/${slug}.ts`,
      ),
  ];
}
