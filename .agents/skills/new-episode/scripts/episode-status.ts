// The Episode run status reader: the one place that turns a worktree and an Episode slug into the Episode's
// run status (pipeline.yml + events.jsonl + the gates). `npm run episode:status` prints it, the SessionStart
// `compact` hook summarises it. The disk goes through the run-log module, gh arrives as a source at the seam
// (the CLI and the hook each hand in a real `gh`); the gh call protocol lives here, the rules in status.pure.ts.
import path from 'node:path';
import { readPipeline } from '../../../../src/lib/episode-pipeline-jobs.pure.ts';
import { readEpisodeLog, readOrNull } from './episode-run-log.ts';
import { outputApproved, runStatus, subIssuesApproved, type GateReaders, type RunStatus, type SubIssue } from './status.pure.ts';

/** Runs `gh` with these arguments and returns its stdout; throws when gh fails. */
export type Gh = (args: readonly string[]) => string;

/** What reading an Episode's status found: the status, or why there is none. */
export type EpisodeStatus =
  | { kind: 'ok'; status: RunStatus; /** Log lines that did not parse, already prefixed with the file. */ errors: string[] }
  | { kind: 'no-pipeline'; file: string }
  | { kind: 'no-jobs'; file: string };

/** The pipeline file of an Episode, relative to the worktree root. */
const pipelineFile = (slug: string): string => path.join('docs/episodes', slug, 'pipeline.yml');

/**
 * The gate readers for one Episode run. An output path names `<slug>`, filled in before it is read; a missing
 * output is not approved. A label gate asks gh for the spec issue labelled `episode:<slug>` and its sub-issues
 * (`subIssuesApproved`); any gh failure or unreadable answer reads as not approved, so the gate stays shut.
 */
function gateReaders(slug: string, read: (file: string) => string | null, gh: Gh): GateReaders {
  return {
    outputApproved: (output) => {
      const file = output.replaceAll('<slug>', slug);
      const text = read(file);
      return text !== null && outputApproved(file, text);
    },
    labelApproved: () => {
      try {
        const [spec] = JSON.parse(gh(['issue', 'list', '--label', `episode:${slug}`, '--state', 'all', '--json', 'number'])) as { number: number }[];
        if (spec === undefined) return false;
        return subIssuesApproved(JSON.parse(gh(['api', `repos/{owner}/{repo}/issues/${spec.number}/sub_issues`])) as SubIssue[]);
      } catch {
        return false;
      }
    },
  };
}

/** The run status of the Episode `slug` in the worktree at `root`; `now` is an ISO time, `gh` answers the label gates. */
export function readEpisodeStatus(root: string, slug: string, { now, gh }: { now: string; gh: Gh }): EpisodeStatus {
  const file = pipelineFile(slug);
  const read = (relative: string): string | null => readOrNull(path.join(root, relative));
  const pipeline = read(file);
  if (pipeline === null) return { kind: 'no-pipeline', file };
  if (readPipeline(pipeline) === null) return { kind: 'no-jobs', file };
  const { folded, errors } = readEpisodeLog(slug, root);
  return { kind: 'ok', status: runStatus(pipeline, folded, { ...gateReaders(slug, read, gh), now }), errors };
}

/** An Episode with a job not done, as the hook sees it. */
export interface EpisodeRun {
  slug: string;
  status: RunStatus;
}

/** The SessionStart reminder, or null when no Episode has a job that is not done. */
export function unfinishedReminder(runs: readonly EpisodeRun[]): string | null {
  const open = runs.filter(({ status }) => status.jobs.some(({ state }) => state !== 'done'));
  if (open.length === 0) return null;
  const lines = open.map(({ slug }) => `- npm run episode:status -- ${slug}`);
  return [
    'Context was compacted while an Episode run has jobs not done. Before anything else, run the command for each Episode below and rebuild the todo list from its output, never from memory:',
    ...lines,
  ].join('\n');
}

/** The integration worktrees in `git worktree list --porcelain` output: branch `episode/<slug>`, not a `--` job branch. */
export function episodeBranches(porcelain: string): { slug: string; dir: string }[] {
  return porcelain.split('\n\n').flatMap((block) => {
    const dir = /^worktree (.+)$/m.exec(block)?.[1];
    const slug = /^branch refs\/heads\/episode\/(.+)$/m.exec(block)?.[1];
    return dir === undefined || slug === undefined || slug.includes('--') ? [] : [{ slug, dir }];
  });
}
