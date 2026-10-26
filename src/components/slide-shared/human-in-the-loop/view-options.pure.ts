import type { UiWords } from './human-in-the-loop.types';
import type { View } from './workflow-state.pure';

export interface ViewOption {
  readonly view: View;
  readonly label: string;
}

/** The views the diagram can show, in the order of the control: Presentation, Detailed, Hands-on. */
export function viewOptions(
  words: Pick<UiWords, 'viewPresentation' | 'viewDetailed' | 'viewHandson'>,
): readonly ViewOption[] {
  return [
    { view: 'presentation', label: words.viewPresentation },
    { view: 'detailed', label: words.viewDetailed },
    { view: 'handson', label: words.viewHandson },
  ];
}
