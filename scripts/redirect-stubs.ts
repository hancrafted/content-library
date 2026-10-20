// `node scripts/redirect-stubs.ts <out dir> <stub dir> <origin>`: writes a redirect stub for every page in the
// export, for the temporary GitHub Pages deploy of the old github.io URLs. Build with the old base path first so
// the page list matches the paths that were public.
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { redirectStubHtml, redirectStubPlan } from './redirect-stubs.pure.ts';

const [outDir, stubDir, origin] = process.argv.slice(2);
if (!outDir || !stubDir || !origin) {
  console.error('usage: node scripts/redirect-stubs.ts <out dir> <stub dir> <origin>');
  process.exit(1);
}

const files = (readdirSync(outDir, { recursive: true, encoding: 'utf8' }) as string[]).filter(
  (file) => !file.startsWith('_next'),
);
const plan = redirectStubPlan(files, origin);
if (plan.length === 0) {
  console.error(`no pages found in ${outDir}; run the build first`);
  process.exit(1);
}
for (const { file, target } of plan) {
  mkdirSync(dirname(join(stubDir, file)), { recursive: true });
  writeFileSync(join(stubDir, file), redirectStubHtml(target));
}
console.log(`wrote ${plan.length} redirect stubs to ${stubDir}, targeting ${origin}`);
