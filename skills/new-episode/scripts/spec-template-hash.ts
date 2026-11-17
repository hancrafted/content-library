import { templateHash } from '../../../src/pipeline/lib/episode-spec-template-fresh.pure.ts';
import { readTemplateSources } from '../../../src/pipeline/lib/spec-template-sources.ts';

console.log(templateHash(readTemplateSources()));
