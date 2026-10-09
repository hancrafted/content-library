import { ALL, type Facet, type FacetChoices } from '@/components/landing/episode-browse.pure';
import { SEGMENTED_GROUP, segmentedItem } from '@/components/segmented';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Ref } from 'react';

/** The strings the two filters draw. */
export interface FilterLabels {
  readonly topicFilter: string;
  readonly formatFilter: string;
  readonly all: string;
}

interface FilterProps<Id extends string> {
  choices: FacetChoices<Id>;
  selected: Facet<Id>;
  labels: FilterLabels;
  onSelect: (id: Facet<Id>) => void;
}

interface ChipProps {
  label: string;
  count: number;
  pressed: boolean;
  onPress: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
}

const PRESSED_CHIP =
  'border-selected bg-selected text-selected-foreground hover:bg-selected hover:text-selected-foreground dark:border-selected dark:bg-selected dark:hover:bg-selected';
const IDLE_CHIP = 'text-muted-foreground hover:border-foreground/40 hover:bg-background hover:text-foreground';

/** A single-select Topic chip: a toggle button, so its name stays put and `aria-pressed` carries the state. */
function TopicChip({ label, count, pressed, onPress, buttonRef }: ChipProps) {
  return (
    <Button
      ref={buttonRef}
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

/** The Topic filter: the all-chip, then one chip per Topic with its count, wrapping on a narrow screen. */
export function TopicChips<Id extends string>({
  choices,
  selected,
  labels,
  onSelect,
  allRef,
}: FilterProps<Id> & { allRef: Ref<HTMLButtonElement> }) {
  return (
    <div role="group" aria-label={labels.topicFilter} className="flex flex-wrap gap-2">
      <TopicChip
        buttonRef={allRef}
        label={labels.all}
        count={choices.all}
        pressed={selected === ALL}
        onPress={() => onSelect(ALL)}
      />
      {choices.options.map((option) => (
        <TopicChip
          key={option.id}
          label={option.label}
          count={option.count}
          pressed={selected === option.id}
          onPress={() => onSelect(option.id)}
        />
      ))}
    </div>
  );
}

/** The Format filter: a compact segmented control in the header's pill look, one toggle per Format plus all. */
export function FormatSegments<Id extends string>({ choices, selected, labels, onSelect }: FilterProps<Id>) {
  const items: { id: Facet<Id>; label: string; count: number }[] = [
    { id: ALL, label: labels.all, count: choices.all },
    ...choices.options,
  ];
  return (
    <div role="group" aria-label={labels.formatFilter} className={SEGMENTED_GROUP}>
      {items.map((item) => (
        <Button
          key={item.id}
          type="button"
          size="sm"
          variant="ghost"
          aria-pressed={selected === item.id}
          onClick={() => onSelect(item.id)}
          className={cn(
            'h-7 px-3 text-xs motion-reduce:transition-none',
            segmentedItem(selected === item.id),
            item.count === 0 && selected !== item.id && 'opacity-50',
          )}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
