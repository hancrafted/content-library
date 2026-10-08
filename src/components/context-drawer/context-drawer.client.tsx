'use client';

import { useContextDrawer } from '@/hooks/use-context-drawer';
import { revealCitation } from '@/hooks/use-context-links';
import {
  DRAWER_PANEL_ID,
  DRAWER_TABS,
  drawerIds,
  reservesSpace,
  titleOfItem,
  type DrawerTab,
} from '@/lib/context-drawer.pure';
import { CONTEXT_ITEM_ATTR } from '@/lib/context-link.pure';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import type { DrawerStrings } from './context-drawer-input';
import type { ContextEntry } from './context-entries';
import { ModeMenu } from './drawer-mode-menu';
import { DrawerTabs } from './drawer-tabs';
import { DrawerTrigger } from './drawer-trigger';

type Drawer = ReturnType<typeof useContextDrawer>;

/*
 * The card wears the table of contents' border, radius and shadow, but is opaque:
 * it overlaps Slide text in overlay mode and under the scrim, where translucency
 * ghosts. It starts below the sticky site header (top-24; top-32 below `md`,
 * where the header wraps to two rows) and clears the bottom edge by 1rem.
 * Below `md` it rises above the scrim (z-70 over the scrim's 60 and the
 * header's 50). Its width is the one `--drawer-width` the grid spacer reads.
 */
const CARD = cn(
  'fixed top-24 right-4 bottom-4 z-40 flex w-[min(var(--drawer-width),calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-background text-sm shadow-header',
  'max-md:top-32 max-md:z-[70] md:w-(--drawer-width) motion-reduce:[transition:none]',
);
// Only `transform` animates, never width or position. `visibility` flips to
// visible the instant the drawer opens, or the focus move on open lands on a
// still-hidden card and is dropped; on close it waits for the slide-out.
const OPENING = '[transform:translateX(0)] [transition:transform_250ms_ease-out,visibility_0s]';
const CLOSED =
  'invisible [transform:translateX(calc(100%+2rem))] [transition:transform_200ms_ease-in,visibility_0s_linear_200ms]';

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
    <div key={entry.id} {...{ [CONTEXT_ITEM_ATTR]: entry.id }} className={cn(entry.id !== current && 'hidden')}>
      {/* The head names the current item on screen; print has no head, so each entry names itself. */}
      {entry.title && (
        <h5 className="mb-2 hidden text-sm font-medium text-muted-foreground print:block">{entry.title}</h5>
      )}
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

/** Sticky. Row one: tabs left, layout menu and close right. Row two: the current item's title, free to wrap without moving the tabs. */
function PanelHead(props: { labels: DrawerStrings; drawer: Drawer; title: string }) {
  const { labels, drawer } = props;
  const tabs = DRAWER_TABS.map((id) => ({ id, label: labels.tabs[id] }));
  return (
    <div className="flex shrink-0 flex-col gap-2 border-b p-3 print:hidden">
      <div className="flex items-center justify-between gap-1">
        <DrawerTabs
          tabs={tabs}
          selected={drawer.tab}
          idOf={drawerIds}
          onSelect={drawer.setTab}
          selectedRef={drawer.selectedTab}
        />
        <div className="flex shrink-0 items-center gap-1">
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
      </div>
      <h4 className="px-1 text-lg leading-snug font-semibold text-balance break-words">{props.title}</h4>
    </div>
  );
}

/** The one scroll container; it returns to the top when the item or tab changes. */
function PanelBody(props: { labels: DrawerStrings; drawer: Drawer; entries: readonly ContextEntry[] }) {
  const { labels, drawer, entries } = props;
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [drawer.current, drawer.tab]);
  return (
    <div ref={body} onClick={revealCitation} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
      {DRAWER_TABS.map((kind) => (
        <Panel key={kind} tab={kind} selected={drawer.tab} heading={labels.tabs[kind]}>
          <Entries entries={entries} current={drawer.current} kind={kind} />
        </Panel>
      ))}
    </div>
  );
}

function Card(props: { labels: DrawerStrings; drawer: Drawer; entries: readonly ContextEntry[] }) {
  const { labels, drawer, entries } = props;
  return (
    <div
      id={DRAWER_PANEL_ID}
      data-context-panel
      aria-label={labels.title}
      className={cn(CARD, drawer.open ? OPENING : CLOSED)}
    >
      <PanelHead labels={labels} drawer={drawer} title={titleOfItem(drawer.current, entries, labels.title)} />
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
      className={cn('hidden xl:block', reserve ? 'xl:ml-12 xl:w-(--drawer-width)' : 'xl:w-0')}
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
          ? '[transition:opacity_250ms_ease-out,visibility_0s]'
          : 'pointer-events-none invisible opacity-0 [transition:opacity_200ms_ease-in,visibility_0s_linear_200ms]',
      )}
    />
  );
}

/**
 * The Context drawer (FE-010 §7): a floating card on the right. From `xl` it
 * sits beside the Slides (the grid's third column opens at once, through the
 * spacer) or over them; below `xl` it is always an overlay, under a dimmed
 * scrim below `md`. It holds every item's server-rendered notes and script in the DOM and
 * only decides which are visible. Closed it is `invisible` and off-screen, so
 * print and find-in-page still reach the text.
 */
export function ContextDrawer(props: { labels: DrawerStrings; entries: readonly ContextEntry[] }) {
  const { labels, entries } = props;
  const ids = useMemo(() => entries.map((entry) => entry.id), [entries]);
  const drawer = useContextDrawer(ids);
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
