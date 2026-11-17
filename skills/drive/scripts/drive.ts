// The `drive` CLI: `drive worktree <new|done|sync> ...` and `drive setup`. Project values come from the project's
// config file.
import { runSetup } from './setup.ts';
import { runWorktree } from './worktree.ts';

const [group, ...rest] = process.argv.slice(2);
if (group === 'worktree') await runWorktree(rest);
else if (group === 'setup') runSetup(rest);
else {
  console.error(`✖ unknown group '${group ?? ''}'; usage: drive <worktree <new|done|sync> ...|setup>`);
  process.exit(1);
}
