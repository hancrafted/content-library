'use client';

import {
  useFractionInto,
  useOpenSections,
  useRevealed,
  useSettled,
  useTocCollapse,
} from '@/shared/hooks/use-table-of-contents';
import { useActiveSlide, useGlideTo } from '@/shared/hooks/use-url-state';
import type { Locale } from '@/shared/lib/locale.pure';
import { hasReadingTime, remainingLabel } from '@/shared/lib/speaking-time.pure';
import {
  activeEntry,
  readingOrder,
  readingTime,
  whereAt,
  type ReadingTime,
  type TocSection,
} from '@/shared/lib/table-of-contents.pure';
import { useMemo, useSyncExternalStore } from 'react';
import { TocCollapseFlag } from './toc-collapse-flag.client';
import { TocDrawer } from './toc-drawer';
import type { TocLabels } from './toc-heading';
import { TocPanel, type TocView } from './toc-panel';

export type { TocSection } from '@/shared/lib/table-of-contents.pure';
export type { TocLabels } from './toc-heading';

const NOTHING = () => undefined;
const NEVER_CHANGES = () => NOTHING;

/** False in prerendered HTML and during hydration, true after: the URL's hash is only known to the client. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    NEVER_CHANGES,
    () => true,
    () => false,
  );
}

/** Active entry, open sections and reading time, all derived from the active Slide in the URL. */
function useTocState(props: {
  locale: Locale;
  route: string;
  sections: readonly TocSection[];
  total: number;
  targetAttribute: string;
  topId: string;
}) {
  const glideTo = useGlideTo();
  const order = useMemo(() => readingOrder(props.sections), [props.sections]);
  const slide = useActiveSlide();
  const active = activeEntry(order.owners, slide, props.topId);
  const atTop = slide === props.topId;
  const fraction = useFractionInto(slide, props.targetAttribute);
  // The server cannot know the hash, so the table holds its loading box until the client has read it.
  const settled = useSettled(useHydrated() ? slide : null);
  const revealed = useRevealed(settled);
  const time = readingTime(
    { minutes: order.minutes, total: props.total },
    slide ? order.ids.indexOf(slide) : -1,
    fraction,
  );
  const { open, toggle } = useOpenSections(props.sections, active);
  const { locale, route, topId } = props;
  const base = { locale, route, topId, atTop, glideTo, active, open, toggle };
  const view: TocView = { ...base, settled, revealed };
  return { view, time };
}

function DesktopPanel(props: {
  panel: { view: TocView; sections: readonly TocSection[]; labels: TocLabels; time: ReadingTime };
  collapsed: boolean;
  toggleCollapse: () => void;
}) {
  const { panel, collapsed, toggleCollapse } = props;
  const panelClass = 'hidden max-h-[calc(100svh-7rem-var(--toc-reserve,0px))] md:flex';
  return (
    <TocPanel {...panel} collapsed={collapsed} onToggleCollapse={toggleCollapse} testId="toc" className={panelClass} />
  );
}

export interface TableOfContentsProps {
  locale: Locale;
  route: string;
  sections: readonly TocSection[];
  /** The whole reading time in minutes, as the landing card quotes it; 0 shows no time. */
  total: number;
  targetAttribute: string;
  /** The id of the Slide at the top of the page: no entry is current there, and the heading links to it. */
  topId: string;
  labels: TocLabels;
}

/**
 * A reusable, page-agnostic table of contents. Fixed panel from `md`, pill-and-drawer below it.
 * From `md` it can collapse to show only the numbers, widening the content area.
 */
export function TableOfContents(props: TableOfContentsProps) {
  const { view, time } = useTocState(props);
  const [collapsed, toggleCollapse] = useTocCollapse();
  const panel = { view, sections: props.sections, labels: props.labels, time };
  const remaining = hasReadingTime(time.total)
    ? remainingLabel(props.labels.remaining, props.locale, time.remaining)
    : undefined;

  return (
    <>
      <TocCollapseFlag collapsed={collapsed} />
      <DesktopPanel panel={panel} collapsed={collapsed} toggleCollapse={toggleCollapse} />
      <TocDrawer
        labels={props.labels}
        where={view.revealed ? whereAt(props.sections, view.active) : null}
        revealed={view.revealed}
        left={remaining}
      >
        <TocPanel {...panel} view={{ ...view, revealed: true }} className="h-full max-h-full bg-background pt-14" />
      </TocDrawer>
    </>
  );
}
