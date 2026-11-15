import { parse } from 'yaml';
import { foreachProblems } from './workflow-foreach.pure.ts';
import {
  contentProblems,
  idProblems,
  reviewerProblems,
  techniqueProblems,
  templateProblems,
} from './workflow-loader-checks.pure.ts';
import { jobOrderProblems, singletonProblems } from './workflow-loader-jobs.pure.ts';
import { optionalProblems } from './workflow-loader-optional.pure.ts';
import { fileInMode } from './workflow-mode.pure.ts';
import { MODES, type WorkflowFile } from './workflow-schema.types.ts';
import { shapeProblems } from './workflow-shape.pure.ts';

/*
 * The loading seam of the new Workflow schema: one YAML text, written in one language, into a WorkflowFile or into
 * every problem found, one sentence each. The old schema loads through `workflow.pure.ts`, beside this one, until
 * the German files move over. Hand-written validation, no zod (ARCH-001).
 */

export type FileResult = { readonly file: WorkflowFile } | { readonly problems: readonly string[] };

/** Whether a parsed document is written in the new schema: it carries `templates`. */
export const isNewSchema = (source: string): boolean => {
  try {
    const doc: unknown = parse(source);
    return typeof doc === 'object' && doc !== null && 'templates' in doc;
  } catch {
    return false;
  }
};

export function loadWorkflow(source: string): FileResult {
  let doc: unknown;
  try {
    doc = parse(source);
  } catch {
    return { problems: ['The file is not valid YAML.'] };
  }
  const shape = shapeProblems(doc);
  if (shape.length > 0) return { problems: shape };
  const file = doc as WorkflowFile;
  const problems = [
    ...templateProblems(file),
    ...idProblems(file),
    ...techniqueProblems(file),
    ...reviewerProblems(file),
    ...modeProblems(file),
  ];
  const unique = [...new Set(problems)];
  return unique.length > 0 ? { problems: unique } : { file };
}

/**
 * Everything that reads a chain of stages, run on the file as each mode runs it: a stage marked for one mode is checked
 * only among the stages of that mode, so a dependency on a stage of the other mode is refused. A file with no marked
 * stage is the same in both modes and is checked once.
 */
function modeProblems(file: WorkflowFile): string[] {
  const marked = file.stages.some((stage) => stage.only !== undefined);
  const views = marked ? MODES.map((mode) => fileInMode(file, mode)) : [file];
  return views.flatMap((view) => [
    ...singletonProblems(view),
    ...foreachProblems(view),
    ...jobOrderProblems(view),
    ...contentProblems(view),
    ...optionalProblems(view),
  ]);
}
