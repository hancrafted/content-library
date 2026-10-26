import type { UiWords } from './human-in-the-loop.types';
import type { SegmentOption } from './segment-option.types';
import type { View } from './workflow-state.pure';

/** The views the diagram can show, in the order of the control: Presentation, Detailed, Hands-on. */
export function viewOptions(
  words: Pick<UiWords, 'viewPresentation' | 'viewDetailed' | 'viewHandson'>,
): readonly SegmentOption<View>[] {
  return [
    { value: 'presentation', label: words.viewPresentation },
    { value: 'detailed', label: words.viewDetailed },
    { value: 'handson', label: words.viewHandson },
  ];
}
