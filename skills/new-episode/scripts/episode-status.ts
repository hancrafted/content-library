// The Episode run status reader: the one place that turns a worktree and an Episode slug into the Episode's
// run status (pipeline.yml + events.jsonl + the gates). `npm run episode:status` prints it, the SessionStart
// `compact` hook summarises it. The disk goes through the run-log module, gh arrives as a source at the seam
// (the CLI and the hook each hand in a real `gh`); the gh call protocol lives here, the rules in status.pure.ts.
import path from 'node:path';
import { readPipeline } from '../../../src/lib/episode-pipeline-jobs.pure.ts';
import { readEpisodeLog, readOrNull } from './episode-run-log.ts';
import {
  outputApproved,
  runStatus,
  subIssuesApproved,
  type GateReaders,
  type RunStatus,
  type SubIssue,
} from './status.pure.ts';

/** Runs `gh` with these arguments and returns its stdout; throws when gh fails. */
export type Gh = (args: readonly string[]) => string;

/** What reading an Episode's status found: the status, or why there is none. */
export type EpisodeStatus =
  | {
      kind: 'ok';
      status: RunStatus;
      /** Log lines that did not parse, already prefixed with the file. */ errors: string[];
    }
  | { kind: 'no-pipeline'; file: string }
  | { kind: 'no-jobs'; file: string };

/** The pipeline file of an Episode, relative to the worktree root. */
const pipelineFile = (slug: string): string => path.join('docs/episodes', slug, 'pipeline.yml');

/** The template's pipeline: the jobs an Episode has before customize-pipeline writes its own. */
const TEMPLATE_PIPELINE = 'skills/new-episode/assets/pipeline.yml';

/** The job ids a Job may be begun with, and the file they come from: the Episode's pipeline once it exists, else the template's. */
export function declaredJobs(root: string, slug: string): { file: string; ids: string[] } {
  const own = readOrNull(path.join(root, pipelineFile(slug)));
  const file = own === null ? TEMPLATE_PIPELINE : pipelineFile(slug);
  const yaml = own ?? readOrNull(path.join(root, TEMPLATE_PIPELINE)) ?? '';
  return { file, ids: readPipeline(yaml)?.jobs.map((j) => j.id) ?? [] };
}

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
        const [spec] = JSON.parse(
          gh(['issue', 'list', '--label', `episode:${slug}`, '--state', 'all', '--json', 'number']),
        ) as { number: number }[];
        if (spec === undefined) return false;
        return subIssuesApproved(
          JSON.parse(gh(['api', `repos/{owner}/{repo}/issues/${spec.number}/sub_issues`])) as SubIssue[],
        );
      } catch {
        return false;
      }
    },
  };
}

/** The run status of the Episode `slug` in the worktree at `root`; `now` is an ISO time, `gh` answers the label gates. */
export function readEpisodeStatus(root: string, slug: string, { now, gh }: { now: string; gh: Gh }): EpisodeStatus {
  const read = (relative: string): string | null => readOrNull(path.join(root, relative));
  // Before customize-pipeline writes the Episode's own pipeline, the template's jobs are the declared ones.
  const { file } = declaredJobs(root, slug);
  const pipeline = read(file);
  if (pipeline === null) return { kind: 'no-pipeline', file };
  if (readPipeline(pipeline) === null) return { kind: 'no-jobs', file };
  const { folded, errors } = readEpisodeLog(slug, root);
  return { kind: 'ok', status: runStatus(pipeline, folded, { ...gateReaders(slug, read, gh), now }), errors };
}
