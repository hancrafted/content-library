import { Input } from '@/shared/components/ui/input';
import { Search } from 'lucide-react';
import type { Ref } from 'react';

interface SearchInputProps {
  query: string;
  /** The field's accessible name, and the hint it shows while empty. */
  label: string;
  placeholder: string;
  onChange: (query: string) => void;
  inputRef?: Ref<HTMLInputElement>;
  /** The field's own data attribute, so each browser keeps its hook (`data-episode-search`, `data-event-search`). */
  data: Record<`data-${string}`, string>;
}

/** A labelled search field on the shadcn input: every keystroke narrows the list below it. */
export function SearchInput({ query, label, placeholder, onChange, inputRef, data }: SearchInputProps) {
  return (
    <label className="relative block w-full sm:w-72 sm:shrink-0">
      <span className="sr-only">{label}</span>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        ref={inputRef}
        type="search"
        {...data}
        value={query}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-full bg-background pr-4 pl-10 shadow-none"
      />
    </label>
  );
}
