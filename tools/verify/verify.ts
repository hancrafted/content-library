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

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf8');
}

function printSlowTests(since: Date): void {
  const cwd = process.cwd();
  const report = slowTestReport({ cwd, branch: currentBranch(cwd), since, note: 'CI fails at 3 s' });
  for (const line of report) console.log(line);
}
