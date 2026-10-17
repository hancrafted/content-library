// `node skills/pipeline-feedback/scripts/scope.ts [<commit>]`: exits 1 and names each file of the commit
// (default HEAD) that is an Episode file or lies outside the skill folder, docs/ and the glossary.
import { execFileSync } from 'node:child_process';
import { checkScope } from './scope.pure.ts';

const commit = process.argv[2] ?? 'HEAD';
const paths = execFileSync(
  'git',
  ['diff-tree', '--no-commit-id', '--name-only', '-r', '-m', '--first-parent', commit],
  {
    encoding: 'utf8',
  },
)
  .split('\n')
  .filter(Boolean);
const scope = checkScope(paths);
if (!scope.ok) {
  if (paths.length === 0) console.error(`✖ ${commit} changes no file`);
  for (const file of scope.episode) console.error(`✖ ${file}: an Episode file`);
  for (const file of scope.outside) console.error(`✖ ${file}: outside skills/new-episode/, docs/ and GLOSSARY.md`);
  process.exit(1);
}
console.log(`✔ ${commit}: ${paths.length} file(s), all in scope`);
