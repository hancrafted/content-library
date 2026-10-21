import { workflowToYaml } from './workflow-yaml.pure';
import type { Workflow } from './workflow.types';

/* What the download control hands out: the Workflow as YAML under a name, loadable again by the upload control. */

const WORKFLOW_FILE_TYPE = 'application/x-yaml';

/** The file a download saves: the Workflow's id as a safe name, and its YAML text. */
export function workflowFile(workflow: Workflow): {
  readonly name: string;
  readonly text: string;
  readonly type: string;
} {
  const slug = workflow.id.replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '') || 'workflow';
  return { name: `${slug}.yml`, text: workflowToYaml(workflow), type: WORKFLOW_FILE_TYPE };
}
