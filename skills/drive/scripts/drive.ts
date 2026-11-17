// The `drive` CLI: `drive worktree <new|done|sync|preflight> ...`. Project values come from docs/drive/project.yml.
import { runWorktree } from './worktree.ts';

const [group, ...rest] = process.argv.slice(2);
if (group === 'worktree') await runWorktree(rest);
else {
  console.error(`✖ unknown group '${group ?? ''}'; usage: drive worktree <new|done|sync|preflight> ...`);
  process.exit(1);
}
