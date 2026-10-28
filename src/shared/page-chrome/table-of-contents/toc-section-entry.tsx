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
      label={`${props.number}. ${props.toggleLabel}: ${section.title}`}
      testId={`toc-toggle-${section.id}`}
      settled={view.settled}
      onToggle={() => view.toggle(section.id)}
    >
      {props.number}
    </NumberToggle>
  );
}

interface SectionEntryProps {
  view: TocView;
  section: TocSection;
  index: number;
  toggleLabel: string;
  allSections: readonly TocSection[];
  collapsed?: boolean;
}

interface CollapsedEntryProps {
  view: TocView;
  section: TocSection;
  number: string;
  tone: string;
  allSections: readonly TocSection[];
}

function CollapsedEntry(props: CollapsedEntryProps) {
  const { view, section, number, tone, allSections } = props;
  const progress = sectionProgress(section, view.active, allSections);
  const ring =
    progress !== null ? (
      <ProgressRing progress={progress} settled={view.settled} />
    ) : (
      <span aria-hidden className="absolute inset-1 rounded-full border-2 border-border" />
    );
  const entryClass = cn(
    SECTION_NUMBER,
    'relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring hover:text-foreground',
    tone,
  );
  return (
    <li>
      <EntryLink view={view} id={section.id} title={`${number}. ${section.title}`} className={entryClass}>
        {ring}
        <span aria-hidden>{number}</span>
        <span className="sr-only">
          {number}. {section.title}
        </span>
      </EntryLink>
    </li>
  );
}

function ExpandedEntry(props: {
  view: TocView;
  section: TocSection;
  number: string;
  tone: string;
  toggleLabel: string;
}) {
  const { view, section, number, tone, toggleLabel } = props;
  return (
    <li>
      <div className={cn('flex items-start gap-1', tone)}>
        <SectionMarker view={view} section={section} number={number} toggleLabel={toggleLabel} />
        <EntryLink
          view={view}
          id={section.id}
          className={cn(
            'flex-1 rounded-lg px-2 py-1.5 text-pretty transition-colors hover:bg-accent/70 hover:text-foreground',
            view.active === section.id && 'bg-selected text-selected-foreground',
          )}
        >
          {section.title}
        </EntryLink>
      </div>
      {section.items.length > 0 && <SectionItems view={view} section={section} />}
    </li>
  );
}

export function SectionEntry(props: SectionEntryProps) {
  const { view, section, collapsed, index } = props;
  const current = ownerOf([section], view.active) !== undefined;
  const number = sectionNumber(index);
  const tone = current ? 'font-semibold text-foreground' : 'text-muted-foreground';

  if (collapsed) {
    return <CollapsedEntry view={view} section={section} number={number} tone={tone} allSections={props.allSections} />;
  }
  return <ExpandedEntry view={view} section={section} number={number} tone={tone} toggleLabel={props.toggleLabel} />;
}
