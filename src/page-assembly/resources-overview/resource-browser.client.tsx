'use client';

import type { TagId } from '@/content-store/schemas/fields';
import { SearchInput } from '@/shared/components/filters/search-input';
import { TagToggles } from '@/shared/components/filters/tag-toggles';
import { Button } from '@/shared/components/ui/button';
import { CARD_GRID } from '@/shared/components/ui/card-grid';
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group';
import type { Locale } from '@/shared/lib/locale.pure';
import { cn } from '@/shared/lib/utils';
import { LayoutGrid, List } from 'lucide-react';
import { useRef, useState } from 'react';
import { ResourceCardView, type ResourceCard } from './resource-card';
import type { ResourceKind } from './resource-index.pure';
import {
  matchingResources,
  NO_SELECTION,
  resourceKindChoices,
  resourceTagChoices,
  type ResourceSelection,
} from './resources-overview.pure';

// decision: FE-006 §4
export interface ResourceBrowserLabels {
  readonly open: string;
  readonly none: string;
  readonly noMatch: string;
  readonly search: string;
  readonly searchPlaceholder: string;
  readonly tagFilter: string;
  readonly kindFilter: string;
  readonly view: string;
  readonly grid: string;
  readonly list: string;
  readonly reset: string;
  readonly kindNames: Readonly<Record<ResourceKind, string>>;
}

type View = 'grid' | 'list';

const NO_SCRIPT_CSS = '[data-resource-controls]{display:none}[data-resource-item][hidden]{display:revert!important}';

interface BrowserProps {
  cards: ResourceCard[];
  vocabulary: readonly TagId[];
  kinds: readonly ResourceKind[];
  locale: Locale;
  labels: ResourceBrowserLabels;
}

// decision: FE-001 §1.3
function useResourceBrowser(cards: readonly ResourceCard[]) {
  const [selection, setSelection] = useState<ResourceSelection>(NO_SELECTION);
  const [view, setView] = useState<View>('grid');
  const search = useRef<HTMLInputElement>(null);
  return {
    selection,
    view,
    search,
    visible: matchingResources(cards, selection),
    active: selection.tags.length > 0 || selection.kinds.length > 0 || selection.query.trim() !== '',
    setQuery: (query: string) => setSelection((prev) => ({ ...prev, query })),
    setTags: (tags: string[]) => setSelection((prev) => ({ ...prev, tags })),
    setKinds: (kinds: string[]) => setSelection((prev) => ({ ...prev, kinds })),
    setView,
    reset: () => {
      setSelection(NO_SELECTION);
      search.current?.focus();
    },
  };
}

type Browse = ReturnType<typeof useResourceBrowser>;

function ViewSwitch({ browse, labels }: { browse: Browse; labels: ResourceBrowserLabels }) {
  return (
    <ToggleGroup
      type="single"
      aria-label={labels.view}
      value={browse.view}
      onValueChange={(next) => next !== '' && browse.setView(next as View)}
      className="sm:ml-auto"
    >
      <ToggleGroupItem value="grid" aria-label={labels.grid} data-resource-view="grid">
        <LayoutGrid aria-hidden />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label={labels.list} data-resource-view="list">
        <List aria-hidden />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

function ResetButton({ browse, label }: { browse: Browse; label: string }) {
  if (!browse.active) return null;
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={browse.reset}
      className="rounded-full text-muted-foreground"
    >
      {label}
    </Button>
  );
}

interface ControlsProps extends Omit<BrowserProps, 'locale'> {
  browse: Browse;
}

function Controls({ browse, cards, vocabulary, kinds, labels }: ControlsProps) {
  return (
    <div data-resource-controls className="flex flex-wrap items-center gap-x-6 gap-y-4">
      <SearchInput
        query={browse.selection.query}
        label={labels.search}
        placeholder={labels.searchPlaceholder}
        onChange={browse.setQuery}
        inputRef={browse.search}
        data={{ 'data-resource-search': '' }}
      />
      <div data-resource-kind-filter>
        <TagToggles
          options={resourceKindChoices(cards, kinds, labels.kindNames)}
          selected={browse.selection.kinds}
          label={labels.kindFilter}
          onChange={browse.setKinds}
        />
      </div>
      <TagToggles
        options={resourceTagChoices(cards, vocabulary)}
        selected={browse.selection.tags}
        label={labels.tagFilter}
        onChange={browse.setTags}
      />
      <ViewSwitch browse={browse} labels={labels} />
      <ResetButton browse={browse} label={labels.reset} />
    </div>
  );
}

// decision: FE-001 §1.3
export function ResourceBrowser({ cards, vocabulary, kinds, locale, labels }: BrowserProps) {
  const browse = useResourceBrowser(cards);
  const empty = cards.length === 0 ? labels.none : browse.visible.size === 0 ? labels.noMatch : null;
  return (
    <div className="space-y-10">
      <noscript>
        <style>{NO_SCRIPT_CSS}</style>
      </noscript>
      <Controls browse={browse} cards={cards} vocabulary={vocabulary} kinds={kinds} labels={labels} />
      <ul
        data-resource-list
        data-view={browse.view}
        className={cn(browse.view === 'grid' ? CARD_GRID : 'flex flex-col gap-4')}
      >
        {cards.map((card) => (
          <li key={card.slug} data-resource-item hidden={!browse.visible.has(card.slug)} className="flex">
            <ResourceCardView card={card} locale={locale} open={labels.open} />
          </li>
        ))}
      </ul>
      {empty !== null && (
        <p data-resource-empty={cards.length === 0 ? 'none' : 'filter'} className="text-body text-muted-foreground">
          {empty}
        </p>
      )}
    </div>
  );
}
