'use client';

import { usePagePick, type PickName } from '@/episodes/hooks/use-page-pick';
import { cn } from '@/shared/lib/utils';
import { AGENTS, DEFAULT_AGENT, DEFAULT_OS, OPERATING_SYSTEMS, type PickOption } from './picks.pure';

const PICKS: Readonly<Record<PickName, { options: readonly PickOption[]; fallback: string }>> = {
  os: { options: OPERATING_SYSTEMS, fallback: DEFAULT_OS },
  agent: { options: AGENTS, fallback: DEFAULT_AGENT },
};

/** One pill of a segmented row; the picked AI agent carries the `ai` dot and glow, its one place on the toolbar. */
function Segment({
  option,
  on,
  agent,
  onPick,
}: {
  option: PickOption;
  on: boolean;
  agent: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onPick}
      className={cn(
        'inline-flex min-h-8 cursor-pointer items-center gap-2 rounded-full px-4 py-1 text-caption outline-none focus-visible:ring-2 focus-visible:ring-ring',
        on ? 'bg-card font-semibold text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
        on && agent && 'shadow-md shadow-ai/30 ring-1 ring-ai/50',
      )}
    >
      {on && agent ? <span className="size-2 rounded-full bg-ai" aria-hidden="true" /> : null}
      {option.name}
    </button>
  );
}

/** One segmented pill row: the page-wide pick it sets, shown on every Slide of the page at once. */
function Segmented({ name, label }: { name: PickName; label: string }) {
  const { options, fallback } = PICKS[name];
  const [value, setValue] = usePagePick(name, fallback);
  const picked = options.some((option) => option.id === value) ? value : fallback;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-caption text-muted-foreground">{label}</span>
      <div
        role="group"
        aria-label={label}
        data-pick={name}
        className="flex flex-wrap rounded-3xl border border-border bg-muted p-1"
      >
        {options.map((option) => (
          <Segment
            key={option.id}
            option={option}
            on={option.id === picked}
            agent={name === 'agent'}
            onPick={() => setValue(option.id)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * The toolbar above a step card (Visual language "The toolbar"): the operating system and the AI agent as segmented
 * pills, only the picks this Slide's content differs by. A pick here sets it for the whole page.
 */
export function PickToolbar({
  show,
  labels,
}: {
  show: readonly PickName[];
  labels: Readonly<Record<PickName, string>>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3" data-pick-toolbar="">
      {show.map((name) => (
        <Segmented key={name} name={name} label={labels[name]} />
      ))}
    </div>
  );
}
