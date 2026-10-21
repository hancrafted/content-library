'use client';

import { DiagramStages } from './diagram-stages';
import type { DiagramProps } from './human-in-the-loop.types';
import { workflowView } from './workflow-view.pure';

/**
 * The diagram part: the Workflow's stages and jobs in the Watch look, with the Slide's own markers, notes and
 * popovers laid in by `slots`. In Try mode each job also gets its step number and guide from `workflowView`, as a
 * button that opens the job.
 */
export function DiagramPart({ workflow, slots, words, mode, level, openJobId, onOpenJob }: DiagramProps) {
  const view = workflowView(workflow, { mode, level });
  const open = { openJobId, onOpenJob };
  return <DiagramStages workflow={workflow} slots={slots} words={words} view={view} open={open} />;
}
