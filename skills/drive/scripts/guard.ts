// `drive guard [--against <ref>]`: fails when a Decision doc named in the project config changed on a branch that is
// not `decisions/*`. A commit hook runs it on the staged changes; CI passes the base ref to check the whole branch.
import { git } from './git.ts';
import { DECISIONS_PREFIX, guardViolations, parseGuardArgs } from './guard.pure.ts';
import { fail, loadConfig } from './project.ts';

function stdout(args: readonly string[], cwd: string): string {
  const result = git(cwd, args);
  if (result.status !== 0) fail(`git ${args.join(' ')} failed:\n${result.stderr}`);
  return result.stdout;
}

export function runGuard(args: readonly string[]): void {
  const options = parseGuardArgs(args);
  if ('error' in options) fail(options.error);
  const root = stdout(['rev-parse', '--show-toplevel'], process.cwd()).trim();
  const { decisionDocs } = loadConfig(root);
  const current = git(root, ['symbolic-ref', '--short', '-q', 'HEAD']);
  const branch = current.status === 0 ? current.stdout.trim() : '(detached HEAD)';
  // --no-renames lists both sides of a rename, so moving a Decision doc away counts as changing it.
  const diff =
    options.against === null
      ? ['diff', '--cached', '--name-only', '--no-renames', '-z']
      : ['diff', '--name-only', '--no-renames', '-z', `${options.against}...HEAD`];
  const changed = stdout(diff, root).split('\0').filter(Boolean);
  const violations = guardViolations(branch, changed, decisionDocs);
  if (violations.length === 0) return;
  for (const message of violations) console.error(`✖ ${message}`);
  console.error(
    `  Move the change to a ${DECISIONS_PREFIX}<topic> branch; a Subagent reports a needed change in the Terms section of its report instead.`,
  );
  process.exit(1);
}
