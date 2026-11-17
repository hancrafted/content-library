import { stringify } from 'yaml';
import type { Workflow } from './workflow.types';

const WORKFLOW_FILE_TYPE = 'application/x-yaml';

export function workflowFile(workflow: Workflow): {
  readonly name: string;
  readonly text: string;
  readonly type: string;
} {
  const slug = workflow.id.replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '') || 'workflow';
  return {
    name: `${slug}.yml`,
    text: stringify(workflow.file),
    type: WORKFLOW_FILE_TYPE,
  };
}
