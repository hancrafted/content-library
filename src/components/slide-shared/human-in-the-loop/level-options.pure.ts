import type { UiWords } from './human-in-the-loop.types';
import type { SegmentOption } from './segment-option.types';
import type { Level } from './workflow-state.pure';

/**
 * The two-way Chat · CLI control: the stored `renderMode` values stay `simple` and `technical`; this is the one place
 * that maps them to the labels the viewer reads.
 */
// tech-debt: the visual labels simple/technical as Chat/CLI here instead of renaming the values to promptFor chat | cli, https://github.com/hancrafted/content-library/issues/375
export function levelOptions(
  words: Pick<UiWords, 'chat' | 'cli' | 'chatTip' | 'cliTip'>,
): readonly SegmentOption<Level>[] {
  return [
    { value: 'simple', label: words.chat, tip: words.chatTip },
    { value: 'technical', label: words.cli, tip: words.cliTip },
  ];
}
