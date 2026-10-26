'use client';

import { cn } from '@/shared/lib/utils';
import { useCallback, useId, useState, type ReactNode } from 'react';
import { GanttBar, LANE_CLASS, type BarHandlers } from './horizontal-gantt-bar.client';
import { GanttTooltip, type BarCopy } from './horizontal-gantt-tooltip.client';
import {
  AXIS_MONTHS,
  GANTT_BARS,
  GANTT_ITEMS,
  GANTT_LANES,
  TODAY,
  type GanttItem,
  type GanttLane,
} from './horizontal-gantt.pure';

const QUARTERS = [1, 2, 3, 4] as const;

/** Each lane's grid row: the axis takes row 1, so lanes start at 2 and a lane's name and track share its row. */
const LANE_ROW: Record<GanttLane, string> = { a: 'row-start-2', b: 'row-start-3', c: 'row-start-4' };

const TODAY_LEFT = `${(TODAY / AXIS_MONTHS) * 100}%`;

interface Open {
  item: GanttItem;
  /** A click pins the tooltip; a hover or focus only previews it. */
  pinned: boolean;
  anchor: HTMLElement;
}

/**
 * Which bar's tooltip is open: hover and focus preview, a click pins or
 * unpins, leaving or blurring drops a preview. Each handler reads
 * `currentTarget` at once: React clears it before a state updater runs.
 */
function useTooltip() {
  const [open, setOpen] = useState<Open | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const handlersFor = (item: GanttItem): BarHandlers => ({
    onMouseEnter: (event) => {
      const next = { item, pinned: false, anchor: event.currentTarget };
      setOpen((now) => (now?.pinned ? now : next));
    },
    onMouseLeave: () => setOpen((now) => (now?.item === item && !now.pinned ? null : now)),
    onFocus: (event) => {
      const next = { item, pinned: false, anchor: event.currentTarget };
      setOpen((now) => (now?.item === item ? now : next));
    },
    onBlur: () => setOpen((now) => (now?.item === item ? null : now)),
    onClick: (event) => {
      const next = { item, pinned: true, anchor: event.currentTarget };
      setOpen((now) => (now?.item === item && now.pinned ? null : next));
    },
  });
  return { open, close, handlersFor };
}

interface GanttProps {
  label: string;
  lanes: Record<GanttLane, string>;
  items: Record<GanttItem, BarCopy>;
}

/** A year of phases in three lanes: bars on a quarter axis, a "today" line through them, each bar's caption a tooltip. */
export function HorizontalGantt({ label, lanes, items }: GanttProps) {
  const baseId = useId();
  const { open, close, handlersFor } = useTooltip();
  return (
    <div role="group" aria-label={label} data-slot="horizontal-gantt" className="overflow-x-auto">
      <div className="relative grid min-w-[38rem] grid-cols-[6.5rem_1fr] md:grid-cols-[8.5rem_1fr]">
        <QuarterBands />
        <QuarterAxis />
        <GanttLanes lanes={lanes} items={items} open={open} baseId={baseId} handlersFor={handlersFor} />
        <TodayLine />
        {open && <OpenTooltip id={`${baseId}-${open.item}`} open={open} items={items} lanes={lanes} onClose={close} />}
      </div>
    </div>
  );
}

interface LanesProps extends Omit<GanttProps, 'label'> {
  open: Open | null;
  baseId: string;
  handlersFor: (item: GanttItem) => BarHandlers;
}

/** The three lanes, each holding its bars; every bar but the open one dims while a tooltip shows. */
function GanttLanes({ lanes, items, open, baseId, handlersFor }: LanesProps) {
  return GANTT_LANES.map((lane) => (
    <GanttLaneRow key={lane} lane={lane} name={lanes[lane]} laneId={`${baseId}-${lane}`}>
      {GANTT_ITEMS.filter((item) => GANTT_BARS[item].lane === lane).map((item) => (
        <GanttBar
          key={item}
          item={item}
          copy={items[item]}

          expanded={open?.item === item}
          dimmed={open !== null && open.item !== item}
          tipId={`${baseId}-${item}`}
          handlers={handlersFor(item)}
        />
      ))}
    </GanttLaneRow>
  ));
}

interface OpenTooltipProps extends Omit<GanttProps, 'label'> {
  id: string;
  open: Open;
  onClose: () => void;
}

/** The open bar's tooltip, with its lane's name and colour. */
function OpenTooltip({ id, open, items, lanes, onClose }: OpenTooltipProps) {
  const { lane } = GANTT_BARS[open.item];
  return (
    <GanttTooltip
      id={id}
      anchor={open.anchor}
      copy={items[open.item]}
      lane={lanes[lane]}
      laneClass={LANE_CLASS[lane]}
      onClose={onClose}
    />
  );
}

/** Every other quarter shaded, behind the lanes, so a bar's quarters read without gridlines. */
function QuarterBands() {
  return (
    <div aria-hidden="true" className="pointer-events-none col-start-2 row-span-4 row-start-1 grid grid-cols-4">
      {QUARTERS.map((quarter) => (
        <span key={quarter} className={cn('border-l border-border', quarter % 2 === 0 && 'bg-muted/60')} />
      ))}
    </div>
  );
}

/** The quarter numbers along the top; the bars' own date ranges carry the words. */
function QuarterAxis() {
  return (
    <div aria-hidden="true" className="col-start-2 row-start-1 grid grid-cols-4 border-b border-border pb-2">
      {QUARTERS.map((quarter) => (
        <span key={quarter} className="pl-2 text-subheading font-normal text-muted-foreground tabular-nums">
          {quarter}
        </span>
      ))}
    </div>
  );
}

/** The "today" line, drawn over the bars through every lane, with a notch on the axis. */
function TodayLine() {
  return (
    <div aria-hidden="true" className="pointer-events-none relative col-start-2 row-span-4 row-start-1">
      <span style={{ left: TODAY_LEFT }} className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-brand-accent" />
      <span
        style={{ left: TODAY_LEFT }}
        className="absolute top-0 size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] bg-brand-accent"
      />
    </div>
  );
}

interface LaneProps {
  lane: GanttLane;
  name: string;
  laneId: string;
  children: ReactNode;
}

/** One lane: its name in the left column, kept in view while the chart scrolls sideways, and its track of bars. */
function GanttLaneRow({ lane, name, laneId, children }: LaneProps) {
  return (
    <>
      <div
        id={laneId}
        className={cn(
          'sticky left-0 z-10 col-start-1 flex items-center gap-2 border-b border-border bg-background pr-3 text-body font-medium',
          LANE_ROW[lane],
          LANE_CLASS[lane],
        )}
      >
        <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-(--lane)" />
        {name}
      </div>
      <ul
        role="list"
        aria-labelledby={laneId}
        className={cn('relative col-start-2 h-20 border-b border-border', LANE_ROW[lane])}
      >
        {children}
      </ul>
    </>
  );
}
