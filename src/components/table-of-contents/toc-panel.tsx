import { localizePath, type Locale } from '@/lib/locale.pure';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useId, type MouseEvent, type ReactNode } from 'react';
import { ownerOf, type ReadingTime, type TocItem, type TocSection } from './table-of-contents.pure';

/** Everything a part of the table reads besides its own entry. */
export interface TocView {
  locale: Locale;
  route: string;
  active: string | null;
  open: ReadonlySet<string>;
  toggle: (id: string) => void;
  /** False until the first observation has painted; motion stays off until then, so a reload mid-page never animates its way there. */
  settled: boolean;
  /** Unique per rendered panel, since the desktop panel and the drawer both render one. */
  idPrefix?: string;
}

export interface TocLabels {
  title: string;
  progress: string;
  /** Time left, per plural category; `#` stands for the whole minutes. */
  remaining: Record<'one' | 'other', string>;
  toggle: string;
  open: string;
  close: string;
}

/** `01`, `02`, … — numbering lives in the table of contents only. */
export function sectionNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

/** "12 min left" in the reader's locale, rounded up so the last minute never reads as zero too early. */
export function remainingLabel(labels: TocLabels, locale: Locale, minutes: number): string {
  // Plurals are resolved here, not by ICU: the count changes on the client, and functions cannot cross
  // the server/client boundary. Trim float noise first so 12.000000001 never reads as 13.
  const whole = Math.ceil(Math.round(minutes * 1e6) / 1e6);
  const category = new Intl.PluralRules(locale).select(whole) === 'one' ? 'one' : 'other';
  return labels.remaining[category].replace('#', String(whole));
}

function isPlainClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/**
 * Glides to the entry's slide and replaces the URL, so Back leaves the page
 * instead of replaying every jump. Only a click glides: a reload or a shared
 * link lands on its fragment at once, without scrolling through what precedes it.
 */
function glideTo(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id);
  if (!target || !isPlainClick(event)) return;
  event.preventDefault();
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: still ? 'instant' : 'smooth' });
  history.replaceState(history.state, '', event.currentTarget.href);
}

function EntryLink(props: { view: TocView; id: string; className: string; children: ReactNode }) {
  const { locale, route, active } = props.view;
  return (
    <Link
      href={localizePath(route, locale, props.id)}
      replace
      onClick={(event) => glideTo(event, props.id)}
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
      <ol className="ml-7 min-h-0 overflow-hidden">
        {section.items.map((item) => (
          <ItemEntry key={item.id} view={view} item={item} />
        ))}
      </ol>
    </div>
  );
}

function Chevron({ view, section, label }: { view: TocView; section: TocSection; label: string }) {
  const open = view.open.has(section.id);
  return (
    <button
      type="button"
      aria-label={`${label}: ${section.title}`}
      aria-expanded={open}
      aria-controls={`${view.idPrefix}toc-items-${section.id}`}
      data-testid={`toc-toggle-${section.id}`}
      className="-my-1 grid size-9 shrink-0 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      onClick={() => view.toggle(section.id)}
    >
      <ChevronDown
        aria-hidden
        className={cn(
          'size-4 motion-reduce:transition-none',
          view.settled ? 'transition-transform duration-300' : 'transition-none',
          open && 'rotate-180',
        )}
      />
    </button>
  );
}

function SectionEntry(props: { view: TocView; section: TocSection; index: number; toggleLabel: string }) {
  const { view, section } = props;
  const current = ownerOf([section], view.active) !== undefined;
  return (
    <li>
      <div className="flex items-start gap-1">
        <EntryLink
          view={view}
          id={section.id}
          className={cn(
            'grid flex-1 grid-cols-[1.25rem_1fr] gap-x-1.5 rounded-lg px-2 py-1.5 text-pretty transition-colors hover:bg-accent/70',
            current ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground',
            view.active === section.id && 'bg-highlight',
          )}
        >
          <span aria-hidden className="pt-px font-mono text-[0.7rem] leading-5 font-normal">
            {sectionNumber(props.index)}
          </span>
          <span>{section.title}</span>
        </EntryLink>
        {section.items.length > 0 && <Chevron view={view} section={section} label={props.toggleLabel} />}
      </div>
      {section.items.length > 0 && <SectionItems view={view} section={section} />}
    </li>
  );
}

/** Title on the left, time left on the right, and the time-weighted progress bar beneath both. */
function TocHeading(props: { labels: TocLabels; locale: Locale; time: ReadingTime; settled: boolean }) {
  const { labels, time } = props;
  const left = remainingLabel(labels, props.locale, time.remaining);
  return (
    <div className="mb-3 px-2">
      <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
        <span className="font-medium tracking-widest uppercase">{labels.title}</span>
        <span className="tabular-nums">{left}</span>
      </div>
      <div
        role="progressbar"
        aria-label={labels.progress}
        aria-valuemin={0}
        aria-valuemax={Math.ceil(time.total)}
        aria-valuenow={Math.round(time.total - time.remaining)}
        aria-valuetext={left}
        className="mt-2 h-1 overflow-hidden rounded-full bg-border"
      >
        <div
          className={cn(
            'h-full origin-left rounded-full bg-foreground motion-reduce:transition-none',
            props.settled ? 'transition-transform duration-300 ease-out' : 'transition-none',
          )}
          style={{ transform: `scaleX(${time.progress})` }}
        />
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
  return (
    <nav
      aria-label={labels.title}
      data-testid={props.testId}
      className={cn(
        'flex flex-col rounded-2xl border bg-background/70 p-3 text-sm shadow-header backdrop-blur-xl backdrop-saturate-150',
        props.className,
      )}
    >
      <TocHeading labels={labels} locale={view.locale} time={props.time} settled={view.settled} />
      <ol className="-mr-1 flex min-h-0 flex-col gap-0.5 overflow-y-auto pr-1">
        {props.sections.map((section, index) => (
          <SectionEntry key={section.id} view={view} section={section} index={index} toggleLabel={labels.toggle} />
        ))}
      </ol>
    </nav>
  );
}
