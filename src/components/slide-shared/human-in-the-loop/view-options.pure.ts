import type { UiWords } from './human-in-the-loop.types';
import type { View } from './workflow-state.pure';

export interface ViewOption {
  readonly view: View;
  readonly label: string;
  /** Built yet? A view that is not stays in the control, disabled, so the three-way shape is already visible. */
  readonly enabled: boolean;
  /** The tooltip of a disabled view. */
  readonly tip?: string;
}

/** The views the diagram can show: Presentation now; Detailed (#384) and Hands-on (#385) are drawn disabled until they exist. */
export function viewOptions(
  words: Pick<UiWords, 'viewPresentation' | 'viewDetailed' | 'viewHandson' | 'viewSoon'>,
): readonly ViewOption[] {
  return [
    { view: 'presentation', label: words.viewPresentation, enabled: true },
    { view: 'detailed', label: words.viewDetailed, enabled: false, tip: words.viewSoon },
    { view: 'handson', label: words.viewHandson, enabled: false, tip: words.viewSoon },
  ];
}
