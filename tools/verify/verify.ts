// `npm run verify`, `verify:quick`, `verify:commit` and `verify:push`: runs the plan verify.pure.ts names, one phase
// at a time, and exits 1 naming the failed steps. `node tools/verify/verify.ts` runs the full plan, what CI will say;
// `commit` the commit plan; `quick` the agent-loop plan; `push` the pre-push plan, planned from the pushed refs on
// stdin and git's answer to what changed since main (push-facts.ts). A push that cannot be planned fails, naming why.
// The plan's `testLock` steps run inside one hold of the test lock (tools/load/test-lock.ts). The full and push
// plans then print the tests over 750 ms their run logged, with the load factor, and still pass: CI's 3 s budget is
// the only gate.
import { currentBranch } from '../load/git.ts';
import { slowTestReport } from '../load/slow-tests.mts';
import { withTestLock } from '../load/test-lock.ts';
import { changesSinceMain } from './push-facts.ts';
import { runCommand } from './run-command.ts';
import {
  COMMIT_PLAN,
  holdAcrossLockedSteps,
  type Plan,
  pushPlan,
  QUICK_PLAN,
  runPlan,
  VERIFY_PLAN,
} from './verify.pure.ts';

const name = process.argv[2];
const startedAt = new Date();
const plan = await choosePlan(name);
const { exec, release } = holdAcrossLockedSteps(plan, runCommand, (fn) => withTestLock(fn));
const passed = await runPlan(plan, exec, (text) => console.log(text));
await release();
if (name !== 'commit' && name !== 'quick') printSlowTests(startedAt);
if (!passed) process.exit(1);

async function choosePlan(planName: string | undefined): Promise<Plan> {
  if (planName === 'commit') return COMMIT_PLAN;
  if (planName === 'quick') return QUICK_PLAN;
  if (planName !== 'push') return VERIFY_PLAN;
  try {
    const refs = await readStdin();
    const { plan: push, notes } = pushPlan({ refs, ...changesSinceMain(process.cwd()) });
    for (const note of notes) console.log(note);
    return push;
  } catch (error) {
    console.error(`✖ verify:push: could not plan the push, so it fails: ${(error as Error).message}`);
    process.exit(1);
  }
}

/** Everything on stdin: the refs git hands pre-push. */
async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf8');
}

/** The fast-suite tests over 750 ms this run logged on this branch; nothing when there are none. */
function printSlowTests(since: Date): void {
  const cwd = process.cwd();
  const report = slowTestReport({ cwd, branch: currentBranch(cwd), since, note: 'CI fails at 3 s' });
  for (const line of report) console.log(line);
}
