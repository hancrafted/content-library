import { compositionRefusals } from './composition-refusals';
import type { Guide } from './schemas/guide.schema';

/*
 * The Guide refusals (FE-013 Decision 3, design-ADR 0019 as amended by #450): a record and its composition folder go
 * together, so the load throws when either is alone, and when two records share a slug. Each is one sentence naming
 * the Guide.
 */

/**
 * Why the Guide records and the composition folders `src/episodes/guides/<slug>/` disagree: each record needs a folder,
 * each folder a record.
 */
export function guideRefusals(guides: readonly Guide[], compositions: readonly string[]): string[] {
  return compositionRefusals({
    noun: 'Guide',
    slugs: guides.map(({ slug }) => slug),
    compositions,
    folders: 'src/episodes/guides',
    records: 'src/content-store/guides',
  });
}
