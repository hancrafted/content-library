'use client';

import { useContextDrawer } from '@/hooks/use-context-drawer';
import { DRAWER_PANEL_ID, DRAWER_TABS, drawerIds, type DrawerTab } from '@/lib/context-drawer.pure';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import type { ContextEntry } from './context-entries';
import { DrawerTabs } from './drawer-tabs';
import { DrawerTrigger } from './drawer-trigger';

export interface DrawerLabels {
  readonly title: string;
  readonly open: string;
  readonly close: string;
  readonly shortcut: string;
  readonly slide: string;
  readonly tabs: { readonly notes: string; readonly script: string };
}

// From `md` the panel starts below the sticky site header (top-4 plus its ~3.5rem
// height) so it never covers the header; below `md` the sheet sits above the
// table of contents pill (bottom-4, min-h-11), so it never covers that either.
const PANEL = cn(
  'fixed z-40 flex flex-col gap-3 overflow-y-auto border bg-background p-4 shadow-header',
  'md:top-24 md:right-0 md:h-[calc(100dvh-6rem)] md:w-[min(26rem,92vw)] md:border-y-0 md:border-r-0',
  'max-md:inset-x-0 max-md:bottom-20 max-md:h-[60dvh] max-md:border-x-0 max-md:border-b-0',
  'motion-reduce:[transition:none]',
);
// `visibility` must flip to visible the instant the drawer opens, or the focus
// move on open lands on a still-hidden panel and is dropped; on close it waits
// for the slide-out to finish.
const OPENING = '[transition:transform_300ms,visibility_0s]';
const CLOSED =
  'invisible max-md:translate-y-full md:translate-x-full [transition:transform_300ms,visibility_0s_linear_300ms]';

function Entries({
  entries,
  current,
  kind,
}: {
  entries: readonly ContextEntry[];
  current: string | null;
  kind: DrawerTab;
}) {
  return entries.map((entry) => (
    // The Tailwind `hidden` class, not the attribute: print overrides a class (FE-010 §2).
    <div key={entry.anchor} data-context-for={entry.anchor} className={cn(entry.anchor !== current && 'hidden')}>
      <h5 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{entry.title}</h5>
      {entry[kind]}
    </div>
  ));
}

function Panel(props: { tab: DrawerTab; selected: DrawerTab; heading: string; children: ReactNode }) {
  return (
    <div
      id={drawerIds(props.tab).panel}
      role="tabpanel"
      tabIndex={0}
      aria-labelledby={drawerIds(props.tab).tab}
      className={cn('flex flex-col gap-3', props.tab !== props.selected && 'hidden')}
    >
      <h4 className="hidden text-lg font-semibold print:block">{props.heading}</h4>
      {props.children}
    </div>
  );
}

function PanelHead(props: { labels: DrawerLabels; drawer: ReturnType<typeof useContextDrawer> }) {
  const { labels, drawer } = props;
  const tabs = DRAWER_TABS.map((id) => ({ id, label: labels.tabs[id] }));
  return (
    <div className="flex items-center justify-between gap-2">
      <DrawerTabs
        tabs={tabs}
        selected={drawer.tab}
        idOf={drawerIds}
        onSelect={drawer.setTab}
        selectedRef={drawer.selectedTab}
      />
      <button
        type="button"
        aria-label={labels.close}
        onClick={drawer.close}
        className="cursor-pointer rounded-full p-2 hover:bg-accent print:hidden"
      >
        <X aria-hidden className="size-4" />
      </button>
    </div>
  );
}

function PanelBody(props: {
  labels: DrawerLabels;
  drawer: ReturnType<typeof useContextDrawer>;
  entries: readonly ContextEntry[];
}) {
  const { labels, drawer, entries } = props;
  return (
    <>
      <PanelHead labels={labels} drawer={drawer} />
      {DRAWER_TABS.map((kind) => (
        <Panel key={kind} tab={kind} selected={drawer.tab} heading={labels.tabs[kind]}>
          <Entries entries={entries} current={drawer.current} kind={kind} />
        </Panel>
      ))}
    </>
  );
}

/**
 * The Context drawer (FE-010): a non-modal panel, right of the page from `md`
 * and a bottom sheet below. It holds every Slide's server-rendered notes and
 * script in the DOM and only decides which are visible. Closed it is
 * `invisible` and off-screen, so print and find-in-page still reach the text.
 */
export function ContextDrawer(props: {
  labels: DrawerLabels;
  entries: readonly ContextEntry[];
  targetAttribute: string;
}) {
  const { labels, entries } = props;
  const anchors = useMemo(() => entries.map((entry) => entry.anchor), [entries]);
  const drawer = useContextDrawer(anchors, props.targetAttribute);
  return (
    <>
      <DrawerTrigger
        ref={drawer.trigger}
        label={drawer.open ? labels.close : labels.open}
        hint={labels.shortcut}
        open={drawer.open}
        controls={DRAWER_PANEL_ID}
        onToggle={drawer.toggle}
      />
      <div
        id={DRAWER_PANEL_ID}
        data-context-panel
        aria-label={labels.title}
        className={cn(PANEL, drawer.open ? OPENING : CLOSED)}
      >
        <PanelBody labels={labels} drawer={drawer} entries={entries} />
      </div>
    </>
  );
}
