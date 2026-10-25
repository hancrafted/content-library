'use client';

import type { CardHeadingLevel } from '@/components/landing/card-variant.pure';
import {
  browseView,
  conceptChoices,
  hasActiveFilters,
  INITIAL_SELECTION,
  resultsText,
  showsFormat,
  toggleConcept,
  type BrowseSelection,
  type ResultsLabels,
} from '@/components/landing/episode-browse.pure';
import { EpisodeCardView, type CardLabels } from '@/components/landing/episode-card';
import type { EpisodeCard } from '@/components/landing/episode-card.pure';
import { ConceptChips, SearchBox, type FilterLabels } from '@/components/landing/episode-filters';
import { Button } from '@/components/ui/button';
import type { TopConceptId } from '@/lib/episode-overview';
import type { Locale } from '@/lib/locale.pure';
import { fillTemplate } from '@/lib/template.pure';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useRef, useState } from 'react';

/** The strings the Browse block draws, resolved on the server so the leaf takes plain values (FE-006 §4). */
export interface BrowseLabels extends CardLabels, FilterLabels {
  readonly showAll: string;
  readonly showFewer: string;
  readonly results: ResultsLabels;
  readonly empty: string;
  readonly reset: string;
}

/**
 * With scripts off the chips cannot work and the cap cannot lift, so the
 * stylesheet drops the controls and shows every card the cap folded away.
 */
const NO_SCRIPT_CSS = '[data-browse-controls]{display:none}[data-browse-item][hidden]{display:flex!important}';

function EmptyState({ labels, onReset }: { labels: BrowseLabels; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <p className="text-sm text-muted-foreground">{labels.empty}</p>
      <Button type="button" variant="outline" size="sm" onClick={onReset} className="rounded-full">
        {labels.reset}
      </Button>
    </div>
  );
}

interface FoldProps {
  expanded: boolean;
  total: number;
  labels: BrowseLabels;
  onToggle: () => void;
}

function FoldButton({ expanded, total, labels, onToggle }: FoldProps) {
  return (
    <div data-browse-controls className="flex justify-center pt-2">
      <Button
        type="button"
        variant="outline"
        aria-expanded={expanded}
        onClick={onToggle}
        className="rounded-full px-5 motion-reduce:transition-none"
      >
        {expanded ? labels.showFewer : fillTemplate(labels.showAll, { count: total })}
        <ChevronDown
          aria-hidden
          className={cn('transition-transform duration-200 motion-reduce:transition-none', expanded && 'rotate-180')}
        />
      </Button>
    </div>
  );
}

/** The visitor's selection, the grid it yields and the handlers that change it; all transient, in memory (FE-001). */
function useBrowse(cards: readonly EpisodeCard[]) {
  const [selection, setSelection] = useState<BrowseSelection>(INITIAL_SELECTION);
  const search = useRef<HTMLInputElement>(null);
  return {
    selection,
    search,
    active: hasActiveFilters(selection),
    view: browseView(cards, selection),
    concepts: conceptChoices(cards, selection),
    toggleConcept: (concept: TopConceptId) => setSelection((prev) => toggleConcept(prev, concept)),
    setQuery: (query: string) => setSelection((prev) => ({ ...prev, query })),
    toggleExpanded: () => setSelection((prev) => ({ ...prev, expanded: !prev.expanded })),
    reset: () => {
      setSelection(INITIAL_SELECTION);
      search.current?.focus();
    },
  };
}

type Browse = ReturnType<typeof useBrowse>;

function BrowseControls({ browse, labels }: { browse: Browse; labels: BrowseLabels }) {
  const { selection, concepts } = browse;
  return (
    <div data-browse-controls className="flex flex-wrap items-center gap-x-6 gap-y-4">
      <SearchBox query={selection.query} labels={labels} onChange={browse.setQuery} inputRef={browse.search} />
      <ConceptChips options={concepts} selected={selection.concepts} labels={labels} onToggle={browse.toggleConcept} />
    </div>
  );
}

/** The live result count, with the way back to everything while a filter is on. */
function ResultsLine({ browse, labels }: { browse: Browse; labels: BrowseLabels }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <p role="status" aria-live="polite" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {resultsText(labels.results, browse.view.matching)}
      </p>
      {browse.active && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-browse-controls
          data-reset-filters
          onClick={browse.reset}
          className="rounded-full text-xs text-muted-foreground"
        >
          {labels.reset}
        </Button>
      )}
    </div>
  );
}

interface GridProps {
  cards: readonly EpisodeCard[];
  visible: ReadonlySet<string>;
  locale: Locale;
  labels: BrowseLabels;
  headingLevel: CardHeadingLevel;
}

function BrowseGrid({ cards, visible, locale, labels, headingLevel }: GridProps) {
  const showFormat = showsFormat(cards);
  return (
    <ul data-episode-browse className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <li key={card.slug} data-browse-item hidden={!visible.has(card.slug)} className="flex">
          <EpisodeCardView
            card={card}
            variant="compact"
            headingLevel={headingLevel}
            locale={locale}
            labels={labels}
            showFormat={showFormat}
          />
        </li>
      ))}
    </ul>
  );
}

interface BrowseProps {
  cards: EpisodeCard[];
  locale: Locale;
  labels: BrowseLabels;
  /** The cards' heading level, one below the heading the block sits under. */
  headingLevel: CardHeadingLevel;
}

/**
 * The Browse block: a search box, Concept chips, a Format control when there is more than one
 * Format, and a grid of every Episode card. The grid is in the server HTML in
 * full; filtering and the cap only toggle `hidden`, so find-in-page and a
 * script-less visit still see all of it. Leaving the page and coming back
 * starts from All again.
 */
export function EpisodeBrowse({ cards, locale, labels, headingLevel }: BrowseProps) {
  const browse = useBrowse(cards);
  const { view, selection } = browse;
  return (
    <div className="space-y-6">
      <noscript>
        <style>{NO_SCRIPT_CSS}</style>
      </noscript>
      <BrowseControls browse={browse} labels={labels} />
      <ResultsLine browse={browse} labels={labels} />
      <BrowseGrid cards={cards} visible={view.visible} locale={locale} labels={labels} headingLevel={headingLevel} />
      {view.matching === 0 && <EmptyState labels={labels} onReset={browse.reset} />}
      {view.foldable && (
        <FoldButton
          expanded={selection.expanded}
          total={view.matching}
          labels={labels}
          onToggle={browse.toggleExpanded}
        />
      )}
    </div>
  );
}
