import { runGuard } from './guard.ts';
import { runLearnings } from './learnings.ts';
import { logCommandAtExit } from './log.ts';
import { runPr } from './pr-watch.ts';
import { runPush } from './push.ts';
import { runSetup } from './setup.ts';
import { runTranscript } from './transcript.ts';
import { runWorktree } from './worktree.ts';

const [group, ...rest] = process.argv.slice(2);
logCommandAtExit(process.argv.slice(2));
if (group === 'worktree') await runWorktree(rest);
else if (group === 'setup') runSetup(rest);
else if (group === 'guard') runGuard(rest);
else if (group === 'push') runPush(rest);
else if (group === 'pr') await runPr(rest);
else if (group === 'learnings') runLearnings(rest);
else if (group === 'transcript') runTranscript(rest);
else {
  console.error(
    `✖ unknown group '${group ?? ''}'; usage: drive <worktree <new|done|sync> ...|push|pr watch <number>|learnings [list|similar "<failure>"|check]|transcript <session-id>|--topic <topic> [--tools] [--since-last]|setup|guard [--against <ref>]>`,
  );
  process.exit(1);
}
