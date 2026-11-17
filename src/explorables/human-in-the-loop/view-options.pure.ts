import type { UiWords } from './human-in-the-loop.types';
import type { SegmentOption } from './segment-option.types';
import type { View } from './workflow-state.pure';

export function viewOptions(
  words: Pick<UiWords, 'viewStages' | 'viewStagesTip' | 'viewJobs' | 'viewJobsTip'>,
): readonly SegmentOption<View>[] {
  return [
    { value: 'stages', label: words.viewStages, tip: words.viewStagesTip },
    { value: 'jobs', label: words.viewJobs, tip: words.viewJobsTip },
  ];
}
