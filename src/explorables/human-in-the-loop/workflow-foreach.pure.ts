import { readTemplate } from './markdown-handoff.pure.ts';
import { producersBefore, templateOf } from './workflow-outputs.pure.ts';
import type { ForeachDef, StageDef, WorkflowFile } from './workflow-schema.types';

export const slugOf = (heading: string): string =>
  heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

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
  const slugs = readTemplate(templateOf(file, producer.task)).h2.map(slugOf);
  return slugs.includes(over.slug) ? [] : [`${where}, but the template of "${over.output}" has no H2 "${over.slug}".`];
}

export const foreachProblems = (file: WorkflowFile): string[] =>
  file.stages.flatMap((stage, index) => (stage.foreach ? overProblems(file, stage, index) : []));
