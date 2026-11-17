import path from 'node:path';
import { readPipeline } from './episode-pipeline-definition.pure.ts';
import { readEpisodeLog, readMarker, readOrNull } from './episode-run-log.ts';
import { outputApproved, runStatus, type GateReaders, type RunStatus } from './status.pure.ts';

export type EpisodeStatus =
  | {
      kind: 'ok';
      status: RunStatus;
      errors: string[];
    }
  | { kind: 'no-pipeline'; file: string }
  | { kind: 'no-jobs'; file: string };

const pipelineFile = (slug: string): string => path.join('docs/episodes', slug, 'pipeline.yml');

const TEMPLATE_PIPELINE = 'skills/new-episode/assets/pipeline.yml';

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

function gateReaders(slug: string, read: (file: string) => string | null): GateReaders {
  return {
    outputApproved: (output) => {
      const file = output.replaceAll('<slug>', slug);
      const text = read(file);
      return text !== null && outputApproved(file, text);
    },
  };
}

export function readEpisodeStatus(root: string, slug: string, { now }: { now: string }): EpisodeStatus {
  const read = (relative: string): string | null => readOrNull(path.join(root, relative));
  const { file: declaredPipelineFile } = declaredJobs(root, slug);
  const pipeline = read(declaredPipelineFile);
  if (pipeline === null) return { kind: 'no-pipeline', file: declaredPipelineFile };
  if (readPipeline(pipeline) === null) return { kind: 'no-jobs', file: declaredPipelineFile };
  const { folded, errors, current } = readEpisodeLog(slug, root);
  const currentRunTrace = readMarker(root)?.trace_id ?? current?.trace_id;
  return {
    kind: 'ok',
    status: runStatus(pipeline, folded, { ...gateReaders(slug, read), now, trace: currentRunTrace }),
    errors,
  };
}
