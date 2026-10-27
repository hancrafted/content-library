'use client';

import type { TagId } from '@/content-store/schemas/fields';
import { EventCardView } from '@/events/components/event-card';
import type { EventCard } from '@/events/lib/event-card.pure';
import {
  eventTagChoices,
  groupEventsByMonth,
  matchingEvents,
  NO_SELECTION,
  type EventSelection,
  type MonthGroup,
} from '@/events/lib/events-overview.pure';
import { SearchInput } from '@/shared/components/filters/search-input';
import { TagToggles } from '@/shared/components/filters/tag-toggles';
import { Button } from '@/shared/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group';
import type { Locale } from '@/shared/lib/locale.pure';
import { cn } from '@/shared/lib/utils';
import { LayoutGrid, List } from 'lucide-react';
import { useRef, useState } from 'react';

/** The strings the overview's leaf draws, resolved on the server so it takes plain values (FE-006 §4). */
export interface EventBrowserLabels {
  readonly upcoming: string;
  readonly past: string;
  readonly noUpcoming: string;
  readonly noPast: string;
  /** A section that holds Events, all of which the filter hides. */
  readonly noMatch: string;
  readonly search: string;
  readonly searchPlaceholder: string;
  readonly tagFilter: string;
  readonly view: string;
  readonly grid: string;
  readonly list: string;
  readonly reset: string;
}

type View = 'grid' | 'list';

/** With scripts off the controls cannot work, so the stylesheet drops them and shows every Event. */
const NO_SCRIPT_CSS =
  '[data-event-controls]{display:none}[data-event-item][hidden],[data-event-month][hidden]{display:revert!important}';

interface BrowserProps {
  cards: EventCard[];
  /** The Tags' order, the vocabulary's, so the chips read as on the Episode overview. */
  vocabulary: readonly TagId[];
  /** The day the site was built: an Event before it is past, the same day as its page decides. */
  buildDay: string;
  locale: Locale;
  labels: EventBrowserLabels;
}

/** The calendar day block beside a card in the list view: the day of the month over its weekday. */
function DayBlock({ card }: { card: EventCard }) {
  return (
    <div aria-hidden className="flex w-14 shrink-0 flex-col items-center pt-5 text-center">
      <span className="text-subheading font-semibold text-foreground tabular-nums">{card.day}</span>
      <span className="text-caption text-muted-foreground uppercase">{card.weekday}</span>
    </div>
  );
}

interface MonthProps {
  group: MonthGroup<EventCard>;
  visible: ReadonlySet<string>;
  view: View;
  locale: Locale;
}

/** One month: its heading, then its Events as a card grid or as calendar rows; hidden when the filter keeps none. */
function Month({ group, visible, view, locale }: MonthProps) {
  const shown = group.items.some((card) => visible.has(card.slug));
  return (
    <div data-event-month={group.month} hidden={!shown} className="space-y-4">
      <h3 className="text-caption font-medium tracking-widest text-muted-foreground uppercase">{group.label}</h3>
      <ul
        data-event-list
        data-view={view}
        className={cn(view === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-4')}
      >
        {group.items.map((card) => (
          <li key={card.slug} data-event-item hidden={!visible.has(card.slug)} className="flex gap-4">
            {view === 'list' && <DayBlock card={card} />}
            <EventCardView card={card} locale={locale} headingLevel={4} />
          </li>
        ))}
      </ul>
    </div>
  );
}

interface SectionProps {
  id: 'upcoming' | 'past';
  title: string;
  /** The line when the calendar puts no Event here. */
  empty: string;
  /** The line when Events are here but the filter hides them all. */
  noMatch: string;
  groups: readonly MonthGroup<EventCard>[];
  visible: ReadonlySet<string>;
  view: View;
  locale: Locale;
}

/** Upcoming or Past: its heading, its months, and one line saying whether the calendar or the filter left it empty. */
function Section({ id, title, empty, noMatch, groups, visible, view, locale }: SectionProps) {
  const any = groups.some((group) => group.items.some((card) => visible.has(card.slug)));
  return (
    <section data-event-section={id} aria-labelledby={`events-${id}`} className="space-y-6">
      <h2 id={`events-${id}`} className="text-subheading font-semibold text-foreground">
        {title}
      </h2>
      {groups.map((group) => (
        <Month key={group.month} group={group} visible={visible} view={view} locale={locale} />
      ))}
      {!any && (
        <p data-event-empty={groups.length === 0 ? 'calendar' : 'filter'} className="text-body text-muted-foreground">
          {groups.length === 0 ? empty : noMatch}
        </p>
      )}
    </section>
  );
}

/** The visitor's selection and view, the Events they keep, and the handlers that change them; all in memory (FE-001). */
function useEventBrowser(cards: readonly EventCard[]) {
  const [selection, setSelection] = useState<EventSelection>(NO_SELECTION);
  const [view, setView] = useState<View>('grid');
  const search = useRef<HTMLInputElement>(null);
  return {
    selection,
    view,
    search,
    visible: matchingEvents(cards, selection),
    active: selection.tags.length > 0 || selection.query.trim() !== '',
    setQuery: (query: string) => setSelection((prev) => ({ ...prev, query })),
    setTags: (tags: string[]) => setSelection((prev) => ({ ...prev, tags })),
    setView,
    reset: () => {
      setSelection(NO_SELECTION);
      search.current?.focus();
    },
  };
}

type Browse = ReturnType<typeof useEventBrowser>;

/** The grid or list switch: one choice always on, so a click on the current one keeps it. */
function ViewSwitch({ browse, labels }: { browse: Browse; labels: EventBrowserLabels }) {
  return (
    <ToggleGroup
      type="single"
      aria-label={labels.view}
      value={browse.view}
      onValueChange={(next) => next !== '' && browse.setView(next as View)}
      className="sm:ml-auto"
    >
      <ToggleGroupItem value="grid" aria-label={labels.grid} data-event-view="grid">
        <LayoutGrid aria-hidden />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label={labels.list} data-event-view="list">
        <List aria-hidden />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

/** The way back to every Event, shown only while a filter is on. */
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

interface ControlsProps {
  browse: Browse;
  cards: readonly EventCard[];
  vocabulary: readonly TagId[];
  labels: EventBrowserLabels;
}

/** The search, the Tag chips, the view switch, and the way back to everything while a filter is on. */
function Controls({ browse, cards, vocabulary, labels }: ControlsProps) {
  return (
    <div data-event-controls className="flex flex-wrap items-center gap-x-6 gap-y-4">
      <SearchInput
        query={browse.selection.query}
        label={labels.search}
        placeholder={labels.searchPlaceholder}
        onChange={browse.setQuery}
        inputRef={browse.search}
        data={{ 'data-event-search': '' }}
      />
      <TagToggles
        options={eventTagChoices(cards, vocabulary)}
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
 * The Events overview's interactive part: a search, the Tag chips and the grid or list switch, then Upcoming and Past
 * grouped by month. Every Event is in the server HTML; filtering only toggles `hidden`, so find-in-page and a visit
 * without scripts still see all of them. The selection and the view are transient (FE-001): a reload starts afresh.
 */
export function EventBrowser({ cards, vocabulary, buildDay, locale, labels }: BrowserProps) {
  const browse = useEventBrowser(cards);
  const sections = groupEventsByMonth(cards, buildDay, locale);
  const shared = { noMatch: labels.noMatch, visible: browse.visible, view: browse.view, locale };
  return (
    <div className="space-y-10">
      <noscript>
        <style>{NO_SCRIPT_CSS}</style>
      </noscript>
      <Controls browse={browse} cards={cards} vocabulary={vocabulary} labels={labels} />
      <Section id="upcoming" title={labels.upcoming} empty={labels.noUpcoming} groups={sections.upcoming} {...shared} />
      <Section id="past" title={labels.past} empty={labels.noPast} groups={sections.past} {...shared} />
    </div>
  );
}
