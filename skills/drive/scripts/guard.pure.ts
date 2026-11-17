// The Decision-doc guard: Decision docs change only on a `decisions/*` branch. Pure: branch, changed files and the
// config's globs in, one message per offending file out.
import path from 'node:path';

/** Every branch whose name starts with this may change a Decision doc. */
export const DECISIONS_PREFIX = 'decisions/';

export const isDecisionBranch = (branch: string): boolean =>
  branch.startsWith(DECISIONS_PREFIX) && branch.length > DECISIONS_PREFIX.length;

/** The first glob of `globs` that `file` (a repo-relative path with `/`) matches, or null. */
export const matchingGlob = (file: string, globs: readonly string[]): string | null =>
  globs.find((glob) => path.posix.matchesGlob(file, glob)) ?? null;

/** One message per changed Decision doc, naming the file and the rule; none on a `decisions/*` branch. */
export function guardViolations(branch: string, changed: readonly string[], globs: readonly string[]): string[] {
  if (isDecisionBranch(branch)) return [];
  return changed.flatMap((file) => {
    const glob = matchingGlob(file, globs);
    return glob === null
      ? []
      : [
          `${file} is a Decision doc (decisionDocs: ${glob}); it changes only on a ${DECISIONS_PREFIX}<topic> branch, this is '${branch}'`,
        ];
  });
}

export interface GuardOptions {
  /** Compare HEAD with the merge-base of this ref (CI); null checks the staged changes (a commit hook). */
  against: string | null;
}

/** The options of `drive guard [--against <ref>]`, or a usage error. */
export function parseGuardArgs(args: readonly string[]): GuardOptions | { error: string } {
  const usage = { error: 'usage: drive guard [--against <ref>]' };
  if (args.length === 0) return { against: null };
  const [flag, ref] = args;
  return args.length === 2 && flag === '--against' && ref !== undefined && !ref.startsWith('--')
    ? { against: ref }
    : usage;
}
