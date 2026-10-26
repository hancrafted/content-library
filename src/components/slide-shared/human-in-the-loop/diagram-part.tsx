import { DiagramDetailed } from './diagram-detailed';
import { DiagramPresentation } from './diagram-presentation';
import type { DiagramProps } from './human-in-the-loop.types';

/**
 * The diagram part: the Workflow in the chosen view, with the Slide's own markers, notes and popovers laid in by
 * `slots`. Presentation draws a card per stage with a "Try it" button under each column; Detailed draws every job as a
 * card inside its stage, and a press on a job opens the stage's modal at it. A readonly Preset has no buttons. Hands-on is
 * the Detailed layout with the viewer's progress from the run model laid over it.
 */
export function DiagramPart(props: DiagramProps) {
  if (props.view === 'presentation') return <DiagramPresentation {...props} />;
  return <DiagramDetailed {...props} view={props.view} />;
}
