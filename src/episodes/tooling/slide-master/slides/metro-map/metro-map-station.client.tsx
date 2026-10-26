'use client';

import { cn } from '@/lib/utils';
import type { CSSProperties, FocusEvent, MouseEvent } from 'react';
import { laneClass } from './metro-map-lines.client';
import { canvasShare, isInterchange, LABEL_SIDE, STATION_AT, stationLanes, type Station } from './metro-map.pure';

export interface StationCopy {
  date: string;
  title: string;
  caption: string;
}

export interface StationHandlers {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: (event: FocusEvent<HTMLButtonElement>) => void;
  onBlur: () => void;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

interface StationProps {
  station: Station;
  copy: StationCopy;
  /** Whether a lane this station serves is lit. */
  lit: boolean;
  expanded: boolean;
  popoverId: string;
  handlers: StationHandlers;
}

/** A station: a ring on the map that opens its popover, with its date and title beside it. */
export function MetroStation({ station, copy, lit, expanded, popoverId, handlers }: StationProps) {
  return (
    <li
      data-station={station}
      style={canvasShare(STATION_AT[station])}
      className={cn('absolute transition-opacity duration-300', lit ? 'opacity-100' : 'opacity-30')}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={expanded ? popoverId : undefined}
        aria-label={`${copy.date}, ${copy.title}`}
        {...handlers}
        className="group absolute grid size-12 -translate-1/2 cursor-pointer place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <StationRing station={station} expanded={expanded} />
      </button>
      <StationLabel station={station} copy={copy} expanded={expanded} />
    </li>
  );
}

/** A single stop is a ring in its lane's colour; an interchange is a larger white capsule with a dark outline spanning its lanes. */
function StationRing({ station, expanded }: { station: Station; expanded: boolean }) {
  const interchange = isInterchange(station);
  return (
    <span
      aria-hidden="true"
      data-interchange={interchange}
      style={ringStyle(station)}
      className={cn(
        !interchange && laneClass(stationLanes(station)[0]),
        'block rounded-full transition-[scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115',
        interchange
          ? 'w-6 border-[3px] border-foreground bg-background dark:border-background dark:bg-foreground'
          : 'size-6 border-[5px] border-(--lane) bg-background',
        expanded && 'scale-125 ring-4 ring-brand-accent/40',
      )}
    />
  );
}

/** A single stop takes its lane's colours; an interchange grows to span every lane it joins. */
function ringStyle(station: Station): CSSProperties | undefined {
  return isInterchange(station) ? { height: `${0.5 + stationLanes(station).length * 0.75}rem` } : undefined;
}

function StationLabel({ station, copy, expanded }: { station: Station; copy: StationCopy; expanded: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute flex w-32 -translate-x-1/2 flex-col items-center text-center leading-tight',
        LABEL_SIDE[station] === 'above' ? 'bottom-7 flex-col-reverse' : 'top-7',
      )}
    >
      <span
        className={cn(
          'font-mono text-body tracking-widest tabular-nums text-muted-foreground',
          expanded && 'text-brand-accent',
        )}
      >
        {copy.date}
      </span>
      <span className="text-body font-semibold tracking-tight">{copy.title}</span>
    </span>
  );
}
