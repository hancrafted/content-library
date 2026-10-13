'use client';

import { useCallback, useId, useState, type CSSProperties, type FocusEvent, type MouseEvent } from 'react';
import { RailToggletip, type ToggletipCopy } from './horizontal-rail-toggletip.client';
import {
  dotDelayMs,
  gapFadeDelayMs,
  RAIL_ITEMS,
  railSide,
  runsAcross,
  segmentHalves,
  stopKind,
  type RailItem,
  type RailSide,
} from './horizontal-rail.pure';
import styles from './rail.module.css';

/** The stop that carries the `checks` note target. */
const FIRST_CHECK_IN = RAIL_ITEMS.find((item) => stopKind(item) === 'check-in');

interface Open {
  item: RailItem;
  /** A click pins the toggletip; a hover or focus only previews it. */
  pinned: boolean;
  anchor: HTMLElement;
  side: RailSide;
}

/** The root font size in px, which the rail's own width is measured against. */
function remPx(): number {
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
}

/**
 * Reads the label's element at once: React clears `currentTarget` before a state updater runs. The side follows the
 * rail's own width, not the viewport, so the drawer beside it turns the rail down and the toggletip below.
 */
function openFor(
  { item, index }: { item: RailItem; index: number },
  event: MouseEvent | FocusEvent,
  pinned: boolean,
): Open {
  const target = event.currentTarget as HTMLElement;
  const anchor = target.closest('li') ?? target;
  const rail = target.closest('ol');
  const across = rail !== null && runsAcross(rail.getBoundingClientRect().width, remPx());
  const side = across ? railSide(index) : 'below';
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

/** A delay (and duration) for the rail's CSS entrance, read by `rail.module.css`. */
function timing(delayMs: number, durationMs?: number): CSSProperties {
  return {
    '--delay': `${delayMs}ms`,
    ...(durationMs !== undefined && { '--duration': `${durationMs}ms` }),
  } as CSSProperties;
}

interface RailProps {
  label: string;
  items: Record<RailItem, ToggletipCopy>;
  /** The note target the first check-in (13:00) carries: a note target resolves to exactly one element. */
  checks: { 'data-target': string };
}

/**
 * The first working day on one line: four hand-overs in the morning, a dashed gap while they work, two check-ins.
 * It runs across once its own container is 64rem wide, else down with each label beside its dot. Each dot opens its
 * one spoken line as a toggletip. The line and dots draw in by CSS each time the Slide becomes active.
 */
export function HorizontalRail({ label, items, checks }: RailProps) {
  const baseId = useId();
  const { open, close, handlersFor } = useToggletip();
  return (
    <div className="@container">
      <ol
        role="list"
        aria-label={label}
        data-slot="horizontal-rail"
        className="grid grid-cols-1 @5xl:grid-cols-6 @5xl:grid-rows-[auto_auto_auto]"
      >
        {RAIL_ITEMS.map((item, index) => (
          <RailStop
            key={item}
            item={item}
            index={index}
            copy={items[item]}
            checks={checks}
            open={open?.item === item ? open : null}
            onClose={close}
            tipId={`${baseId}-${item}`}
            handlers={handlersFor(item, index)}
          />
        ))}
      </ol>
    </div>
  );
}

interface StopProps {
  item: RailItem;
  index: number;
  copy: ToggletipCopy;
  checks: { 'data-target': string };
  /** Set while this stop's toggletip is open. */
  open: Open | null;
  onClose: () => void;
  tipId: string;
  handlers: ReturnType<ReturnType<typeof useToggletip>['handlersFor']>;
}

function RailStop({ item, index, copy, checks, open, onClose, tipId, handlers }: StopProps) {
  const above = railSide(index) === 'above';
  const checkIn = stopKind(item) === 'check-in';
  const expanded = open !== null;
  const { onMouseEnter, onMouseLeave, ...buttonHandlers } = handlers;
  return (
    <li
      {...(item === FIRST_CHECK_IN && checks)}
      data-side={railSide(index)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="grid grid-cols-[3rem_1fr] gap-x-4 @5xl:row-span-3 @5xl:grid-cols-1 @5xl:grid-rows-subgrid @5xl:gap-x-0"
    >
      <div className="relative col-start-1 row-start-1 flex items-center justify-center py-6 @5xl:row-start-2 @5xl:py-0">
        <RailSegment index={index} />
        <RailDot
          index={index}
          checkIn={checkIn}
          expanded={expanded}
          tipId={tipId}
          copy={copy}
          handlers={buttonHandlers}
        />
      </div>
      <RailLabel copy={copy} above={above} checkIn={checkIn} />
      {open && <RailToggletip id={tipId} anchor={open.anchor} side={open.side} copy={copy} onClose={onClose} />}
    </li>
  );
}

/** Where each half of a column's line sits: down the cell below `@5xl`, across it from `@5xl`. */
const HALF = ['top-0 bottom-1/2 @5xl:left-0 @5xl:right-1/2', 'top-1/2 bottom-0 @5xl:left-1/2 @5xl:right-0'] as const;

/** This column's share of the line, in two halves around its dot; the halves in the gap are dashed and never drawn. */
function RailSegment({ index }: { index: number }) {
  const halves = segmentHalves(index, RAIL_ITEMS.length);
  return (
    <>
      {halves.map((half, at) =>
        half.dashed ? (
          <span
            key={at}
            aria-hidden="true"
            style={timing(gapFadeDelayMs(RAIL_ITEMS.length))}
            className={`absolute left-1/2 w-0 border-l border-dashed border-border @5xl:top-1/2 @5xl:bottom-auto @5xl:h-0 @5xl:w-auto @5xl:border-t @5xl:border-l-0 ${HALF[at]} ${styles.gap}`}
          />
        ) : (
          <span key={at} aria-hidden="true">
            <span
              className={`absolute left-1/2 w-px bg-border @5xl:top-1/2 @5xl:bottom-auto @5xl:h-px @5xl:w-auto ${HALF[at]}`}
            />
            <span
              style={timing(half.delayMs, half.durationMs)}
              className={`absolute left-1/2 w-px bg-foreground @5xl:top-1/2 @5xl:bottom-auto @5xl:h-px @5xl:w-auto ${HALF[at]} ${styles.stroke}`}
            />
          </span>
        ),
      )}
    </>
  );
}

interface DotProps {
  index: number;
  checkIn: boolean;
  expanded: boolean;
  tipId: string;
  copy: ToggletipCopy;
  handlers: Omit<StopProps['handlers'], 'onMouseEnter' | 'onMouseLeave'>;
}

/** A hand-over's dot is hollow and fills when open; a check-in's dot is filled in your colour. */
function RailDot({ index, checkIn, expanded, tipId, copy, handlers }: DotProps) {
  const fill = checkIn
    ? 'border-human bg-human'
    : expanded
      ? 'border-foreground bg-foreground'
      : 'border-foreground bg-background';
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
        style={timing(dotDelayMs(index, RAIL_ITEMS.length))}
        className={`block size-5 rounded-full border-2 transition-[scale,background-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-125 motion-reduce:transition-none ${fill} ${expanded ? 'scale-125' : ''} ${styles.dot}`}
      />
    </button>
  );
}

/** The time and the plain action, readable at rest: beside the dot below `@5xl`, alternating above and below from it. */
function RailLabel({ copy, above, checkIn }: { copy: ToggletipCopy; above: boolean; checkIn: boolean }) {
  const side = above
    ? '@5xl:row-start-1 @5xl:justify-end @5xl:pb-6 @5xl:before:bottom-0'
    : '@5xl:row-start-3 @5xl:justify-start @5xl:pt-6 @5xl:before:top-0';
  return (
    <div
      className={`relative col-start-2 row-start-1 flex flex-col justify-center gap-1 py-4 @5xl:col-start-1 @5xl:items-center @5xl:px-2 @5xl:text-center @5xl:before:absolute @5xl:before:left-1/2 @5xl:before:h-4 @5xl:before:w-px @5xl:before:bg-border ${side}`}
    >
      <time
        dateTime={copy.date}
        className={`font-mono text-subheading font-normal tabular-nums ${checkIn ? 'text-human' : 'text-foreground'}`}
      >
        {copy.date}
      </time>
      <span className="text-body font-medium text-balance text-foreground">{copy.title}</span>
    </div>
  );
}
