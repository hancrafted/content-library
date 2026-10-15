// SessionStart hook, matcher `compact`: prints a reminder only when an `episode/*` worktree has
// jobs not done; silent otherwise. It reads each Episode's state through the same `readEpisodeStatus`
// that `npm run episode:status` uses.
import { execFileSync } from 'node:child_process';
import { episodeBranches, unfinishedReminder, type EpisodeRun } from './episode-reminder.pure.ts';
import { readEpisodeStatus } from './episode-status.ts';

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const run = (cmd: string, args: readonly string[], cwd: string): string =>
  execFileSync(cmd, args, { cwd, encoding: 'utf8', timeout: 10_000, stdio: ['ignore', 'pipe', 'ignore'] });

function episodeRuns(): EpisodeRun[] {
  return episodeBranches(run('git', ['worktree', 'list', '--porcelain'], root)).flatMap(({ slug, dir }) => {
    const result = readEpisodeStatus(dir, slug, { now: new Date().toISOString() });
    return result.kind === 'ok' ? [{ slug, dir, status: result.status }] : [];
  });
}

try {
  const text = unfinishedReminder(episodeRuns());
  if (text !== null) console.log(text);
} catch {
  // A hook must never fail the session: say nothing when git or a file is unreadable.
}
