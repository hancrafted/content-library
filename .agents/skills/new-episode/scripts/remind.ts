// SessionStart hook, matcher `compact`: prints a reminder only when an `episode/*` worktree has
// jobs not done; silent otherwise. It reads each pipeline's state through the same `runStatus`
// that `npm run episode:status` uses.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { readPipeline } from '../../../../src/lib/episode-pipeline-jobs.pure.ts';
import { episodeBranches, unfinishedReminder, type EpisodeRun } from './remind.pure.ts';
import { fold, parseLog } from './run-log.pure.ts';
import { gateReaders, runStatus } from './status.pure.ts';

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const run = (cmd: string, args: readonly string[], cwd: string): string =>
  execFileSync(cmd, args, { cwd, encoding: 'utf8', timeout: 10_000, stdio: ['ignore', 'pipe', 'ignore'] });

function episodeRuns(): EpisodeRun[] {
  return episodeBranches(run('git', ['worktree', 'list', '--porcelain'], root)).flatMap(({ slug, dir }) => {
    const read = (file: string): string | null => {
      const full = path.join(dir, file);
      return existsSync(full) ? readFileSync(full, 'utf8') : null;
    };
    const pipeline = read(`docs/episodes/${slug}/pipeline.yml`);
    if (pipeline === null || readPipeline(pipeline) === null) return [];
    const gh = (args: readonly string[]): string => run('gh', args, dir);
    const { lines } = parseLog(read(`docs/episodes/${slug}/events.jsonl`) ?? '');
    const folded = fold(lines, { openAs: lines.some((line) => line.kind === 'end-run') ? 'crashed' : 'running' });
    const { jobs } = runStatus(pipeline, folded, { ...gateReaders(slug, { read, gh }), now: new Date().toISOString() });
    const states = jobs.map(({ state }) => state);
    return [{ slug, states }];
  });
}

try {
  const text = unfinishedReminder(episodeRuns());
  if (text !== null) console.log(text);
} catch {
  // A hook must never fail the session: say nothing when git or a file is unreadable.
}
