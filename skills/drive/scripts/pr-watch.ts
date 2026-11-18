import { run } from './git.ts';
import { idsOf, judge, parseView, type PullRequestView, type Verdict } from './pr-watch.pure.ts';
import { fail } from './project.ts';
import type { Timing } from './worktree-merge.ts';

export type WatchTiming = Pick<Timing, 'pollMilliseconds'>;

export const WATCH_TIMING: WatchTiming = { pollMilliseconds: 30_000 };
const FAILED_POLLS_TOLERATED = 3;

export interface Watch {
  view: () => PullRequestView | { error: string };
  sleep: (milliseconds: number) => Promise<void>;
  timing: WatchTiming;
}

export async function watchPullRequest({
  view,
  sleep,
  timing,
}: Watch): Promise<NonNullable<Verdict> | { error: string }> {
  let seen: Set<string> | null = null;
  let failedPolls = 0;
  for (;;) {
    const current = view();
    if ('error' in current) {
      if (++failedPolls > FAILED_POLLS_TOLERATED) return current;
    } else {
      failedPolls = 0;
      const verdict = judge(current, seen ?? idsOf(current));
      if (verdict !== null) return verdict;
      seen ??= idsOf(current);
    }
    await sleep(timing.pollMilliseconds);
  }
}

const FIELDS = 'state,mergeCommit,reviews,comments';

function ghView(number: string): PullRequestView | { error: string } {
  const result = run('gh', ['pr', 'view', number, '--json', FIELDS]);
  if (result.status !== 0) return { error: `gh pr view ${number} failed:\n${result.stderr}` };
  return parseView(result.stdout);
}

const USAGE = 'usage: drive pr watch <number> [--poll-milliseconds <n>]';

function readPollFlag(flags: readonly string[]): WatchTiming | { error: string } {
  if (flags.length === 0) return WATCH_TIMING;
  const pollMilliseconds = Number(flags[1]);
  const wellFormed = flags.length === 2 && flags[0] === '--poll-milliseconds';
  return wellFormed && Number.isInteger(pollMilliseconds) && pollMilliseconds >= 1
    ? { pollMilliseconds }
    : { error: USAGE };
}

function readOptions(argv: readonly string[]): { number: string; timing: WatchTiming } | { error: string } {
  const [verb, number, ...flags] = argv;
  if (verb !== 'watch' || number === undefined || !/^\d+$/.test(number)) return { error: USAGE };
  const timing = readPollFlag(flags);
  return 'error' in timing ? timing : { number, timing };
}

export async function runPr(argv: readonly string[]): Promise<void> {
  const options = readOptions(argv);
  if ('error' in options) fail(options.error);
  const outcome = await watchPullRequest({
    view: () => ghView(options.number),
    sleep: (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
    timing: options.timing,
  });
  if ('error' in outcome) fail(outcome.error);
  console.log(outcome.line);
  process.exit(outcome.exit);
}
