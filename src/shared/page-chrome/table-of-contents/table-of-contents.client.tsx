'use client';

import { useAgentView } from '@/shared/hooks/use-agent-view';
import {
  useFractionInto,
  useOpenSections,
  useRevealed,
  useSettled,
  useTocCollapse,
} from '@/shared/hooks/use-table-of-contents';
import { useActiveSlide, useGlideTo } from '@/shared/hooks/use-url-state';
import type { Locale } from '@/shared/lib/locale.pure';
import {
  activeEntry,
  readingOrder,
  readingTime,
  TOC_DEFAULT_SCOPE,
  whereAt,
  type TocCollection,
  type TocPageContext,
  type TocSection,
} from '@/shared/lib/table-of-contents.pure';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { BackToTop } from '../back-to-top.client';
import { TocCollapseFlag } from './toc-collapse-flag.client';
import { TocDrawer } from './toc-drawer';
import type { TocLabels } from './toc-heading';
import { TocPanel, type TocView } from './toc-panel';

export type { TocSection } from '@/shared/lib/table-of-contents.pure';
export type { TocLabels } from './toc-heading';

const NOTHING = () => undefined;
const NEVER_CHANGES = () => NOTHING;

function useHydrated(): boolean {
  return useSyncExternalStore(
    NEVER_CHANGES,
    () => true,
    () => false,
  );
}

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
  panel: Omit<Parameters<typeof TocPanel>[0], 'className' | 'testId'>;
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
  page: TocPageContext;
  sections: readonly TocSection[];
  total: number;
  targetAttribute: string;
  topId: string;
  labels: TocLabels;
  collection?: TocCollection;
  agentView?: true;
}

function usePanel(props: TableOfContentsProps) {
  const { view, time } = useTocState({ ...props, route: props.page.route });
  const [scope, setScope] = useState(TOC_DEFAULT_SCOPE);
  const agentView = useAgentView(props.agentView === true);
  return {
    view,
    page: props.page,
    sections: props.sections,
    labels: props.labels,
    time,
    collection: props.collection,
    agentView: props.agentView ? agentView : undefined,
    scope,
    onToggleScope: () => setScope((value) => (value === 'page' ? 'collection' : 'page')),
  };
}

function MobilePanel({ panel }: { panel: ReturnType<typeof usePanel> }) {
  const { view, labels } = panel;
  return (
    <>
      {!view.atTop && (
        <BackToTop
          label={labels.backToTop}
          locale={view.locale}
          route={view.route}
          compact
          className="fixed right-20 bottom-4 z-40 rounded-full border bg-background/80 shadow-header backdrop-blur-xl md:hidden"
        />
      )}
      <TocDrawer labels={labels} where={view.revealed ? whereAt(panel.sections, view.active) : null}>
        <TocPanel {...panel} view={{ ...view, revealed: true }} className="h-full max-h-full bg-background pt-14" />
      </TocDrawer>
    </>
  );
}

/**
 * A reusable, page-agnostic table of contents. Fixed panel from `md`, pill-and-drawer below it.
 * From `md` it can collapse to show only the numbers, widening the content area.
 */
export function TableOfContents(props: TableOfContentsProps) {
  const panel = usePanel(props);
  const [collapsed, toggleCollapse] = useTocCollapse();
  return (
    <>
      <TocCollapseFlag collapsed={collapsed} />
      <DesktopPanel panel={panel} collapsed={collapsed} toggleCollapse={toggleCollapse} />
      <MobilePanel panel={panel} />
    </>
  );
}
