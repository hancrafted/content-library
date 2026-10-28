import type { ReadingTime, TocSection } from '@/shared/lib/table-of-contents.pure';
import { cn } from '@/shared/lib/utils';
import { useId } from 'react';
import { ProgressBar, TocHeading, type TocLabels } from './toc-heading';
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

/** Progress bar and sections, folded away while the loading box shows. */
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
      <div className="flex min-h-0 flex-col overflow-hidden">
        <div
          className={cn(
            'overflow-hidden motion-reduce:transition-none transition-opacity duration-300 ease-out',
            collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100',
          )}
        >
          <ProgressBar labels={labels} locale={view.locale} time={props.time} settled={view.settled} />
        </div>
        <SectionList view={view} sections={props.sections} toggleLabel={labels.toggle} collapsed={collapsed} />
      </div>
    </div>
  );
}

function PanelHeading(props: {
  view: TocView;
  labels: TocLabels;
  time: ReadingTime;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const { view } = props;
  return (
    <TocHeading
      labels={props.labels}
      locale={view.locale}
      route={view.route}
      topId={view.topId}
      atTop={view.atTop}
      onGlide={view.glideTo}
      time={props.time}
      revealed={view.revealed}
      collapsed={props.collapsed}
      onToggleCollapse={props.onToggleCollapse}
    />
  );
}

/** The bounded panel: heading with time left and progress, then the numbered sections. */
export function TocPanel(props: {
  view: TocView;
  sections: readonly TocSection[];
  labels: TocLabels;
  time: ReadingTime;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  testId?: string;
}) {
  const view = { ...props.view, idPrefix: useId() };
  return (
    <nav
      aria-label={props.labels.title}
      aria-busy={!view.revealed}
      data-testid={props.testId}
      data-collapsed={props.collapsed ? 'true' : undefined}
      className={cn(
        'flex flex-col border bg-background/70 text-caption shadow-header backdrop-blur-xl backdrop-saturate-150 [interpolate-size:allow-keywords] rounded-2xl overflow-hidden',
        'motion-reduce:transition-none transition-[width] duration-300 ease-out p-3',
        // 3.625rem = 2rem marker + 2 × p-3 + 2px border: the numbers keep their place.
        props.collapsed ? 'w-[3.625rem]' : 'w-full',
        props.className,
      )}
    >
      <PanelHeading {...props} view={view} />
      <TocBody {...props} view={view} />
    </nav>
  );
}
