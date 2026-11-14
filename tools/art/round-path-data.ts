// `npm run art:round -- [--decimals <n>] <file>…`: rounds the coordinates of every quoted SVG path string in the
// given files (Scene art JSON, facet modules, art components) in place, to integers unless `--decimals` says
// otherwise, then formats each as Prettier would, since shorter strings rewrap. What counts as a path string:
// round-path-data.pure.ts.
import { readFileSync, writeFileSync } from 'node:fs';
import { format, resolveConfig } from 'prettier';
import { roundPathData } from './round-path-data.pure.ts';

const args = process.argv.slice(2);
const at = args.indexOf('--decimals');
const decimals = at === -1 ? 0 : Number(args[at + 1]);
const files = at === -1 ? args : args.filter((_, i) => i !== at && i !== at + 1);
if (files.length === 0 || !Number.isInteger(decimals) || decimals < 0) {
  console.error('usage: npm run art:round -- [--decimals <n>] <file>…');
  process.exit(1);
}

let changed = 0;
for (const file of files) {
  const before = readFileSync(file, 'utf8');
  const options = await resolveConfig(file);
  const after = await format(roundPathData(before, decimals), { ...options, filepath: file });
  if (after === before) continue;
  writeFileSync(file, after);
  changed++;
  console.log(`${file}: ${before.length} → ${after.length} bytes`);
}
console.log(`rounded path data in ${changed} of ${files.length} files`);
