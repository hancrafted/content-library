import { compositionRefusals } from './composition-refusals';
import type { Template } from './schemas/template.schema';

// decision: FE-013 §3
// decision: docs/adr/0019-resources-overview.md
export function templateRefusals(templates: readonly Template[], compositions: readonly string[]): string[] {
  return compositionRefusals({
    noun: 'Template',
    slugs: templates.map(({ slug }) => slug),
    compositions,
    folders: 'src/episodes/templates',
    records: 'src/content-store/templates',
  });
}
