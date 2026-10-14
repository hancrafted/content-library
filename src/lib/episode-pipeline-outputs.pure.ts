/*
 * What a new-episode pipeline job writes: where its outputs sit, whether they are expanded to one file each, and
 * whether a job writing markdown queries the rules' intents first. Called by the schema check in
 * episode-pipeline.pure.ts for each job.
 */

import { unless } from './finding.pure';
import { stringsOf, type Mapping } from './mapping-fields.pure';

/** Where a job's outputs must sit, and whether the pipeline is an approved per-run one with every `foreach` expanded. */
export interface OutputScope {
  staging: string;
  expanded: boolean;
}

/**
 * An approved per-run pipeline has no `foreach` and no glob output; the draft
 * scaffold keeps them until customize-pipeline expands them. Every output sits
 * in the staging folder, and a job writing markdown runs
 * `mh-query` before its implementor, so the implementor follows the rules'
 * intents; a job writing none has nothing to query.
 */
export function checkOutputs(where: string, job: Mapping, { staging, expanded }: OutputScope): string[] {
  const outputs = stringsOf(job.outputs);
  const markdown = outputs.some((output) => output.endsWith('.md'));
  const queries = stringsOf(job.before).includes('mh-query');
  return [
    ...unless(
      !expanded || !Object.hasOwn(job, 'foreach'),
      `${where} has foreach; an approved per-run pipeline names one job per item, which customize-pipeline expands.`,
    ),
    ...outputs
      .filter((output) => expanded && output.includes('*'))
      .map((output) => `${where} writes "${output}", a glob; an approved per-run pipeline names each file.`),
    ...outputs
      .filter((output) => !output.startsWith(`${staging}/`))
      .map((output) => `${where} writes "${output}", outside its staging folder ${staging}.`),
    ...unless(
      !markdown || queries,
      `${where} writes markdown but lacks before: [mh-query]; its implementor queries each output's intents before writing it.`,
    ),
    ...unless(
      markdown || !queries,
      `${where} has before: [mh-query] but writes no markdown, so it has nothing to query.`,
    ),
  ];
}
