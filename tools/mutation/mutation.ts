// `npm run test:mutation`: runs Stryker in place over `*.pure.ts` modules and `skills/**/scripts/**/*.ts`
// skill scripts changed since the merge-base with `origin/main` (plus subjects of changed tests).
// Restores `.agents` executable bits and removes stray `stryker-setup-*.js` files afterwards.
import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { resolveMutationScope } from '../../skills/mutation-testing/scripts/mutation-scope.pure.ts';

function captureLines(args: string[]): string[] {
  return execFileSync('git', args, { encoding: 'utf8' })
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function changedPathsSinceMain(): string[] {
  const [base] = captureLines(['merge-base', 'HEAD', 'origin/main']);
  const tracked = captureLines(['diff', '--name-only', base]);
  const untracked = captureLines(['ls-files', '--others', '--exclude-standard']);
  return [...new Set([...tracked, ...untracked])];
}

/** Stryker's in-place backup/restore strips executable bits under `.agents`; restore `100755` entries from the index. */
function restoreAgentsExecutableBits(): void {
  for (const line of captureLines(['ls-files', '--stage', '.agents'])) {
    if (!line.startsWith('100755 ')) continue;
    const file = line.split('\t')[1];
    if (file && existsSync(file)) chmodSync(file, 0o755);
  }
}

function cleanupStrykerArtifacts(): void {
  for (const entry of readdirSync('.')) {
    if (/^stryker-setup-.*\.js$/.test(entry)) rmSync(entry, { force: true });
  }
  rmSync('.stryker-tmp', { recursive: true, force: true });
}

const targets = resolveMutationScope(changedPathsSinceMain(), existsSync);
if (targets.length === 0) {
  console.log('✔ no mutatable logic files changed since origin/main');
  process.exit(0);
}

console.log(`▶ mutating ${targets.length} file(s): ${targets.join(', ')}`);
let exitCode: number;
try {
  const result = spawnSync('npx', ['stryker', 'run', '--mutate', targets.join(',')], { stdio: 'inherit' });
  exitCode = result.status ?? 1;
} finally {
  restoreAgentsExecutableBits();
  cleanupStrykerArtifacts();
}
if (exitCode !== 0) process.exit(exitCode);
