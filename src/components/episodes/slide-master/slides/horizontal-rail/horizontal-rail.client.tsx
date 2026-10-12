'use client';

import { useSlideZone } from '@/hooks/use-slide-zone';
import { cn } from '@/lib/utils';
import { useCallback, useId, useState, type FocusEvent, type MouseEvent } from 'react';
import { RailToggletip, type ToggletipCopy } from './horizontal-rail-toggletip.client';
import { dotDelayMs, RAIL_ITEMS, railSide, segmentTiming, type RailItem, type RailSide } from './horizontal-rail.pure';

/** From `md` the rail runs across and labels alternate; below it the rail runs down and every label sits beside its dot. */
const ACROSS = '(min-width: 48rem)';

interface Open {
  item: RailItem;
  /** A click pins the toggletip; a hover or focus only previews it. */
  pinned: boolean;
  anchor: HTMLElement;
  side: RailSide;
}

/** Reads the label's element at once: React clears `currentTarget` before a state updater runs. */
function openFor(
  { item, index }: { item: RailItem; index: number },
  event: MouseEvent | FocusEvent,
  pinned: boolean,
): Open {
  const target = event.currentTarget as HTMLElement;
  const anchor = target.closest('li') ?? target;
  const side = window.matchMedia(ACROSS).matches ? railSide(index) : 'below';
  return { item, pinned, anchor, side };
}

/** Which dot's toggletip is open: hover and focus preview, a click pins or unpins, leaving or blurring drops a preview. */
function useToggletip() {
  const [open, setOpen] = useState<Open | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const handlersFor = (item: RailItem, index: number) => ({
    onMouseEnter: (event: MouseEvent) => {
      const next = openFor({ item, index }, event, false);
      setOpen((now) => (now?.pinned ? now : next));
    },
    onMouseLeave: () => setOpen((now) => (now?.item === item && !now.pinned ? null : now)),
    onFocus: (event: FocusEvent) => {
      const next = openFor({ item, index }, event, false);
      setOpen((now) => (now?.item === item ? now : next));
    },
    onBlur: () => setOpen((now) => (now?.item === item ? null : now)),
    onClick: (event: MouseEvent) => {
      const next = openFor({ item, index }, event, true);
      setOpen((now) => (now?.item === item && now.pinned ? null : next));
    },
  });
  return { open, close, handlersFor };
}

/** Plays once: the first time the Slide reaches the reading line, the line draws and the dots pop in. */
function useDrawn(): boolean {
  const zone = useSlideZone();
  const [drawn, setDrawn] = useState(false);
  if (!drawn && zone === 'active') setDrawn(true);
  return drawn;
}

/** The six milestones on one hairline; each dot opens its caption as a toggletip. */
export function HorizontalRail({ label, items }: { label: string; items: Record<RailItem, ToggletipCopy> }) {
  const baseId = useId();
  const drawn = useDrawn();
  const { open, close, handlersFor } = useToggletip();
  return (
    <ol
      role="list"
      aria-label={label}
      data-slot="horizontal-rail"
      data-drawn={drawn}
      className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-[auto_auto_auto]"
    >
      {RAIL_ITEMS.map((item, index) => (
        <RailStop
          key={item}
          index={index}
          copy={items[item]}
          drawn={drawn}
          open={open?.item === item ? open : null}
          onClose={close}
          tipId={`${baseId}-${item}`}
          handlers={handlersFor(item, index)}
        />
      ))}
    </ol>
  );
}

interface StopProps {
  index: number;
  copy: ToggletipCopy;
  drawn: boolean;
  /** Set while this stop's toggletip is open. */
  open: Open | null;
  onClose: () => void;
  tipId: string;
  handlers: ReturnType<ReturnType<typeof useToggletip>['handlersFor']>;
}

function RailStop({ index, copy, drawn, open, onClose, tipId, handlers }: StopProps) {
  const above = railSide(index) === 'above';
  const expanded = open !== null;
  const { onMouseEnter, onMouseLeave, ...buttonHandlers } = handlers;
  return (
    <li
      data-side={railSide(index)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="grid grid-cols-[3rem_1fr] gap-x-4 md:row-span-3 md:grid-cols-1 md:grid-rows-subgrid md:gap-x-0"
    >
      <div className="relative col-start-1 row-start-1 flex items-center justify-center py-6 md:row-start-2 md:py-0">
        <RailSegment index={index} drawn={drawn} />
        <RailDot index={index} drawn={drawn} expanded={expanded} tipId={tipId} copy={copy} handlers={buttonHandlers} />
      </div>
      <RailLabel index={index} copy={copy} above={above} expanded={expanded} />
      {open && <RailToggletip id={tipId} anchor={open.anchor} side={open.side} copy={copy} onClose={onClose} />}
    </li>
  );
}

/** This column's share of the line: down the left edge below `md`, across from `md`. */
function RailSegment({ index, drawn }: { index: number; drawn: boolean }) {
  const { delayMs, durationMs } = segmentTiming(index, RAIL_ITEMS.length);
  return (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-1/2 w-px bg-border md:inset-x-0 md:inset-y-auto md:top-1/2 md:h-px md:w-auto"
      />
      <span
        aria-hidden="true"
        style={{ transitionDelay: `${delayMs}ms`, transitionDuration: `${durationMs}ms` }}
        className={cn(
          'absolute inset-y-0 left-1/2 w-px origin-top bg-foreground transition-[scale] ease-linear md:inset-x-0 md:inset-y-auto md:top-1/2 md:h-px md:w-auto md:origin-left',
          drawn ? 'scale-100' : 'scale-y-0 md:scale-x-0 md:scale-y-100',
          'motion-reduce:scale-100! print:scale-100!',
        )}
      />
    </>
  );
}

interface DotProps {
  index: number;
  drawn: boolean;
  expanded: boolean;
  tipId: string;
  copy: ToggletipCopy;
  handlers: Omit<StopProps['handlers'], 'onMouseEnter' | 'onMouseLeave'>;
}

function RailDot({ index, drawn, expanded, tipId, copy, handlers }: DotProps) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-describedby={expanded ? tipId : undefined}
      aria-label={`${copy.date}, ${copy.title}`}
      {...handlers}
      className="group relative grid size-12 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        aria-hidden="true"
        style={{ transitionDelay: drawn ? `${dotDelayMs(index, RAIL_ITEMS.length)}ms` : undefined }}
        className={cn(
          'block size-5 rounded-full border-2 border-foreground bg-background transition-[scale,opacity,background-color,border-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-125',
          expanded && 'scale-125 border-brand-accent bg-brand-accent',
          !drawn && 'scale-0 opacity-0',
          'motion-reduce:scale-100! motion-reduce:opacity-100! print:scale-100! print:opacity-100!',
        )}
      />
    </button>
  );
}

interface LabelProps {
  index: number;
  copy: ToggletipCopy;
  above: boolean;
  expanded: boolean;
}

function RailLabel({ index, copy, above, expanded }: LabelProps) {
  return (
    <div
      className={cn(
        'col-start-2 row-start-1 flex flex-col justify-center gap-1 py-4 md:col-start-1 md:items-center md:px-2 md:text-center',
        'relative md:before:absolute md:before:left-1/2 md:before:h-4 md:before:w-px md:before:bg-border',
        above
          ? 'md:row-start-1 md:justify-end md:pb-6 md:before:bottom-0'
          : 'md:row-start-3 md:justify-start md:pt-6 md:before:top-0',
      )}
    >
      <span aria-hidden="true" className="font-mono text-body tracking-[0.3em] text-muted-foreground">
        {String(index + 1).padStart(2, '0')}
      </span>
      <time
        dateTime={copy.date}
        className={cn(
          'font-mono text-heading font-normal tracking-tight tabular-nums transition-colors',
          expanded && 'text-brand-accent',
        )}
      >
        {copy.date}
      </time>
      <span className="text-body font-medium tracking-wide text-muted-foreground uppercase">{copy.title}</span>
    </div>
  );
}
