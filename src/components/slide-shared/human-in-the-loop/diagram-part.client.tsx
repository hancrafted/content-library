'use client';

import { DiagramStages } from './diagram-stages';
import type { DiagramProps } from './human-in-the-loop.types';

/**
 * The diagram part: the Workflow's stages and jobs in the Watch look, with the Slide's own markers, notes and
 * popovers laid in by `slots`. Try-mode affordances (opening a job) come from the hands-on ticket.
 */
export function DiagramPart({ workflow, slots, words }: DiagramProps) {
  return <DiagramStages workflow={workflow} slots={slots} words={words} />;
}
