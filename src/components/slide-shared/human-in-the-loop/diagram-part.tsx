import { DiagramStages } from './diagram-stages';
import type { DiagramProps } from './human-in-the-loop.types';

/**
 * The diagram part: the Workflow's stages and jobs, with the Slide's own markers, notes and popovers laid in by
 * `slots`. Under each stage column sits its "Try it" button, which opens the stage's modal; a readonly Preset has none.
 */
export function DiagramPart(props: DiagramProps) {
  return <DiagramStages {...props} />;
}
