import { unless } from './finding.pure';
import { stringsOf, type Mapping } from './mapping-fields.pure';

export interface OutputScope {
  staging: string;
  expanded: boolean;
}

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
