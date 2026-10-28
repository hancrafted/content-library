import { compositionRefusals } from './composition-refusals';
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
  return compositionRefusals({
    noun: 'Template',
    slugs: templates.map(({ slug }) => slug),
    compositions,
    folders: 'src/episodes/templates',
    records: 'src/content-store/templates',
  });
}
