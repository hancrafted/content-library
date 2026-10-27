'use client';

import { cn } from '@/shared/lib/utils';
import { LEAD_FRAME } from './context-field.client';
import type { SlotState } from './step-kit.types';
import { filled } from './workflow-run.pure';

interface CheckedBoxProps {
  /** The result key the box writes to: set to `mark` when ticked, emptied when not. */
  readonly name: string;
  readonly label: string;
  readonly slots: SlotState;
  /** What a ticked box writes; the run model reads any text as set. */
  readonly mark?: string;
  /** The box is the next thing to tick: framed in the action colour. */
  readonly lead?: boolean;
}

/** A labelled checkbox on one result key: a final job's "done", or a review's "I checked this result". */
export function CheckedBox({ name, label, slots, mark = 'checked', lead = false }: CheckedBoxProps) {
  return (
    <label
      data-lead={lead || undefined}
      className={cn(
        'flex w-fit cursor-pointer items-center gap-2 rounded-md text-body',
        lead && cn('px-2 py-1', LEAD_FRAME),
      )}
    >
      <input
        type="checkbox"
        className="size-4 accent-primary"
        checked={filled(slots.values, name)}
        onChange={(event) => slots.onChange({ ...slots.values, [name]: event.target.checked ? mark : '' })}
      />
      {label}
    </label>
  );
}
