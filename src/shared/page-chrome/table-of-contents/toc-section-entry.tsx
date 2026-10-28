import { localizePath } from '@/shared/lib/locale.pure';
import {
  ownerOf,
  sectionNumber,
  sectionProgress,
  type TocItem,
  type TocSection,
} from '@/shared/lib/table-of-contents.pure';
import { cn } from '@/shared/lib/utils';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { NumberToggle, SECTION_NUMBER } from './toc-number-toggle';
import { ProgressRing } from './toc-progress-ring';
import type { TocView } from './toc-view';

export function EntryLink(props: {
  view: TocView;
  id: string;
  className: string;
  children: ReactNode;
  title?: string;
}) {
  const { locale, route, active } = props.view;
  return (
    <Link
      href={localizePath(route, locale, props.id)}
      replace
      onClick={(event) => props.view.glideTo(event, props.id)}
      aria-current={active === props.id ? 'location' : undefined}
      data-testid={`toc-${props.id}`}
      title={props.title}
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
            ? 'bg-selected font-medium text-selected-foreground'
            : 'text-muted-foreground hover:bg-accent/70 hover:text-foreground',
        )}
      >
        {item.title}
      </EntryLink>
    </li>
  );
}

function SectionItems({ view, section, collapsed }: { view: TocView; section: TocSection; collapsed?: boolean }) {
  const open = view.open.has(section.id) && !collapsed;
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
      {/* From `md` the list always keeps the expanded panel's width, so its items never rewrap while the panel narrows or widens. */}
      <ol className={'ml-10 min-h-0 overflow-hidden md:min-w-[12.875rem]'}>
        {section.items.map((item) => (
          <ItemEntry key={item.id} view={view} item={item} />
        ))}
      </ol>
    </div>
  );
}

function MarkerRing(props: { progress: number | null; settled: boolean }) {
  if (props.progress !== null) {
    return <ProgressRing progress={props.progress} settled={props.settled} />;
  }
  return <span aria-hidden className="absolute inset-1 rounded-full border-2 border-border" />;
}

function CollapsedMarker(props: { view: TocView; section: TocSection; number: string; progress: number | null }) {
  const { view, section, number, progress } = props;
  const markerClass = cn(
    SECTION_NUMBER,
    'relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring hover:text-foreground',
    'motion-reduce:transition-none transition-transform duration-300 ease-out',
  );
  return (
    <EntryLink view={view} id={section.id} title={`${number}. ${section.title}`} className={markerClass}>
      <MarkerRing progress={progress} settled={view.settled} />
      <span aria-hidden>{number}</span>
      <span className="sr-only">
        {number}. {section.title}
      </span>
    </EntryLink>
  );
}

interface SectionMarkerProps {
  view: TocView;
  section: TocSection;
  number: string;
  toggleLabel: string;
  allSections: readonly TocSection[];
  collapsed?: boolean;
}

function SectionMarker(props: SectionMarkerProps) {
  const { view, section, number, toggleLabel, allSections, collapsed } = props;
  const progress = sectionProgress(section, view.active, allSections);

  if (collapsed) {
    return <CollapsedMarker view={view} section={section} number={number} progress={progress} />;
  }
  if (section.items.length === 0) {
    return (
      <span aria-hidden className={SECTION_NUMBER}>
        {number}
      </span>
    );
  }
  return (
    <NumberToggle
      open={view.open.has(section.id)}
      controls={`${view.idPrefix}toc-items-${section.id}`}
      label={`${number}. ${toggleLabel}: ${section.title}`}
      testId={`toc-toggle-${section.id}`}
      settled={view.settled}
      onToggle={() => view.toggle(section.id)}
    >
      {number}
    </NumberToggle>
  );
}

function SectionTitle(props: { view: TocView; id: string; title: string; collapsed?: boolean }) {
  const { view, id, title, collapsed } = props;
  const active = view.active === id;
  return (
    <EntryLink
      view={view}
      id={id}
      className={cn(
        'flex-1 rounded-lg text-pretty whitespace-nowrap overflow-hidden text-ellipsis',
        'motion-reduce:transition-none transition-[max-width,opacity,padding,margin] duration-300 ease-out',
        collapsed
          ? 'ml-0 max-w-0 opacity-0 pointer-events-none px-0 py-1.5'
          : 'ml-1 max-w-[15rem] opacity-100 px-2 py-1.5 hover:bg-accent/70 hover:text-foreground',
        active && !collapsed && 'bg-selected text-selected-foreground',
      )}
    >
      {title}
    </EntryLink>
  );
}

export interface SectionEntryProps {
  view: TocView;
  section: TocSection;
  index: number;
  toggleLabel: string;
  allSections: readonly TocSection[];
  collapsed?: boolean;
}

export function SectionEntry(props: SectionEntryProps) {
  const { view, section, collapsed, index } = props;
  const current = ownerOf([section], view.active) !== undefined;
  const number = sectionNumber(index);
  const tone = current ? 'font-semibold text-foreground' : 'text-muted-foreground';

  return (
    <li>
      <div className={cn('flex items-start', tone)}>
        <SectionMarker
          view={view}
          section={section}
          number={number}
          toggleLabel={props.toggleLabel}
          allSections={props.allSections}
          collapsed={collapsed}
        />
        <SectionTitle view={view} id={section.id} title={section.title} collapsed={collapsed} />
      </div>
      {section.items.length > 0 && <SectionItems view={view} section={section} collapsed={collapsed} />}
    </li>
  );
}
