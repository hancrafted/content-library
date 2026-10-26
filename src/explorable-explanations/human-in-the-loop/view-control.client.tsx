'use client';

import type { UiWords } from './human-in-the-loop.types';
import { SegmentedControl } from './segmented-control.client';
import { viewOptions } from './view-options.pure';
import type { View } from './workflow-state.pure';

interface ViewControlProps {
  readonly words: UiWords;
  readonly view: View;
  readonly onView: (view: View) => void;
}

/** The three-way view control: one pressed segment at a time, named by `words.view`. */
export function ViewControl({ words, view, onView }: ViewControlProps) {
  return <SegmentedControl name="view" label={words.view} options={viewOptions(words)} value={view} onValue={onView} />;
}
