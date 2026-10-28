import { DiagramJobs } from './diagram-jobs';
import { DiagramStages } from './diagram-stages';
import type { DiagramProps } from './human-in-the-loop.types';

/**
 * The diagram part: the Workflow in the chosen view, with the Slide's own markers, notes and popovers laid in by
 * `slots`. Stages draws a card per stage with a "Practice it" button under each column; Jobs draws every job as a card
 * inside its stage, and a press on a job opens the stage's modal at it. A readonly Preset has no buttons. Once the
 * run has work (`run` is given), both views show the viewer's progress from the run model.
 */
export function DiagramPart(props: DiagramProps) {
  if (props.view === 'stages') return <DiagramStages {...props} />;
  return <DiagramJobs {...props} />;
}
