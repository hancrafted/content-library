'use client';

import { DiagramStages } from './diagram-stages';
import type { DiagramProps } from './human-in-the-loop.types';

/**
 * The diagram part: the Workflow's stages and jobs in the Watch look, with the Slide's own markers, notes and
 * popovers laid in by `slots`. In Try mode each job also gets its step number and guide from the parent's view, as a
 * button that opens the job.
 */
export function DiagramPart({ workflow, view, slots, words, openJobId, onOpenJob }: DiagramProps) {
  const opener = { openJobId, onOpenJob };
  return <DiagramStages workflow={workflow} view={view} slots={slots} words={words} opener={opener} />;
}
