'use client';

import { useSlideZone } from '@/hooks/use-slide-zone';
import { cn } from '@/lib/utils';
import { useCallback, useId, useState, type MouseEvent } from 'react';
import { laneClass, MetroLines } from './metro-map-lines.client';
import { MetroPopover } from './metro-map-popover.client';
import { MetroStation, type StationCopy, type StationHandlers } from './metro-map-station.client';
import { LANES, litLanes, stationLanes, STATIONS, type Lane, type MapFocus, type Station } from './metro-map.pure';

interface Open {
  station: Station;
  anchor: HTMLElement;
}

/** Plays once: the first time the Slide reaches the reading line, the lines draw on and the stations pop in behind them. */
function useDrawn(): boolean {
  const zone = useSlideZone();
  const [drawn, setDrawn] = useState(false);
  if (!drawn && zone === 'active') setDrawn(true);
  return drawn;
}

/**
 * What is lit: a hover or focus previews a lane or station, a legend click
 * pins a lane, an open station pins its lanes. A preview wins over a pin.
 */
function useMapFocus() {
  const [preview, setPreview] = useState<MapFocus>(null);
  const [pinnedLane, setPinnedLane] = useState<Lane | null>(null);
  const [open, setOpen] = useState<Open | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const pinned: MapFocus = open ? { station: open.station } : pinnedLane ? { lane: pinnedLane } : null;
  const lit = litLanes(preview ?? pinned);
  const togglePin = (lane: Lane) => setPinnedLane((now) => (now === lane ? null : lane));
  return { lit, open, setOpen, close, setPreview, pinnedLane, togglePin };
}

type MapState = ReturnType<typeof useMapFocus>;

function stationHandlers(station: Station, { setPreview, setOpen }: MapState): StationHandlers {
  const clear = () => setPreview((now) => (now !== null && 'station' in now && now.station === station ? null : now));
  return {
    onMouseEnter: () => setPreview({ station }),
    onMouseLeave: clear,
    onFocus: () => setPreview({ station }),
    onBlur: clear,
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      const anchor = event.currentTarget;
      setOpen((now) => (now?.station === station ? null : { station, anchor }));
    },
  };
}

export interface MetroMapProps {
  label: string;
  lanes: Record<Lane, string>;
  items: Record<Station, StationCopy>;
}

/** Three lanes that branch apart and merge at interchanges; the legend and stations light their lanes, a station opens its story. */
export function MetroMap({ label, lanes, items }: MetroMapProps) {
  const baseId = useId();
  const drawn = useDrawn();
  const state = useMapFocus();
  return (
    <div data-slot="metro-map" data-drawn={drawn} className="flex flex-col gap-6">
      <MetroLegend lanes={lanes} state={state} />
      <MetroCanvas label={label} items={items} drawn={drawn} state={state} baseId={baseId} />
      {state.open && (
        <MetroPopover
          id={`${baseId}-popover`}
          anchor={state.open.anchor}
          copy={items[state.open.station]}
          lanes={stationLanes(state.open.station)}
          laneNames={lanes}
          onClose={state.close}
        />
      )}
    </div>
  );
}

interface CanvasProps {
  label: string;
  items: Record<Station, StationCopy>;
  drawn: boolean;
  state: MapState;
  baseId: string;
}

/** The map itself: scrolls sideways on a phone rather than squeezing the stations into each other. */
function MetroCanvas({ label, items, drawn, state, baseId }: CanvasProps) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 py-14 md:mx-0 md:px-0">
      <div className="relative aspect-1000/380 min-w-[44rem]">
        <MetroLines lit={state.lit} drawn={drawn} />
        <ol role="list" aria-label={label} className="absolute inset-0">
          {STATIONS.map((station) => (
            <MetroStation
              key={station}
              station={station}
              copy={items[station]}
              lit={stationLanes(station).some((lane) => state.lit.includes(lane))}
              drawn={drawn}
              expanded={state.open?.station === station}
              popoverId={`${baseId}-popover`}
              handlers={stationHandlers(station, state)}
            />
          ))}
        </ol>
      </div>
    </div>
  );
}

/** The legend names each lane in text; hovering previews a lane, a click pins it until clicked again. */
function MetroLegend({ lanes, state }: { lanes: Record<Lane, string>; state: MapState }) {
  const { setPreview, pinnedLane, togglePin } = state;
  const clear = () => setPreview(null);
  return (
    <ul className="flex flex-wrap gap-2">
      {LANES.map((lane) => (
        <li key={lane} className={laneClass(lane)}>
          <button
            type="button"
            aria-pressed={pinnedLane === lane}
            onMouseEnter={() => setPreview({ lane })}
            onMouseLeave={clear}
            onFocus={() => setPreview({ lane })}
            onBlur={clear}
            onClick={() => togglePin(lane)}
            className={cn(
              'flex cursor-pointer items-center gap-2.5 rounded-full border border-border py-1.5 pr-4 pl-2 text-body font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
              state.lit.includes(lane) ? 'text-foreground' : 'text-muted-foreground',
              pinnedLane === lane && 'bg-muted',
            )}
          >
            <span aria-hidden="true" className="h-2.5 w-7 rounded-full bg-(--lane-light) dark:bg-(--lane-dark)" />
            {lanes[lane]}
          </button>
        </li>
      ))}
    </ul>
  );
}
