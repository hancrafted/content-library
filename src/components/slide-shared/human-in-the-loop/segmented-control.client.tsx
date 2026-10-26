'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { SegmentOption } from './segment-option.types';

interface SegmentedControlProps<T extends string> {
  /** The control's name: its `data-control`, and the `data-<name>-option` each segment carries. */
  readonly name: string;
  /** The accessible name of the group. */
  readonly label: string;
  readonly options: readonly SegmentOption<T>[];
  readonly value: T;
  readonly onValue: (value: T) => void;
}

function Segment<T extends string>(props: { name: string; option: SegmentOption<T>; on: boolean; onPick: () => void }) {
  const { name, option, on, onPick } = props;
  const button = (
    <button
      type="button"
      aria-pressed={on}
      {...{ [`data-${name}-option`]: option.value }}
      onClick={onPick}
      className={cn(
        'h-full cursor-pointer rounded-full px-3 text-caption font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50',
        on ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:text-foreground',
      )}
    >
      {option.label}
    </button>
  );
  if (option.tip === undefined) return button;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{option.tip}</TooltipContent>
    </Tooltip>
  );
}

/** A pill of segments, one pressed at a time: the one control the view and the Chat · CLI choice are both drawn with. */
export function SegmentedControl<T extends string>({ name, label, options, value, onValue }: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      data-control={name}
      className="inline-flex h-9 items-center rounded-full border bg-background p-[3px]"
    >
      {options.map((option) => (
        <Segment
          key={option.value}
          name={name}
          option={option}
          on={option.value === value}
          onPick={() => onValue(option.value)}
        />
      ))}
    </div>
  );
}
