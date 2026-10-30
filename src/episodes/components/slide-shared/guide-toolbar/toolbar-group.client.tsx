'use client';

import { usePagePick, type PickName } from '@/episodes/hooks/use-page-pick';
import { AGENT_MARKS, OS_MARKS } from '@/shared/components/core-components/chat-icons/chat-icons';
import { cn } from '@/shared/lib/utils';
import { useId } from 'react';

export type { PickName };

/** One option of a group: the value the page shares and the product name the button shows. */
export interface ToolbarOption {
  readonly id: string;
  readonly name: string;
}

export interface ToolbarGroupProps {
  /** Which page-wide pick the group sets. */
  readonly pick: PickName;
  readonly label: string;
  readonly options: readonly ToolbarOption[];
  readonly fallback: string;
  /** Whether this Slide's content differs by the pick; the other group stays in place, dimmed and not operable. */
  readonly active: boolean;
}

type Mark = (props: { className?: string }) => React.JSX.Element;

const MARKS: Readonly<Record<PickName, Readonly<Partial<Record<string, Mark>>>>> = { os: OS_MARKS, agent: AGENT_MARKS };

interface OptionProps {
  readonly group: string;
  readonly pick: PickName;
  readonly option: ToolbarOption;
  readonly checked: boolean;
  readonly disabled: boolean;
  readonly onPick: (id: string) => void;
}

/**
 * One option: a native radio, hidden, inside its pill, so the arrow keys move the pick. The mark and the name from `md`
 * up; a phone shows the mark alone, named by `aria-label`. An option with no mark always shows its name.
 */
function Option({ group, pick, option, checked, disabled, onPick }: OptionProps) {
  const Mark = MARKS[pick][option.id];
  return (
    <label
      className={cn(
        'inline-flex min-h-9 items-center gap-2 rounded-full px-3 py-1 text-caption has-focus-visible:ring-2 has-focus-visible:ring-ring',
        disabled ? 'cursor-default' : 'cursor-pointer hover:text-foreground',
        checked ? 'bg-card font-semibold text-foreground shadow-sm' : 'text-muted-foreground',
        checked && pick === 'agent' && 'ring-1 ring-ai/50',
      )}
    >
      <input
        type="radio"
        name={group}
        value={option.id}
        checked={checked}
        disabled={disabled}
        aria-label={option.name}
        onChange={() => onPick(option.id)}
        className="sr-only"
      />
      {Mark && <Mark className="size-4 shrink-0" />}
      <span className={Mark ? 'hidden md:inline' : undefined} aria-hidden="true">
        {option.name}
      </span>
    </label>
  );
}

/**
 * One group of the Guide toolbar, a radiogroup on the page-wide pick (`usePagePick`, FE-001 §1, transient): every
 * Slide of the Guide follows it and a reload forgets it. An inactive group stays drawn, `aria-disabled`.
 */
export function ToolbarGroup({ pick, label, options, fallback, active }: ToolbarGroupProps) {
  const [value, setValue] = usePagePick(pick, fallback);
  const group = useId();
  const checked = options.some((option) => option.id === value) ? value : fallback;
  return (
    <div className={cn('flex flex-wrap items-center gap-3', !active && 'opacity-50')}>
      <span className="text-caption text-muted-foreground">{label}</span>
      <div
        role="radiogroup"
        aria-label={label}
        aria-disabled={!active}
        data-pick={pick}
        className="inline-flex flex-wrap gap-1 rounded-3xl border border-border bg-muted p-1"
      >
        {options.map((option) => (
          <Option
            key={option.id}
            group={group}
            pick={pick}
            option={option}
            checked={option.id === checked}
            disabled={!active}
            onPick={setValue}
          />
        ))}
      </div>
    </div>
  );
}
