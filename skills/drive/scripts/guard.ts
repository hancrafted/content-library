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

function currentBranch(root: string): string {
  const current = git(root, ['symbolic-ref', '--short', '-q', 'HEAD']);
  return current.status === 0 ? current.stdout.trim() : '(detached HEAD)';
}

/** The files changed: staged, or since the merge-base of `against`. --no-renames lists both sides of a rename, so
 * moving a Decision doc away counts as changing it. */
function changedFiles(root: string, against: string | null): string[] {
  const diff =
    against === null
      ? ['diff', '--cached', '--name-only', '--no-renames', '-z']
      : ['diff', '--name-only', '--no-renames', '-z', `${against}...HEAD`];
  return stdout(diff, root).split('\0').filter(Boolean);
}

export function runGuard(args: readonly string[]): void {
  const options = parseGuardArgs(args);
  if ('error' in options) fail(options.error);
  const root = stdout(['rev-parse', '--show-toplevel'], process.cwd()).trim();
  const { decisionDocs } = loadConfig(root);
  // A merge in progress (`git merge main`) stages what the other side changed, which this branch did not: skip it.
  // CI's --against diff starts at the merge-base, so it holds only what the branch itself changed.
  if (options.against === null && git(root, ['rev-parse', '-q', '--verify', 'MERGE_HEAD']).status === 0) return;
  const changed = changedFiles(root, options.against);
  const branch = currentBranch(root);
  const violations = guardViolations(branch, changed, decisionDocs);
  if (violations.length === 0) return;
  for (const message of violations) console.error(`✖ ${message}`);
  console.error(
    `  Move the change to a ${DECISIONS_PREFIX}<topic> branch; a Subagent lists proposed terms in its report instead.`,
  );
  process.exit(1);
}
