'use client';

import type { ResourceType, TagId } from '@/content-store/schemas/fields';
import { SearchInput } from '@/shared/components/filters/search-input';
import { TagToggles } from '@/shared/components/filters/tag-toggles';
import { Button } from '@/shared/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group';
import type { Locale } from '@/shared/lib/locale.pure';
import { cn } from '@/shared/lib/utils';
import { LayoutGrid, List } from 'lucide-react';
import { useRef, useState } from 'react';
import { ResourceCardView, type ResourceCard } from './resource-card';
import {
  matchingResources,
  NO_SELECTION,
  resourceTagChoices,
  resourceTypeChoices,
  type ResourceSelection,
} from './resources-overview.pure';

/** The strings the overview's leaf draws, resolved on the server so it takes plain values (FE-006 §4). */
export interface ResourceBrowserLabels {
  /** The line when no Resource exists. */
  readonly none: string;
  /** The line when Resources exist but the filter hides them all. */
  readonly noMatch: string;
  readonly search: string;
  readonly searchPlaceholder: string;
  readonly tagFilter: string;
  readonly typeFilter: string;
  readonly view: string;
  readonly grid: string;
  readonly list: string;
  readonly reset: string;
  /** The type names, as the type filter writes them in plural ("Master slides"). */
  readonly typeNames: Readonly<Record<ResourceType, string>>;
}

type View = 'grid' | 'list';

/** With scripts off the controls cannot work, so the stylesheet drops them and shows every Resource. */
const NO_SCRIPT_CSS = '[data-resource-controls]{display:none}[data-resource-item][hidden]{display:revert!important}';

interface BrowserProps {
  cards: ResourceCard[];
  /** The Tags' order, the vocabulary's, so the chips read as on the other overviews. */
  vocabulary: readonly TagId[];
  /** The closed list of types, in the order the filter offers them. */
  types: readonly ResourceType[];
  locale: Locale;
  labels: ResourceBrowserLabels;
}

/** The visitor's selection and view, and the handlers that change them; all in memory (FE-001). */
function useResourceBrowser(cards: readonly ResourceCard[]) {
  const [selection, setSelection] = useState<ResourceSelection>(NO_SELECTION);
  const [view, setView] = useState<View>('grid');
  const search = useRef<HTMLInputElement>(null);
  return {
    selection,
    view,
    search,
    visible: matchingResources(cards, selection),
    active: selection.tags.length > 0 || selection.types.length > 0 || selection.query.trim() !== '',
    setQuery: (query: string) => setSelection((prev) => ({ ...prev, query })),
    setTags: (tags: string[]) => setSelection((prev) => ({ ...prev, tags })),
    setTypes: (types: string[]) => setSelection((prev) => ({ ...prev, types })),
    setView,
    reset: () => {
      setSelection(NO_SELECTION);
      search.current?.focus();
    },
  };
}

type Browse = ReturnType<typeof useResourceBrowser>;

/** The grid or list switch: one choice always on, so a click on the current one keeps it. */
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

/** The way back to every Resource, shown only while a filter is on. */
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

/** The search, the type and Tag chips, the view switch, and the way back to everything while a filter is on. */
function Controls({ browse, cards, vocabulary, types, labels }: ControlsProps) {
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
      <div data-resource-type-filter>
        <TagToggles
          options={resourceTypeChoices(cards, types, labels.typeNames)}
          selected={browse.selection.types}
          label={labels.typeFilter}
          onChange={browse.setTypes}
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

/**
 * The Resources overview's interactive part: a search, the type and Tag chips and the grid or list switch, then
 * every Resource as a card. Every Resource is in the server HTML; filtering only toggles `hidden`, so find-in-page
 * and a visit without scripts still see all of them. The selection and the view are transient (FE-001): a reload
 * starts afresh.
 */
export function ResourceBrowser({ cards, vocabulary, types, locale, labels }: BrowserProps) {
  const browse = useResourceBrowser(cards);
  const empty = cards.length === 0 ? labels.none : browse.visible.size === 0 ? labels.noMatch : null;
  return (
    <div className="space-y-10">
      <noscript>
        <style>{NO_SCRIPT_CSS}</style>
      </noscript>
      <Controls browse={browse} cards={cards} vocabulary={vocabulary} types={types} labels={labels} />
      <ul
        data-resource-list
        data-view={browse.view}
        className={cn(browse.view === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-4')}
      >
        {cards.map((card) => (
          <li key={card.slug} data-resource-item hidden={!browse.visible.has(card.slug)} className="flex">
            <ResourceCardView card={card} locale={locale} />
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
