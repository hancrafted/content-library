// `npm run verify`, `npm run verify:quick` and `npm run verify:commit`: runs the plan verify.pure.ts names, one phase at a time, and exits 1
// naming the failed steps. `node tools/verify/verify.ts` runs the full plan; `node tools/verify/verify.ts commit` the commit plan; `quick` the agent-loop plan.
// A step marked `testLock` runs holding the test lock (tools/load/test-lock.ts). The full plan then prints the tests
// over 750 ms its run logged, with the load factor, and still passes: CI's 3 s budget is the only gate.
import { currentBranch } from '../load/git.ts';
import {
  formatSlowTest,
  SLOW_TEST_MILLISECONDS,
  slowTestsLogPath,
  slowTestsSince,
  testCount,
} from '../load/slow-tests.mts';
import { withTestLock } from '../load/test-lock.ts';
import { runCommand } from './run-command.ts';
import { COMMIT_PLAN, QUICK_PLAN, runPlan, VERIFY_PLAN, type Exec } from './verify.pure.ts';

const PLANS = { commit: COMMIT_PLAN, quick: QUICK_PLAN } as const;
const name = process.argv[2];
const plan = name === 'commit' || name === 'quick' ? PLANS[name] : VERIFY_PLAN;
const exec: Exec = (step) => (step.testLock ? withTestLock(() => runCommand(step)) : runCommand(step));
const startedAt = new Date();
const passed = await runPlan(plan, exec, (text) => console.log(text));
if (plan === VERIFY_PLAN) printSlowTests(startedAt);
if (!passed) process.exit(1);

/** The fast-suite tests over SLOW_TEST_MILLISECONDS this run logged on this branch; nothing when there are none. */
function printSlowTests(since: Date): void {
  const log = slowTestsLogPath(process.cwd());
  if (log === null) return;
  const entries = slowTestsSince(log, currentBranch(process.cwd()), since);
  if (entries.length === 0) return;
  console.log(`! ${testCount(entries.length)} ran past ${SLOW_TEST_MILLISECONDS} ms (CI fails at 3 s):`);
  for (const entry of entries) console.log(formatSlowTest(entry));
}
