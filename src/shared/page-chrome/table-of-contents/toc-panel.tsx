import type {
  ReadingTime,
  TocCollection,
  TocPageContext,
  TocScope,
  TocSection,
} from '@/shared/lib/table-of-contents.pure';
import { cn } from '@/shared/lib/utils';
import { useId } from 'react';
import { BackToTop } from '../back-to-top.client';
import { TocBorder } from './toc-border.client';
import { TocCollectionView } from './toc-collection.client';
import { TocHeading, type TocLabels } from './toc-heading';
import { TocOptions } from './toc-options.client';
import { ScopeButton } from './toc-scope.client';
import { SectionEntry } from './toc-section-entry';
import type { TocView } from './toc-view';

export type { TocView } from './toc-view';

const UNFOLD = 'duration-500 ease-out motion-reduce:transition-none';

interface SectionListProps {
  view: TocView;
  sections: readonly TocSection[];
  toggleLabel: string;
  collapsed?: boolean;
}

function SectionList({ view, sections, toggleLabel, collapsed }: SectionListProps) {
  const listClass = cn('-mr-1 flex min-h-0 flex-col gap-0.5 overflow-y-auto pr-1', collapsed && 'overflow-x-hidden');
  return (
    <ol className={listClass}>
      {sections.map((section, index) => (
        <SectionEntry
          key={section.id}
          view={view}
          section={section}
          index={index}
          toggleLabel={toggleLabel}
          allSections={sections}
          collapsed={collapsed}
        />
      ))}
    </ol>
  );
}

/** Sections, folded away while the loading box shows. */
function TocBody(props: {
  view: TocView;
  sections: readonly TocSection[];
  labels: TocLabels;
  time: ReadingTime;
  collapsed?: boolean;
}) {
  const { view, labels, collapsed } = props;
  return (
    <div
      inert={!view.revealed}
      className={cn(
        `flex min-h-0 flex-col overflow-hidden transition-[height] ${UNFOLD}`,
        view.revealed ? 'h-auto' : 'h-0 noscript:h-auto',
      )}
    >
      <SectionList view={view} sections={props.sections} toggleLabel={labels.toggle} collapsed={collapsed} />
    </div>
  );
}

function PanelHeading(props: TocPanelProps) {
  const { view } = props;
  return (
    <TocHeading
      labels={props.labels}
      locale={view.locale}
      page={props.page}
      topId={view.topId}
      atTop={view.atTop}
      onGlide={view.glideTo}
      collapsed={props.collapsed}
      actions={
        <>
          <ScopeButton {...props} />
          <TocOptions labels={props.labels} collapsed={props.collapsed} onToggleCollapse={props.onToggleCollapse} />
        </>
      }
    />
  );
}

export interface TocPanelProps {
  view: TocView;
  page: TocPageContext;
  sections: readonly TocSection[];
  labels: TocLabels;
  time: ReadingTime;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  testId?: string;
  collection?: TocCollection;
  scope: TocScope;
  onToggleScope: () => void;
}

function PanelBody(props: TocPanelProps) {
  if (props.collection && !props.collapsed && props.scope === 'collection') {
    return <TocCollectionView collection={props.collection} view={props.view} labels={props.labels} />;
  }
  return <TocBody {...props} />;
}

function PanelActions(props: TocPanelProps) {
  if (!props.collapsed) return null;
  return (
    <div
      data-toc-actions
      className={cn(
        'mt-2 flex shrink-0 items-center justify-between border-t pt-2',
        props.collapsed && 'flex-col gap-1',
      )}
    >
      <BackToTop
        label={props.labels.backToTop}
        locale={props.view.locale}
        route={props.view.route}
        compact={props.collapsed}
      />
    </div>
  );
}

function PanelContents(props: TocPanelProps) {
  return (
    <>
      <PanelHeading {...props} />
      <PanelBody {...props} />
      <PanelActions {...props} />
    </>
  );
}

/** The bounded panel: contextual heading, border progress and the numbered outline. */
export function TocPanel(props: TocPanelProps) {
  const view = { ...props.view, idPrefix: useId() };
  return (
    <nav
      aria-label={props.labels.title}
      aria-busy={!view.revealed}
      data-testid={props.testId}
      data-collapsed={props.collapsed ? 'true' : undefined}
      data-scope={props.scope}
      className={cn(
        'relative flex flex-col border bg-background/70 text-caption shadow-header backdrop-blur-xl backdrop-saturate-150 [interpolate-size:allow-keywords] rounded-2xl',
        'motion-reduce:transition-none transition-[width] duration-300 ease-out p-3',
        // 3.625rem = 2rem marker + 2 × p-3 + 2px border: the numbers keep their place.
        props.collapsed ? 'w-[3.625rem]' : 'w-full',
        props.className,
      )}
    >
      <TocBorder labels={props.labels} locale={view.locale} time={props.time} settled={view.settled} />
      <PanelContents {...props} view={view} />
    </nav>
  );
}
