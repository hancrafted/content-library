'use client';

import type { UiWords } from './human-in-the-loop.types';
import { levelOptions } from './level-options.pure';
import { SegmentedControl } from './segmented-control.client';
import type { Level } from './workflow-state.pure';

interface LevelControlProps {
  readonly words: UiWords;
  readonly level: Level;
  readonly onLevel: (level: Level) => void;
}

/** The two-way "Chat · CLI" segmented control: one pressed segment at a time, named by `words.level`. */
export function LevelControl({ words, level, onLevel }: LevelControlProps) {
  return (
    <SegmentedControl name="level" label={words.level} options={levelOptions(words)} value={level} onValue={onLevel} />
  );
}
