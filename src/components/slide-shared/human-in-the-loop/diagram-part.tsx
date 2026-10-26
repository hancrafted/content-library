import { DiagramPresentation } from './diagram-presentation';
import type { DiagramProps } from './human-in-the-loop.types';

/**
 * The diagram part: the Workflow in the chosen view, with the Slide's own markers, notes and popovers laid in by
 * `slots`. Under each stage column sits its "Try it" button, which opens the stage's modal; a readonly Preset has none.
 * Detailed (#384) and Hands-on (#385) are not built yet: until they are, every view draws the Presentation cards.
 */
export function DiagramPart(props: DiagramProps) {
  return <DiagramPresentation {...props} />;
}
