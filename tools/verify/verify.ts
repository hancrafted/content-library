// `npm run verify`, `npm run verify:quick` and `npm run verify:commit`: runs the plan verify.pure.ts names, one phase at a time, and exits 1
// naming the failed steps. `node tools/verify/verify.ts` runs the full plan; `node tools/verify/verify.ts commit` the commit plan; `quick` the agent-loop plan.
import { runCommand } from './run-command.ts';
import { COMMIT_PLAN, QUICK_PLAN, runPlan, VERIFY_PLAN } from './verify.pure.ts';

const PLANS = { commit: COMMIT_PLAN, quick: QUICK_PLAN } as const;
const name = process.argv[2];
const plan = name === 'commit' || name === 'quick' ? PLANS[name] : VERIFY_PLAN;
const passed = await runPlan(plan, runCommand, (text) => console.log(text));
if (!passed) process.exit(1);
