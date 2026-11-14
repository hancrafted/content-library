// `npm run episode:spec-template-hash`: prints the hash of what the Spec template is generated from. A regenerated
// template records it as `<meta name="spec-template-source-hash" content="…">` in its head.
import { templateHash } from '../../../src/pipeline/lib/episode-spec-template-fresh.pure.ts';
import { readTemplateSources } from '../../../src/pipeline/lib/spec-template-sources.ts';

console.log(templateHash(readTemplateSources()));
