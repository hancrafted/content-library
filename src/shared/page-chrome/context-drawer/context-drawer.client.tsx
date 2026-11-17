'use client';

import { useContextDrawer } from '@/shared/hooks/use-context-drawer';
import { revealCitation } from '@/shared/hooks/use-context-links';
import { useActiveSlide } from '@/shared/hooks/use-url-state';
import {
  DRAWER_BESIDE_ATTR,
  DRAWER_PANEL_ID,
  DRAWER_TABS,
  drawerIds,
  keepReadingScroll,
  sitsBeside,
  titleOfItem,
  type DrawerTab,
} from '@/shared/lib/context-drawer.pure';
import { CONTEXT_ITEM_ATTR, CONTEXT_SCROLL_ATTR } from '@/shared/lib/context-link.pure';
import { READING_LINE } from '@/shared/lib/reading-line.pure';
import { cn } from '@/shared/lib/utils';
import { X } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import type { DrawerStrings } from './context-drawer-input';
import type { ContextEntry } from './context-entries';
import { ModeMenu } from './drawer-mode-menu';
import { DrawerTabs } from './drawer-tabs';
import { DrawerTrigger } from './drawer-trigger';

type Drawer = ReturnType<typeof useContextDrawer>;

const CARD = cn(
  'fixed top-24 right-4 bottom-4 z-40 flex w-[min(var(--drawer-width),calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-background text-body shadow-header',
  'max-md:top-32 max-md:z-[70] md:w-(--drawer-width) motion-reduce:[transition:none]',
);
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
    // decision: FE-010 §2
    <div key={entry.id} {...{ [CONTEXT_ITEM_ATTR]: entry.id }} className={cn(entry.id !== current && 'hidden')}>
      {entry.title && (
        <h5 className="mb-2 hidden text-body font-medium text-muted-foreground print:block">{entry.title}</h5>
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
      <h4 className="hidden text-body font-semibold print:block">{props.heading}</h4>
      {props.children}
    </div>
  );
}

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
      <h4 className="px-1 text-body leading-snug font-semibold text-balance break-words">{props.title}</h4>
    </div>
  );
}

function PanelBody(props: { labels: DrawerStrings; drawer: Drawer; entries: readonly ContextEntry[] }) {
  const { labels, drawer, entries } = props;
  const body = useRef<HTMLDivElement>(null);
  const leftTop = useRef(false);
  useEffect(() => {
    if (!leftTop.current) return;
    leftTop.current = false;
    body.current?.scrollTo({ top: 0 });
  }, [drawer.current, drawer.tab]);
  return (
    <div
      ref={body}
      {...{ [CONTEXT_SCROLL_ATTR]: '' }}
      onScroll={(event) => {
        leftTop.current = event.currentTarget.scrollTop > 0;
      }}
      onClick={revealCitation}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
    >
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

function slideBox(id: string | null): { top: number; height: number } | null {
  const rect = id === null ? undefined : document.getElementById(id)?.getBoundingClientRect();
  return rect ? { top: rect.top, height: rect.height } : null;
}

// decision: FE-009 §2
function BesideFlag({ beside }: { beside: boolean }) {
  const slide = useActiveSlide();
  useLayoutEffect(() => {
    const page = document.querySelector('[data-slot="episode-page"]');
    if (!page || page.getAttribute(DRAWER_BESIDE_ATTR) === String(beside)) return;
    const before = slideBox(slide);
    page.setAttribute(DRAWER_BESIDE_ATTR, String(beside));
    const after = slideBox(slide);
    const line = window.innerHeight * READING_LINE;
    if (before && after) window.scrollBy({ top: keepReadingScroll(before, after, line), behavior: 'instant' });
  }, [beside, slide]);
  useEffect(() => () => document.querySelector('[data-slot="episode-page"]')?.removeAttribute(DRAWER_BESIDE_ATTR), []);
  return null;
}

function Scrim({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      aria-hidden
      data-slot="context-scrim"
      onClick={onClose}
      className={cn(
        'fixed inset-0 z-[60] bg-overlay/40 backdrop-blur-sm motion-reduce:[transition:none] md:hidden print:hidden',
        open
          ? '[transition:opacity_250ms_ease-out,visibility_0s]'
          : 'pointer-events-none invisible opacity-0 [transition:opacity_200ms_ease-in,visibility_0s_linear_200ms]',
      )}
    />
  );
}

// decision: FE-010 §7
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
      <BesideFlag beside={sitsBeside(drawer.mode, drawer.open)} />
      <Scrim open={drawer.open} onClose={drawer.close} />
      <Card labels={labels} drawer={drawer} entries={entries} />
    </>
  );
}
