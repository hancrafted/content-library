import { parse } from 'yaml';
import {
  contentProblems,
  idProblems,
  reviewerProblems,
  techniqueProblems,
  templateProblems,
} from './workflow-loader-checks.pure';
import { jobOrderProblems } from './workflow-loader-jobs.pure';
import type { WorkflowFile } from './workflow-schema.types';
import { shapeProblems } from './workflow-shape.pure';

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
    ...jobOrderProblems(file),
    ...contentProblems(file),
  ];
  return problems.length > 0 ? { problems } : { file };
}
