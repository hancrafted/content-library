import { compositionRefusals } from './composition-refusals';
import type { Guide } from './schemas/guide.schema';

// decision: FE-013 §3
// decision: docs/decision-records/0019-resources-overview.md
export function guideRefusals(guides: readonly Guide[], compositions: readonly string[]): string[] {
  return compositionRefusals({
    noun: 'Guide',
    slugs: guides.map(({ slug }) => slug),
    compositions,
    folders: 'src/episodes/guides',
    records: 'src/content-store/guides',
  });
}
