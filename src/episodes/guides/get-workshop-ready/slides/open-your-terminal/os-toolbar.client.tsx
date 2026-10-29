'use client';

import { usePagePick } from '@/episodes/hooks/use-page-pick';
import { cn } from '@/shared/lib/utils';
import { useId } from 'react';
import { DEFAULT_OS, osOf, type OsPick } from './stuck-prompt.pure';

interface OsToolbarProps {
  readonly label: string;
  readonly options: readonly { readonly value: OsPick; readonly label: string }[];
}

interface OptionProps {
  readonly name: string;
  readonly value: OsPick;
  readonly label: string;
  readonly checked: boolean;
  readonly onPick: (value: OsPick) => void;
}

/** One segment: a native radio, hidden, inside its pill. */
function Option({ name, value, label, checked, onPick }: OptionProps) {
  return (
    <label
      className={cn(
        'cursor-pointer rounded-full px-4 py-1.5 has-focus-visible:ring-2 has-focus-visible:ring-ring',
        checked ? 'bg-card font-semibold shadow-sm' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onPick(value)}
        className="sr-only"
      />
      {label}
    </label>
  );
}

/**
 * The Visual language's operating-system toggle: segmented pills, native radios inside, so arrow keys move the pick.
 * The pick is the page's (`usePagePick('os')`), transient, so every Slide of the Guide follows it and a reload forgets
 * it (FE-001).
 */
export function OsToolbar({ label, options }: OsToolbarProps) {
  const [value, setPick] = usePagePick('os', DEFAULT_OS);
  const picked = osOf(value);
  const name = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-muted p-1 text-caption"
    >
      {options.map((option) => (
        <Option key={option.value} name={name} {...option} checked={option.value === picked} onPick={setPick} />
      ))}
    </div>
  );
}
