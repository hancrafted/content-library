// `node evals/run.ts [--case ink] [--runs 1]`: runs every case × arm × k headless, each in a fresh sandbox, saves
// the pages, transcript.jsonl and tools.json under evals/workspace/iteration-N/eval-<case>/<arm>/run-k/, grades
// each run, and writes skill-creator's benchmark and static viewer. Prints the review page's path.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { runAgent } from './runner/agent.ts';
import { CASES, hashProblems, loadCase, type EvalCase } from './runner/cases.ts';
import type { RunRecord } from './runner/grade-run.ts';
import { invocation } from './runner/invocation.pure.ts';
import { finishIteration, nextIteration, SKILL } from './runner/iteration.ts';
import { collectPages, makeSandbox, skillDigest } from './runner/sandbox.ts';
import { runFacts, toolCalls } from './runner/transcript.pure.ts';

/** An arm is a skill folder to copy into the sandbox, or none. */
const ARMS: Record<string, string | null> = { with_skill: SKILL, without_skill: null };

const { values } = parseArgs({
  options: {
    case: { type: 'string', multiple: true, default: ['ink'] },
    arm: { type: 'string', multiple: true, default: Object.keys(ARMS) },
    runs: { type: 'string', default: '1' },
    model: { type: 'string' },
    'timeout-minutes': { type: 'string', default: '30' },
    parallel: { type: 'string', default: '2' },
  },
});

interface Job {
  readonly evalCase: EvalCase;
  readonly arm: string;
  readonly run: number;
  readonly iteration: string;
}

const writeJson = (file: string, value: unknown) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

function metadataOf({ evalCase }: Job) {
  const prompt = readFileSync(path.join(CASES, evalCase.prompt), 'utf8');
  return { eval_id: evalCase.evalId, eval_name: evalCase.id, prompt, assertions: [] };
}

/** Saves what the transcript says: tools.json for the isolation grader, timing.json for the aggregation. */
function saveTranscriptFacts(runDir: string) {
  const lines = readFileSync(path.join(runDir, 'transcript.jsonl'), 'utf8').split('\n');
  const facts = runFacts(lines);
  writeJson(path.join(runDir, 'tools.json'), toolCalls(lines));
  writeJson(path.join(runDir, 'timing.json'), {
    total_tokens: facts.tokens,
    total_duration_seconds: facts.durationSeconds,
    executor_duration_seconds: facts.durationSeconds,
    cost_usd: facts.costUsd,
  });
  return facts;
}

function prepare(job: Job): string {
  const runDir = path.join(job.iteration, `eval-${job.evalCase.id}`, job.arm, `run-${job.run}`);
  for (const dir of ['pages', 'outputs']) mkdirSync(path.join(runDir, dir), { recursive: true });
  writeJson(path.join(runDir, '..', '..', 'eval_metadata.json'), metadataOf(job));
  writeJson(path.join(runDir, 'eval_metadata.json'), metadataOf(job));
  return runDir;
}

async function execute(job: Job): Promise<void> {
  const { evalCase, arm, run } = job;
  const runDir = prepare(job);
  const skill = ARMS[arm];
  const sandbox = makeSandbox(evalCase, skill);
  const [cwd] = sandbox.roots;
  console.log(`running ${path.relative(job.iteration, runDir)} in ${cwd}`);
  await runAgent({
    cwd,
    prompt: invocation({ caseId: evalCase.id, inputs: sandbox.inputs, dir: cwd, withSkill: skill !== null }),
    transcript: path.join(runDir, 'transcript.jsonl'),
    model: values.model,
    timeoutMs: Number(values['timeout-minutes']) * 60_000,
  });
  const { model } = saveTranscriptFacts(runDir);
  collectPages(sandbox, path.join(runDir, 'pages'));
  const digest = skill === null ? null : skillDigest(skill);
  const record: RunRecord = {
    case: evalCase.id,
    evalId: evalCase.evalId,
    mode: evalCase.mode,
    model,
    arm,
    run,
    roots: sandbox.roots,
    skillDigest: digest,
  };
  writeJson(path.join(runDir, 'run.json'), record);
}

/** Runs the jobs with at most `limit` agents at a time. */
async function pool(jobs: readonly Job[], limit: number): Promise<void> {
  const queue = [...jobs];
  const worker = async () => {
    for (let job = queue.shift(); job !== undefined; job = queue.shift()) await execute(job);
  };
  await Promise.all(Array.from({ length: Math.min(limit, jobs.length) }, worker));
}

function plan(iteration: string): Job[] {
  const unknownArm = values.arm.find((arm) => !(arm in ARMS));
  if (unknownArm !== undefined) throw new Error(`no arm "${unknownArm}"; arms: ${Object.keys(ARMS).join(', ')}`);
  const cases = values.case.map(loadCase);
  const problems = cases.flatMap((evalCase) => hashProblems(CASES, evalCase.hashes));
  if (problems.length > 0) throw new Error(`frozen inputs changed:\n${problems.join('\n')}`);
  const runs = Array.from({ length: Number(values.runs) }, (_, index) => index + 1);
  return cases.flatMap((evalCase) =>
    values.arm.flatMap((arm) => runs.map((run) => ({ evalCase, arm, run, iteration }))),
  );
}

const iteration = nextIteration();
try {
  await pool(plan(iteration), Number(values.parallel));
  console.log(`review: ${await finishIteration(iteration)}`);
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
