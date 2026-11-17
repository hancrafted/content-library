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
import { skillProblems } from './workflow-loader-skills.pure.ts';
import { fileInMode } from './workflow-mode.pure.ts';
import { MODES, type WorkflowFile } from './workflow-schema.types.ts';
import { shapeProblems } from './workflow-shape.pure.ts';

// decision: ARCH-001 §1
export type FileResult = { readonly file: WorkflowFile } | { readonly problems: readonly string[] };

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

function modeProblems(file: WorkflowFile): string[] {
  const marked = file.stages.some((stage) => stage.only !== undefined);
  const views = marked ? MODES.map((mode) => fileInMode(file, mode)) : [file];
  return views.flatMap((view) => [
    ...singletonProblems(view),
    ...foreachProblems(view),
    ...jobOrderProblems(view),
    ...contentProblems(view),
    ...optionalProblems(view),
    ...skillProblems(view),
  ]);
}
