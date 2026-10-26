'use client';

import { cn } from '@/lib/utils';
import type { UiWords } from './human-in-the-loop.types';
import { viewOptions, type ViewOption } from './view-options.pure';
import type { View } from './workflow-state.pure';

interface ViewControlProps {
  readonly words: UiWords;
  readonly view: View;
  readonly onView: (view: View) => void;
}

function Segment({ option, on, onPick }: { option: ViewOption; on: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      data-view-option={option.view}
      onClick={onPick}
      className={cn(
        'h-full rounded-full px-3 text-caption font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'cursor-pointer',
        on ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:text-foreground',
      )}
    >
      {option.label}
    </button>
  );
}

/** The three-way view control: one pressed segment at a time, named by `words.view`. */
export function ViewControl({ words, view, onView }: ViewControlProps) {
  return (
    <div
      role="group"
      aria-label={words.view}
      data-control="view"
      className="inline-flex h-9 items-center rounded-full border bg-background p-[3px]"
    >
      {viewOptions(words).map((option) => (
        <Segment key={option.view} option={option} on={option.view === view} onPick={() => onView(option.view)} />
      ))}
    </div>
  );
}
