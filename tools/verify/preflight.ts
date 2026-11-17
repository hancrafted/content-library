// Gathers the real facts about this checkout and fails `verify` when it is
// unhealthy. The judgement lives in preflight.pure.ts; this file only observes.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, lstatSync } from 'node:fs';
import path from 'node:path';
import { findViolations, type CheckoutFacts } from './preflight.pure.ts';

function git(...args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function nodeModulesKind(root: string): CheckoutFacts['nodeModules'] {
  const target = path.join(root, 'node_modules');
  if (!existsSync(target) && !isDanglingLink(target)) return 'missing';
  return lstatSync(target).isSymbolicLink() ? 'symlink' : 'directory';
}

function isDanglingLink(target: string): boolean {
  try {
    return lstatSync(target).isSymbolicLink();
  } catch {
    return false;
  }
}

function hooksInstalled(root: string): boolean {
  const hooksPath = execFileSync('git', ['config', '--default', '', 'core.hooksPath'], { encoding: 'utf8' }).trim();
  return hooksPath !== '' && existsSync(path.join(root, hooksPath, 'pre-commit'));
}

// `archgate:full` is the one home of the full-scope rule: by default archgate checks
// only rules whose files changed against an auto-detected base.
function archgateTotal(root: string): number {
  // spawnSync, not execFileSync: a failing ADR check exits non-zero, and that is the
  // next verify step's report to make; the preflight only needs the total.
  const { stdout } = spawnSync('npm', ['run', '-s', 'archgate:full', '--', '--output', 'json'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  try {
    return (JSON.parse(stdout) as { total: number }).total;
  } catch {
    return 0;
  }
}

const root = git('rev-parse', '--show-toplevel');
const violations = findViolations({
  nodeModules: nodeModulesKind(root),
  hooksInstalled: hooksInstalled(root),
  archgateTotal: archgateTotal(root),
});

for (const violation of violations) {
  console.error(`✖ preflight [${violation.id}] ${violation.problem}\n  fix: ${violation.fix}`);
}
if (violations.length > 0) process.exit(1);
console.log('✔ preflight: node_modules, hooks and archgate scope are healthy');
