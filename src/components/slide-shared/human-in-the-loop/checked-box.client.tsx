'use client';

import type { SlotState } from './step-kit.types';

interface CheckedBoxProps {
  /** The result key the box writes to: set to `mark` when ticked, emptied when not. */
  readonly name: string;
  readonly label: string;
  readonly slots: SlotState;
  /** What a ticked box writes; the run model reads any text as set. */
  readonly mark?: string;
}

/** A labelled checkbox on one result key: a final job's "done", or a review's "I checked this result". */
export function CheckedBox({ name, label, slots, mark = 'checked' }: CheckedBoxProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-body">
      <input
        type="checkbox"
        className="size-4 accent-primary"
        checked={(slots.values[name] ?? '').trim() !== ''}
        onChange={(event) => slots.onChange({ ...slots.values, [name]: event.target.checked ? mark : '' })}
      />
      {label}
    </label>
  );
}
