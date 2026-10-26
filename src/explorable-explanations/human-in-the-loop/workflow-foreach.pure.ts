import { readTemplate } from './markdown-handoff.pure';
import { producersBefore } from './workflow-outputs.pure';
import type { ForeachDef, StageDef, WorkflowFile } from './workflow-schema.types';

/*
 * What a repeated stage repeats over: `over` reads `<output>#<h2 slug>`. The output is one an earlier stage hands on;
 * the slug names an H2 of the template of the job that hands it on. Each H3 under that H2 in the pasted result is a
 * round. A heading's slug is its lowercase words joined by dashes.
 */

/** A heading as a slug: lowercase, every run of other characters one dash, none at the ends. */
export const slugOf = (heading: string): string =>
  heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

/** The output and the H2 slug of an `over`, or none when it is not written `output#slug`. */
export function overOf(foreach: ForeachDef): { output: string; slug: string } | undefined {
  const [output, slug, ...rest] = foreach.over.split('#');
  if (!output || !slug || rest.length > 0) return undefined;
  return { output, slug };
}

function overProblems(file: WorkflowFile, stage: StageDef, index: number): string[] {
  const foreach = stage.foreach as ForeachDef;
  const where = `Stage "${stage.id}" repeats over "${foreach.over}"`;
  const over = overOf(foreach);
  if (!over) return [`${where}; write it as <output>#<h2 slug>.`];
  const producer = producersBefore(file, index).get(over.output);
  if (!producer) return [`${where}, but no earlier stage hands on "${over.output}".`];
  const template = file.templates[producer.task.template];
  const slugs = readTemplate(template ?? '').h2.map(slugOf);
  return slugs.includes(over.slug) ? [] : [`${where}, but the template of "${over.output}" has no H2 "${over.slug}".`];
}

/** Every repeated stage's `over`: written as `output#slug`, an earlier output, and an H2 of that output's template. */
export const foreachProblems = (file: WorkflowFile): string[] =>
  file.stages.flatMap((stage, index) => (stage.foreach ? overProblems(file, stage, index) : []));
