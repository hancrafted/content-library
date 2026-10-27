import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group';
import { cn } from '@/shared/lib/utils';

/** One filter choice: its id, its name and how many items carry it. */
export interface ToggleOption {
  readonly id: string;
  readonly label: string;
  readonly count: number;
}

interface TagTogglesProps {
  options: readonly ToggleOption[];
  selected: readonly string[];
  /** The group's accessible name ("Filter by tag"). */
  label: string;
  onChange: (selected: string[]) => void;
}

/**
 * A multi-select filter: one toggle per option with its count, wrapping on a narrow screen; none on shows everything.
 * Built on the shadcn toggle group, which gives it roving focus and each toggle its pressed state.
 */
export function TagToggles({ options, selected, label, onChange }: TagTogglesProps) {
  return (
    <ToggleGroup type="multiple" aria-label={label} value={[...selected]} onValueChange={onChange}>
      {options.map((option) => (
        <ToggleGroupItem
          key={option.id}
          value={option.id}
          data-filter-tag={option.id}
          className={cn(option.count === 0 && !selected.includes(option.id) && 'opacity-50')}
        >
          {option.label}
          <span className="tabular-nums opacity-60">{option.count}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
