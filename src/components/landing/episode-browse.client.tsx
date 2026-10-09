'use client';

import {
  browseView,
  fillCount,
  formatChoices,
  hasChoice,
  INITIAL_SELECTION,
  resultsText,
  topicChoices,
  type BrowseSelection,
  type ResultsLabels,
} from '@/components/landing/episode-browse.pure';
import type { EpisodeCard } from '@/components/landing/episode-card.pure';
import { FormatSegments, TopicChips, type FilterLabels } from '@/components/landing/episode-filters';
import { EpisodeGridCard, type CardLabels } from '@/components/landing/episode-grid-card';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/lib/locale.pure';
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
        {expanded ? labels.showFewer : fillCount(labels.showAll, total)}
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
  const allTopics = useRef<HTMLButtonElement>(null);
  return {
    selection,
    allTopics,
    view: browseView(cards, selection),
    topics: topicChoices(cards, selection),
    formats: formatChoices(cards, selection),
    setTopic: (topic: BrowseSelection['topic']) => setSelection((prev) => ({ ...prev, topic })),
    setFormat: (format: BrowseSelection['format']) => setSelection((prev) => ({ ...prev, format })),
    toggleExpanded: () => setSelection((prev) => ({ ...prev, expanded: !prev.expanded })),
    reset: () => {
      setSelection(INITIAL_SELECTION);
      allTopics.current?.focus();
    },
  };
}

type Browse = ReturnType<typeof useBrowse>;

function BrowseControls({ browse, labels }: { browse: Browse; labels: BrowseLabels }) {
  const { selection, topics, formats } = browse;
  return (
    <div data-browse-controls className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
      {hasChoice(topics) && (
        <TopicChips
          choices={topics}
          selected={selection.topic}
          labels={labels}
          allRef={browse.allTopics}
          onSelect={browse.setTopic}
        />
      )}
      {hasChoice(formats) && (
        <FormatSegments choices={formats} selected={selection.format} labels={labels} onSelect={browse.setFormat} />
      )}
    </div>
  );
}

interface GridProps {
  cards: readonly EpisodeCard[];
  visible: ReadonlySet<string>;
  locale: Locale;
  labels: BrowseLabels;
}

function BrowseGrid({ cards, visible, locale, labels }: GridProps) {
  return (
    <ul data-episode-browse className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <li key={card.slug} data-browse-item hidden={!visible.has(card.slug)} className="flex">
          <EpisodeGridCard card={card} locale={locale} labels={labels} />
        </li>
      ))}
    </ul>
  );
}

interface BrowseProps {
  cards: EpisodeCard[];
  locale: Locale;
  labels: BrowseLabels;
}

/**
 * The Browse block: Topic chips, a Format control when there is more than one
 * Format, and a grid of every Episode card. The grid is in the server HTML in
 * full; filtering and the cap only toggle `hidden`, so find-in-page and a
 * script-less visit still see all of it. Leaving the page and coming back
 * starts from All again.
 */
export function EpisodeBrowse({ cards, locale, labels }: BrowseProps) {
  const browse = useBrowse(cards);
  const { view, selection } = browse;
  return (
    <div className="space-y-6">
      <noscript>
        <style>{NO_SCRIPT_CSS}</style>
      </noscript>
      <BrowseControls browse={browse} labels={labels} />
      <p role="status" aria-live="polite" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {resultsText(labels.results, view.matching)}
      </p>
      <BrowseGrid cards={cards} visible={view.visible} locale={locale} labels={labels} />
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
