// `npm run slides:promote -- <instance-slug> --update [--reconciled]` or `-- <instance-slug> --own`: resolves one
// instance at the Promotion Gate (design-ADR 0016, Slide reuse rule 4), as Han decided its card. `--update` makes the
// instance's content the shared Slide's and pins the instance's slug as its Episode's anchor; `--own` keeps it as a
// Slide of its own. Whether the pool Slide changed since the copy is read from git, following the folder's move into
// the pool. The rules live in slide-promote.pure.ts.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { poolChangesSince } from './slide-history.pure.ts';
import { planPromote } from './slide-promote.pure.ts';
import { formatted, repo, root } from './slide-repo.ts';

const USAGE = 'usage: npm run slides:promote -- <instance-slug> (--update [--reconciled] | --own)';

const [instance, ...flags] = process.argv.slice(2);
const update = flags.includes('--update');
const own = flags.includes('--own');
if (instance === undefined || instance.startsWith('-') || update === own) {
  console.error(USAGE);
  process.exit(1);
}

const result = planPromote(
  { instance, outcome: update ? 'update' : 'own', reconciled: flags.includes('--reconciled') },
  repo,
  (folder, commit) =>
    poolChangesSince(folder, commit, (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' })),
);
if (!result.ok) {
  console.error(
    `slides:promote refused, nothing changed:\n${result.reasons.map((reason) => `  ${reason}`).join('\n')}`,
  );
  process.exit(1);
}

const { removals, writes, edits, affected } = result.plan;
const texts = await Promise.all(
  writes.map(async (file) => ({ ...file, text: file.format ? await formatted(file.path, file.text) : file.text })),
);
for (const folder of removals) rmSync(join(root, folder), { recursive: true, force: true });
for (const { path, text } of texts) {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), text);
}
for (const { path, text } of edits) {
  writeFileSync(join(root, path), await formatted(path, text));
  console.log(`edited ${path}`);
}
console.log(
  update
    ? `"${instance}" updated the shared Slide and stays its Episode's Pinned anchor. The shared Slide changes in: ${affected.join(', ')}.`
    : `"${instance}" is a Slide of its own now; its slug and anchors stay.`,
);
