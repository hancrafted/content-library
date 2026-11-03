'use client';

import { useOpenSections } from '@/shared/hooks/use-table-of-contents';
import { localizePath } from '@/shared/lib/locale.pure';
import {
  ownerOf,
  type TocCollection,
  type TocPage,
  type TocPresentation,
  type TocSection,
} from '@/shared/lib/table-of-contents.pure';
import { TITLE_ANCHOR } from '@/shared/lib/title-anchor.pure';
import { cn } from '@/shared/lib/utils';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useId, useState } from 'react';
import type { TocLabels } from './toc-heading';
import { SectionEntry } from './toc-section-entry';
import type { TocView } from './toc-view';

const LEAVE_TO_BROWSER = () => undefined;

/** Repeated anchor names on other pages must never highlight or scroll the current page. */
function viewForPage(view: TocView, page: TocPage): TocView {
  const current = page.route === view.route;
  return {
    ...view,
    route: page.route,
    active: current ? view.active : null,
    glideTo: current ? view.glideTo : LEAVE_TO_BROWSER,
    idPrefix: `${view.idPrefix}-${page.route}`,
    nested: true,
    crossPage: !current,
  };
}

function ZoomPage(props: { view: TocView; page: TocPage; index: number; labels: TocLabels }) {
  const view = viewForPage(props.view, props.page);
  const section: TocSection = { id: TITLE_ANCHOR, title: props.page.title, minutes: 0, items: props.page.sections };
  const active =
    props.page.route === props.view.route ? (ownerOf(props.page.sections, view.active) ?? TITLE_ANCHOR) : null;
  const { open, toggle } = useOpenSections([section], active);
  return (
    <li data-toc-page={props.page.route}>
      <ol>
        <SectionEntry
          view={{ ...view, active, open, toggle }}
          section={section}
          index={props.index}
          toggleLabel={props.labels.toggle}
          allSections={[section]}
        />
      </ol>
    </li>
  );
}

interface TreeHeadingProps {
  view: TocView;
  page: TocPage;
  labels: TocLabels;
  expanded: boolean;
  toggle: () => void;
  controls: string;
}

function BranchToggle(props: TreeHeadingProps) {
  return (
    <button
      type="button"
      aria-expanded={props.expanded}
      aria-controls={props.controls}
      aria-label={`${props.labels.toggle}: ${props.page.title}`}
      onClick={props.toggle}
      className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-lg hover:bg-accent focus-visible:outline-2 md:size-8"
    >
      <ChevronRight
        aria-hidden
        className={cn('size-4 transition-transform motion-reduce:transition-none', props.expanded && 'rotate-90')}
      />
    </button>
  );
}

function TreeHeading(props: TreeHeadingProps) {
  return (
    <div className={cn('flex items-start gap-1', !props.view.crossPage && 'font-semibold')}>
      <BranchToggle {...props} />
      <Link
        href={localizePath(props.page.route, props.view.locale, TITLE_ANCHOR)}
        onClick={(event) => props.view.glideTo(event, TITLE_ANCHOR)}
        aria-current={!props.view.crossPage ? 'page' : undefined}
        className="min-w-0 flex-1 rounded-lg px-2 py-1.5 text-pretty hover:bg-accent focus-visible:outline-2"
      >
        {props.page.title}
      </Link>
    </div>
  );
}

function TreePage(props: { view: TocView; page: TocPage; labels: TocLabels }) {
  const [expanded, setExpanded] = useState(props.page.route === props.view.route);
  const id = useId();
  const view = viewForPage(props.view, props.page);
  const { open, toggle } = useOpenSections(props.page.sections, view.active);
  return (
    <li data-toc-page={props.page.route}>
      <TreeHeading
        {...props}
        view={view}
        expanded={expanded}
        controls={id}
        toggle={() => setExpanded((value) => !value)}
      />
      <ol id={id} hidden={!expanded} className="ml-3 border-l pl-2">
        {props.page.sections.map((section, index) => (
          <SectionEntry
            key={section.id}
            view={{ ...view, open, toggle }}
            section={section}
            index={index}
            toggleLabel={props.labels.toggle}
            allSections={props.page.sections}
          />
        ))}
      </ol>
    </li>
  );
}

export function TocCollectionView(props: {
  collection: TocCollection;
  view: TocView;
  labels: TocLabels;
  presentation: TocPresentation;
}) {
  return (
    <ol className="flex min-h-0 flex-col gap-2 overflow-y-auto overscroll-contain">
      {props.collection.pages.map((page, index) =>
        props.presentation === 'zoom' ? (
          <ZoomPage key={page.route} page={page} index={index} view={props.view} labels={props.labels} />
        ) : (
          <TreePage key={page.route} page={page} view={props.view} labels={props.labels} />
        ),
      )}
    </ol>
  );
}
