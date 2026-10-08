'use client';

import { useContextDrawer } from '@/hooks/use-context-drawer';
import {
  DRAWER_PANEL_ID,
  DRAWER_TABS,
  drawerIds,
  reservesSpace,
  titleOfSlide,
  type DrawerTab,
} from '@/lib/context-drawer.pure';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import type { ContextEntry } from './context-entries';
import { ModeMenu, type ModeMenuLabels } from './drawer-mode-menu';
import { DrawerTabs } from './drawer-tabs';
import { DrawerTrigger } from './drawer-trigger';

export interface DrawerLabels {
  readonly title: string;
  readonly open: string;
  readonly close: string;
  readonly shortcut: string;
  readonly slide: string;
  readonly tabs: { readonly notes: string; readonly script: string };
  readonly menu: ModeMenuLabels;
}

type Drawer = ReturnType<typeof useContextDrawer>;

/*
 * The card wears the table of contents' chrome and keeps its gaps: it starts
 * below the sticky site header (top-24) and clears the bottom edge by 1rem.
 * Below `md` it rises above the scrim (z-70 over the scrim's 60 and the
 * header's 50). Its width is the one `--drawer-width` the grid spacer reads.
 */
const CARD = cn(
  'fixed top-24 right-4 bottom-4 z-40 flex w-[min(var(--drawer-width),calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-background/85 text-sm shadow-header backdrop-blur-xl backdrop-saturate-150',
  'max-md:z-[70] md:w-(--drawer-width) motion-reduce:[transition:none]',
);
// Only `transform` animates, never width or position. `visibility` flips to
// visible the instant the drawer opens, or the focus move on open lands on a
// still-hidden card and is dropped; on close it waits for the slide-out.
const OPENING = '[transform:translateX(0)] [transition:transform_300ms_ease-out,visibility_0s]';
const CLOSED =
  'invisible [transform:translateX(calc(100%+2rem))] [transition:transform_300ms_ease-in,visibility_0s_linear_300ms]';

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
      {/* The head names the current Slide on screen; print has no head, so each entry names itself. */}
      <h5 className="mb-2 hidden text-sm font-medium text-muted-foreground print:block">{entry.title}</h5>
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
      className={cn('flex flex-col gap-3 rounded-md focus-visible:outline-2', props.tab !== props.selected && 'hidden')}
    >
      <h4 className="hidden text-lg font-semibold print:block">{props.heading}</h4>
      {props.children}
    </div>
  );
}

/** Sticky: the Slide's title once, then the tabs, the layout menu and close. */
function PanelHead(props: { labels: DrawerLabels; drawer: Drawer; title: string }) {
  const { labels, drawer } = props;
  const tabs = DRAWER_TABS.map((id) => ({ id, label: labels.tabs[id] }));
  return (
    <div className="flex shrink-0 flex-col gap-3 border-b p-3 print:hidden">
      <div className="flex items-start gap-1 pl-1">
        <h4 className="flex-1 pt-1 text-base leading-snug font-semibold text-pretty">{props.title}</h4>
        <ModeMenu labels={labels.menu} mode={drawer.mode} onChange={drawer.setMode} />
        <button
          type="button"
          aria-label={labels.close}
          onClick={drawer.close}
          className="grid size-10 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:size-8"
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>
      <DrawerTabs
        tabs={tabs}
        selected={drawer.tab}
        idOf={drawerIds}
        onSelect={drawer.setTab}
        selectedRef={drawer.selectedTab}
      />
    </div>
  );
}

/** The one scroll container; it returns to the top when the Slide or tab changes. */
function PanelBody(props: { labels: DrawerLabels; drawer: Drawer; entries: readonly ContextEntry[] }) {
  const { labels, drawer, entries } = props;
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [drawer.current, drawer.tab]);
  return (
    <div ref={body} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
      {DRAWER_TABS.map((kind) => (
        <Panel key={kind} tab={kind} selected={drawer.tab} heading={labels.tabs[kind]}>
          <Entries entries={entries} current={drawer.current} kind={kind} />
        </Panel>
      ))}
    </div>
  );
}

function Card(props: { labels: DrawerLabels; drawer: Drawer; entries: readonly ContextEntry[] }) {
  const { labels, drawer, entries } = props;
  return (
    <div
      id={DRAWER_PANEL_ID}
      data-context-panel
      aria-label={labels.title}
      className={cn(CARD, drawer.open ? OPENING : CLOSED)}
    >
      <PanelHead labels={labels} drawer={drawer} title={titleOfSlide(drawer.current, entries, labels.title)} />
      <PanelBody labels={labels} drawer={drawer} entries={entries} />
    </div>
  );
}

/** The grid's reserved column, with no transition: the Slides reflow once, never per frame of the slide-in. */
function Spacer({ reserve }: { reserve: boolean }) {
  return (
    <div
      aria-hidden
      data-slot="context-spacer"
      className={cn('hidden md:block', reserve ? 'md:ml-12 md:w-(--drawer-width)' : 'md:w-0')}
    />
  );
}

/** Pointer-only dismiss for narrow screens; Escape and the close button serve the keyboard. */
function Scrim({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      aria-hidden
      data-slot="context-scrim"
      onClick={onClose}
      className={cn(
        'fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm motion-reduce:[transition:none] md:hidden print:hidden',
        open
          ? '[transition:opacity_300ms,visibility_0s]'
          : 'pointer-events-none invisible opacity-0 [transition:opacity_300ms,visibility_0s_linear_300ms]',
      )}
    />
  );
}

/**
 * The Context drawer (FE-010 §9): a floating card on the right. From `md` it
 * sits beside the Slides (the grid's third column opens at once, through the
 * spacer) or over them; below `md` it is always an overlay under a dimmed
 * scrim. It holds every Slide's server-rendered notes and script in the DOM and
 * only decides which are visible. Closed it is `invisible` and off-screen, so
 * print and find-in-page still reach the text.
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
        text={labels.title}
        hint={labels.shortcut}
        open={drawer.open}
        controls={DRAWER_PANEL_ID}
        onToggle={drawer.toggle}
      />
      <Spacer reserve={reservesSpace(drawer.mode, drawer.open)} />
      <Scrim open={drawer.open} onClose={drawer.close} />
      <Card labels={labels} drawer={drawer} entries={entries} />
    </>
  );
}
