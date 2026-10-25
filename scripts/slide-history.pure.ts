// What changed a pool Slide since an instance was copied from it (design-ADR 0016, Slide reuse rule 4): the Gate says
// so and Han reconciles by hand. Each file of the pool folder is followed back through renames (`git log --follow`),
// since the folder may have moved into the pool after the copy's commit; a commit that only moved a file unchanged
// (`R100`) is no change. Runs git through the function it is handed.

/** Runs git with these arguments in the repository and returns its output; throws when git fails. */
export type Git = (args: readonly string[]) => string;

const ENTRY = '\u0000';

/** The commits of one `git log --format=%x00%h %s --name-status` output that changed the file's content. */
function contentCommits(log: string): string[] {
  return log
    .split(ENTRY)
    .filter((entry) => entry.trim() !== '')
    .flatMap((entry) => {
      const [title = '', ...statuses] = entry.split('\n').filter((line) => line.trim() !== '');
      return statuses.every((status) => status.startsWith('R100')) && statuses.length > 0 ? [] : [title.trim()];
    });
}

/** Every commit since `commit`, and any uncommitted work, that changed a file of the pool folder; none if unchanged. */
export function poolChangesSince(folder: string, commit: string, git: Git): string[] {
  const files = git(['ls-files', '--', folder])
    .split('\n')
    .filter((file) => file !== '');
  try {
    const commits = files.flatMap((file) =>
      contentCommits(
        git(['log', '--follow', '-M', '--format=%x00%h %s', '--name-status', `${commit}..HEAD`, '--', file]),
      ),
    );
    const uncommitted = git(['status', '--porcelain', '--', folder]).trim() === '' ? [] : ['uncommitted changes'];
    return [...new Set(commits), ...uncommitted];
  } catch {
    return [`the copy's commit ${commit} is not in this history, so compare by hand`];
  }
}
