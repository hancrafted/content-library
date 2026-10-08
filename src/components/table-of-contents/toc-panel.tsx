import { localizePath, type Locale } from '@/lib/locale.pure';
import { ownerOf, type ReadingTime, type TocItem, type TocSection } from '@/lib/table-of-contents.pure';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useId, type MouseEvent, type ReactNode } from 'react';
import { ProgressBar, TocHeading, type TocLabels } from './toc-heading';
import { NumberToggle, SECTION_NUMBER } from './toc-number-toggle';

/** Everything a part of the table reads besides its own entry. */
export interface TocView {
  locale: Locale;
  route: string;
  active: string | null;
  open: ReadonlySet<string>;
  toggle: (id: string) => void;
  /** Marks the entry a click is gliding to, so the table updates before the scroll arrives. */
  headTo: (id: string) => void;
  /** False until the first observation has painted; motion stays off until then, so a reload mid-page never animates its way there. */
  settled: boolean;
  /** False while the compact loading box stands in for the table, masking the first settle. */
  revealed: boolean;
  /** Unique per rendered panel, since the desktop panel and the drawer both render one. */
  idPrefix?: string;
}

/** `01`, `02`, … — numbering lives in the table of contents only. */
export function sectionNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function isPlainClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/**
 * Glides to the entry's slide and replaces the URL, so Back leaves the page
 * instead of replaying every jump. Only a click glides: a reload or a shared
 * link lands on its fragment at once, without scrolling through what precedes it.
 */
function glideTo(event: MouseEvent<HTMLAnchorElement>, id: string): boolean {
  const target = document.getElementById(id);
  if (!target || !isPlainClick(event)) return false;
  event.preventDefault();
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: still ? 'instant' : 'smooth' });
  history.replaceState(history.state, '', event.currentTarget.href);
  return true;
}

function EntryLink(props: { view: TocView; id: string; className: string; children: ReactNode }) {
  const { locale, route, active } = props.view;
  return (
    <Link
      href={localizePath(route, locale, props.id)}
      replace
      onClick={(event) => glideTo(event, props.id) && props.view.headTo(props.id)}
      aria-current={active === props.id ? 'location' : undefined}
      data-testid={`toc-${props.id}`}
      className={props.className}
    >
      {props.children}
    </Link>
  );
}

const ITEM = 'block rounded-lg px-2 py-1.5 text-pretty transition-colors duration-200';

function ItemEntry({ view, item }: { view: TocView; item: TocItem }) {
  const active = view.active === item.id;
  return (
    <li className="first:pt-0.5 last:pb-1">
      <EntryLink
        view={view}
        id={item.id}
        className={cn(
          ITEM,
          active
            ? 'bg-highlight font-medium text-foreground'
            : 'text-muted-foreground hover:bg-accent/70 hover:text-foreground',
        )}
      >
        {item.title}
      </EntryLink>
    </li>
  );
}

function SectionItems({ view, section }: { view: TocView; section: TocSection }) {
  const open = view.open.has(section.id);
  return (
    <div
      id={`${view.idPrefix}toc-items-${section.id}`}
      inert={!open}
      className={cn(
        'grid motion-reduce:transition-none',
        view.settled ? 'transition-[grid-template-rows,opacity] duration-300 ease-out' : 'transition-none',
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
      )}
    >
      <ol className="ml-10 min-h-0 overflow-hidden">
        {section.items.map((item) => (
          <ItemEntry key={item.id} view={view} item={item} />
        ))}
      </ol>
    </div>
  );
}

/** The section number: a disclosure when the section owns slides, plain otherwise. */
function SectionMarker(props: { view: TocView; section: TocSection; number: string; toggleLabel: string }) {
  const { view, section } = props;
  if (section.items.length === 0) {
    return (
      <span aria-hidden className={SECTION_NUMBER}>
        {props.number}
      </span>
    );
  }
  return (
    <NumberToggle
      open={view.open.has(section.id)}
      controls={`${view.idPrefix}toc-items-${section.id}`}
      label={`${props.toggleLabel}: ${section.title}`}
      testId={`toc-toggle-${section.id}`}
      settled={view.settled}
      onToggle={() => view.toggle(section.id)}
    >
      {props.number}
    </NumberToggle>
  );
}

function SectionEntry(props: { view: TocView; section: TocSection; index: number; toggleLabel: string }) {
  const { view, section } = props;
  const current = ownerOf([section], view.active) !== undefined;
  const number = sectionNumber(props.index);
  const tone = current ? 'font-semibold text-foreground' : 'text-muted-foreground';
  return (
    <li>
      <div className={cn('flex items-start gap-1', tone)}>
        <SectionMarker view={view} section={section} number={number} toggleLabel={props.toggleLabel} />
        <EntryLink
          view={view}
          id={section.id}
          className={cn(
            'flex-1 rounded-lg px-2 py-1.5 text-pretty transition-colors hover:bg-accent/70 hover:text-foreground',
            view.active === section.id && 'bg-highlight',
          )}
        >
          {section.title}
        </EntryLink>
      </div>
      {section.items.length > 0 && <SectionItems view={view} section={section} />}
    </li>
  );
}

/**
 * The reveal runs in two beats: the box widens first while its body is still
 * folded away, then the body unfolds at its final width. Widening and
 * unfolding together would rewrap every title on each frame of the growth.
 */
const WIDEN = 'duration-300 ease-out motion-reduce:transition-none';
const UNFOLD = 'duration-500 ease-out delay-300 motion-reduce:transition-none motion-reduce:delay-0';

/** Progress bar and sections, folded away while the loading box shows. */
function TocBody(props: { view: TocView; sections: readonly TocSection[]; labels: TocLabels; time: ReadingTime }) {
  const { view, labels } = props;
  const { revealed } = view;
  return (
    <div
      inert={!revealed}
      className={cn(
        // Height animates straight to the measured `auto` (`interpolate-size` on the panel). The 0fr→1fr grid
        // trick sized the box ahead of its row and opened an empty band; browsers without support show the body at once.
        `flex min-h-0 flex-col overflow-hidden transition-[height] ${UNFOLD}`,
        revealed ? 'h-auto' : 'h-0 noscript:h-auto',
      )}
    >
      <div className="flex min-h-0 flex-col overflow-hidden">
        <ProgressBar labels={labels} locale={view.locale} time={props.time} settled={view.settled} />
        <ol className="-mr-1 flex min-h-0 flex-col gap-0.5 overflow-y-auto pr-1">
          {props.sections.map((section, index) => (
            <SectionEntry key={section.id} view={view} section={section} index={index} toggleLabel={labels.toggle} />
          ))}
        </ol>
      </div>
    </div>
  );
}

/** The bounded panel: heading with time left and progress, then the numbered sections. */
export function TocPanel(props: {
  view: TocView;
  sections: readonly TocSection[];
  labels: TocLabels;
  time: ReadingTime;
  className?: string;
  testId?: string;
}) {
  const { labels } = props;
  const view = { ...props.view, idPrefix: useId() };
  const { revealed } = view;
  return (
    <nav
      aria-label={labels.title}
      aria-busy={!revealed}
      data-testid={props.testId}
      className={cn(
        'flex flex-col border bg-background/70 p-3 text-sm shadow-header backdrop-blur-xl backdrop-saturate-150 [interpolate-size:allow-keywords]',
        `transition-[width,border-radius] ${WIDEN}`,
        revealed ? 'w-full rounded-2xl' : 'w-44 rounded-[1.375rem] noscript:w-full noscript:rounded-2xl',
        props.className,
      )}
    >
      <TocHeading labels={labels} locale={view.locale} time={props.time} revealed={revealed} />
      <TocBody {...props} view={view} />
    </nav>
  );
}
