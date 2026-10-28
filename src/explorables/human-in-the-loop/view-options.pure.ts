import type { UiWords } from './human-in-the-loop.types';
import type { SegmentOption } from './segment-option.types';
import type { View } from './workflow-state.pure';

/** The views the diagram can show, in the order of the control: Stages (the high-level view), Jobs (the detailed one). */
export function viewOptions(
  words: Pick<UiWords, 'viewStages' | 'viewStagesTip' | 'viewJobs' | 'viewJobsTip'>,
): readonly SegmentOption<View>[] {
  return [
    { value: 'stages', label: words.viewStages, tip: words.viewStagesTip },
    { value: 'jobs', label: words.viewJobs, tip: words.viewJobsTip },
  ];
}
