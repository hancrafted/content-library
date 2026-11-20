import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, lstatSync } from 'node:fs';
import path from 'node:path';
import { fullStdoutOf } from './full-stdout.ts';
import { coreBareIsTrue } from './preflight-bare.ts';
import { findViolations, HEALTHY_CHECKOUT, type CheckoutFacts } from './preflight.pure.ts';

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

function archgateFullScopeTotal(root: string): number {
  const stdoutEvenWhenAnAdrCheckFails = fullStdoutOf(
    'npm',
    ['run', '-s', 'archgate:full', '--', '--output', 'json'],
    root,
  );
  try {
    return (JSON.parse(stdoutEvenWhenAnAdrCheckFails) as { total: number }).total;
  } catch {
    return 0;
  }
}

function rootOfCoreBareCheckout(): string {
  return path.dirname(git('rev-parse', '--absolute-git-dir'));
}

function rootOfCheckout(): string {
  try {
    return git('rev-parse', '--show-toplevel');
  } catch {
    return rootOfCoreBareCheckout();
  }
}

function driveBindingProblem(root: string): string | null {
  const checked = spawnSync('node', ['.agents/skills/drive/scripts/drive.ts', 'setup', '--check'], {
    cwd: root,
    encoding: 'utf8',
  });
  return checked.status === 0 ? null : checked.stderr.trim() || 'drive setup --check failed';
}

const root = rootOfCheckout();
const coreBare = coreBareIsTrue(root);
const violations = findViolations(
  coreBare
    ? { ...HEALTHY_CHECKOUT, coreBare }
    : {
        nodeModules: nodeModulesKind(root),
        hooksInstalled: hooksInstalled(root),
        archgateTotal: archgateFullScopeTotal(root),
        coreBare,
        driveBindingProblem: driveBindingProblem(root),
      },
);

for (const violation of violations) {
  console.error(`✖ preflight [${violation.id}] ${violation.problem}\n  fix: ${violation.fix}`);
}
if (violations.length > 0) process.exit(1);
console.log('✔ preflight: node_modules, hooks, archgate scope and the drive Binding are healthy');
