// The `drive` CLI: `drive worktree <new|done|sync> ...`. Project values come from the project's config file.
import { runWorktree } from './worktree.ts';

const [group, ...rest] = process.argv.slice(2);
if (group === 'worktree') await runWorktree(rest);
else {
  console.error(`✖ unknown group '${group ?? ''}'; usage: drive worktree <new|done|sync> ...`);
  process.exit(1);
}
