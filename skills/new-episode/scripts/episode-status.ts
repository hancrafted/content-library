// The Episode run status reader: the one place that turns a worktree and an Episode slug into the Episode's
// run status (pipeline.yml + events.jsonl + the gates). `npm run episode:status` prints it, the SessionStart
// `compact` hook summarises it. The disk goes through the run-log module; the rules live in status.pure.ts.
import path from 'node:path';
import { readPipeline } from '../../../src/lib/episode-pipeline-jobs.pure.ts';
import { readEpisodeLog, readMarker, readOrNull } from './episode-run-log.ts';
import { outputApproved, runStatus, type GateReaders, type RunStatus } from './status.pure.ts';

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

/** The template's pipeline: the jobs an Episode has before scaffold-pipeline copies it into the Episode. */
const TEMPLATE_PIPELINE = 'skills/new-episode/assets/pipeline.yml';

/** The job ids a Job may be begun with, and the file they come from: the Episode's pipeline once it exists, else the template's. */
export function declaredJobs(root: string, slug: string): { file: string; ids: string[]; orchestrator: string[] } {
  const own = readOrNull(path.join(root, pipelineFile(slug)));
  const file = own === null ? TEMPLATE_PIPELINE : pipelineFile(slug);
  const yaml = own ?? readOrNull(path.join(root, TEMPLATE_PIPELINE)) ?? '';
  const jobs = readPipeline(yaml)?.jobs ?? [];
  return {
    file,
    ids: jobs.map((j) => j.id),
    orchestrator: jobs.filter((j) => j.session === 'orchestrator').map((j) => j.id),
  };
}

/**
 * The gate readers for one Episode run. An output path names `<slug>`, filled in before it is read; a missing
 * output is not approved.
 */
function gateReaders(slug: string, read: (file: string) => string | null): GateReaders {
  return {
    outputApproved: (output) => {
      const file = output.replaceAll('<slug>', slug);
      const text = read(file);
      return text !== null && outputApproved(file, text);
    },
  };
}

/** The run status of the Episode `slug` in the worktree at `root`; `now` is an ISO time. */
export function readEpisodeStatus(root: string, slug: string, { now }: { now: string }): EpisodeStatus {
  const read = (relative: string): string | null => readOrNull(path.join(root, relative));
  // Before scaffold-pipeline copies the template into the Episode, the template's jobs are the declared ones.
  const { file } = declaredJobs(root, slug);
  const pipeline = read(file);
  if (pipeline === null) return { kind: 'no-pipeline', file };
  if (readPipeline(pipeline) === null) return { kind: 'no-jobs', file };
  const { folded, errors, current } = readEpisodeLog(slug, root);
  // The current Run: the live marker's, else the latest. Earlier Runs make no job done; `reuse` brings one over.
  const trace = readMarker(root)?.trace_id ?? current?.trace_id;
  return { kind: 'ok', status: runStatus(pipeline, folded, { ...gateReaders(slug, read), now, trace }), errors };
}
