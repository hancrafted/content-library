import type { TagOption } from '@/components/landing/episode-browse.pure';
import { Button } from '@/components/ui/button';
import type { TagId } from '@/content-store/schemas/fields';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import type { Ref } from 'react';

/** The strings the search box and the Tag filter draw. */
export interface FilterLabels {
  readonly search: string;
  readonly searchPlaceholder: string;
  readonly tagFilter: string;
}

/** The search box: a labelled field whose every keystroke narrows the grid below it. */
export function SearchBox({
  query,
  labels,
  onChange,
  inputRef,
}: {
  query: string;
  labels: FilterLabels;
  onChange: (query: string) => void;
  inputRef?: Ref<HTMLInputElement>;
}) {
  return (
    <label className="relative block w-full sm:w-72 sm:shrink-0">
      <span className="sr-only">{labels.search}</span>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        ref={inputRef}
        type="search"
        data-episode-search
        value={query}
        placeholder={labels.searchPlaceholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-full border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50"
      />
    </label>
  );
}

interface ChipProps {
  label: string;
  count: number;
  pressed: boolean;
  onPress: () => void;
}

const PRESSED_CHIP =
  'border-selected bg-selected text-selected-foreground hover:bg-selected hover:text-selected-foreground dark:border-selected dark:bg-selected dark:hover:bg-selected';
const IDLE_CHIP = 'text-muted-foreground hover:border-foreground/40 hover:bg-background hover:text-foreground';

/** A Tag chip: a toggle button, so its name stays put and `aria-pressed` carries the state. */
function TagChip({ label, count, pressed, onPress }: ChipProps) {
  return (
    <Button
      type="button"
      variant="outline"
      aria-pressed={pressed}
      onClick={onPress}
      className={cn(
        'h-auto rounded-full px-3.5 py-1.5 text-sm shadow-none motion-reduce:transition-none',
        pressed ? PRESSED_CHIP : IDLE_CHIP,
        count === 0 && !pressed && 'opacity-50',
      )}
    >
      {label}
      <span className={cn('text-xs tabular-nums', pressed ? 'opacity-70' : 'opacity-60')}>{count}</span>
    </Button>
  );
}

interface TagChipsProps {
  options: readonly TagOption[];
  selected: readonly TagId[];
  labels: FilterLabels;
  onToggle: (id: TagId) => void;
}

/** The Tag filter: one multi-select chip per filter Tag with its count, wrapping on a narrow screen; none pressed shows everything. */
export function TagChips({ options, selected, labels, onToggle }: TagChipsProps) {
  return (
    <div role="group" aria-label={labels.tagFilter} className="flex flex-wrap gap-2">
      {options.map((option) => (
        <TagChip
          key={option.id}
          label={option.label}
          count={option.count}
          pressed={selected.includes(option.id)}
          onPress={() => onToggle(option.id)}
        />
      ))}
    </div>
  );
}
