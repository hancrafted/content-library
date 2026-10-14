// `npm run episode:status -- <slug>`: prints each job of the Episode's
// per-run pipeline with its state, derived from pipeline.yml and events.jsonl.
// The gates are read through `gateReaders`; this file only hands it node's disk and gh.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { readPipeline } from '../../../../src/lib/episode-pipeline-jobs.pure.ts';
import { readEpisodeLog, readOrNull as read } from './episode-run-log.ts';
import { gateReaders, renderStatus, runStatus } from './status.pure.ts';

const slug = process.argv[2];
if (!slug) {
  console.error('✖ usage: npm run episode:status -- <slug>');
  process.exit(1);
}
const folder = path.join('docs/episodes', slug);
const pipelineFile = path.join(folder, 'pipeline.yml');
const pipeline = read(pipelineFile);
if (pipeline === null) {
  console.error(`✖ ${pipelineFile} does not exist; run this from the Episode's worktree root.`);
  process.exit(1);
}
if (readPipeline(pipeline) === null) {
  console.error(`✖ ${pipelineFile} has no job list; run npm run verify for the pipeline check's findings.`);
  process.exit(1);
}
const { folded, errors } = readEpisodeLog(slug);
for (const error of errors) console.error(`! ${error}`);
const gh = (args: readonly string[]): string => execFileSync('gh', args, { encoding: 'utf8' });
console.log(renderStatus(runStatus(pipeline, folded, { ...gateReaders(slug, { read, gh }), now: new Date().toISOString() })));
