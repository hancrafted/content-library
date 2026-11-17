import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group';
import { cn } from '@/shared/lib/utils';

export interface ToggleOption {
  readonly id: string;
  readonly label: string;
  readonly count: number;
}

interface TagTogglesProps {
  options: readonly ToggleOption[];
  selected: readonly string[];
  label: string;
  onChange: (selected: string[]) => void;
}

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
