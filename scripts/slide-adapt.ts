// `npm run slides:adapt -- <pool-slug> --as <instance-slug> --into <episode> [--section <section-slug>]`: makes an
// instance of a pool Slide in one Episode (design-ADR 0016, Slide reuse rule 3). The copy lands in the Episode's own
// `slides/<instance-slug>/`, marked `copiedFrom: { slug, commit }`, and takes the place of the Episode's reference;
// `--section` adds it to a Section when the Episode does not hold the pool Slide yet. Edit the copy afterwards; the
// other Episodes keep the pool Slide. The rules live in slide-adapt.pure.ts.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { planAdapt } from './slide-adapt.pure.ts';
import { formatted, repo, root } from './slide-repo.ts';

const USAGE =
  'usage: npm run slides:adapt -- <pool-slug> --as <instance-slug> --into <episode> [--section <section-slug>]';

const [origin, ...rest] = process.argv.slice(2);
const flag = (name: string) => {
  const at = rest.indexOf(name);
  return at === -1 ? undefined : rest[at + 1];
};
const as = flag('--as');
const into = flag('--into');
const section = flag('--section');
if (origin === undefined || origin.startsWith('-') || as === undefined || into === undefined) {
  console.error(USAGE);
  process.exit(1);
}

const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const result = planAdapt({ origin, as, into, commit, ...(section !== undefined && { section }) }, repo);
if (!result.ok) {
  console.error(`slides:adapt refused, nothing changed:\n${result.reasons.map((reason) => `  ${reason}`).join('\n')}`);
  process.exit(1);
}

for (const { path, text, format } of result.plan.copies) {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), format ? await formatted(path, text) : text);
}
for (const { path, text } of result.plan.edits) {
  writeFileSync(join(root, path), await formatted(path, text));
  console.log(`edited ${path}`);
}
console.log(`"${as}" is an instance of "${origin}" in ${into}; edit it, then run npm run verify.`);
