'use client';

import { usePagePick, type PickName } from '@/episodes/hooks/use-page-pick';
import { cn } from '@/shared/lib/utils';

/** One segmented pill group of the toolbar: which page-wide pick it sets, its name and its options in order. */
export interface PickGroupProps {
  readonly name: PickName;
  readonly label: string;
  readonly fallback: string;
  readonly options: readonly { readonly value: string; readonly label: string }[];
  /** The AI-agent group marks its picked pill with the `ai` edge (Visual language, Accent). */
  readonly ai?: boolean;
}

/** One pill of a group: pressed when it is the page's pick. */
function PickPill({ label, picked, ai, onPick }: { label: string; picked: boolean; ai: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={picked}
      onClick={onPick}
      className={cn(
        'min-h-9 cursor-pointer rounded-full px-4 py-1.5 text-caption outline-none focus-visible:ring-2 focus-visible:ring-ring',
        picked ? 'bg-card font-semibold text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
        picked && ai && 'ring-2 ring-ai/40',
      )}
    >
      {label}
    </button>
  );
}

/**
 * The Visual language's toolbar group: segmented pills, the picked one raised on a card. The pick is the page's
 * (`usePagePick`), transient, so every step Slide shows the same OS and AI agent and a reload starts fresh.
 */
export function PickGroup({ name, label, fallback, options, ai = false }: PickGroupProps) {
  const [value, setValue] = usePagePick(name, fallback);
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex flex-wrap rounded-full border border-border bg-muted p-1"
    >
      {options.map((option) => (
        <PickPill
          key={option.value}
          label={option.label}
          picked={option.value === value}
          ai={ai}
          onPick={() => setValue(option.value)}
        />
      ))}
    </div>
  );
}
