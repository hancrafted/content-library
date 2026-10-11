'use client';

import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import { CANVAS, DRAW_MS, LANE_COLOURS, LANE_ROUTES, LANES, metroPath, type Lane } from './metro-map.pure';

/** Lanes are thick, bends round over this many canvas units. */
const BEND_RADIUS = 18;

type LaneStyle = CSSProperties & Record<'--lane-light' | '--lane-dark', string>;

/** A lane's two theme colours as custom properties, so one class picks the theme's value. */
export function laneStyle(lane: Lane): LaneStyle {
  return { '--lane-light': LANE_COLOURS[lane].light, '--lane-dark': LANE_COLOURS[lane].dark };
}

/** One lane: drawn on with `stroke-dashoffset` the first time the Slide is active, dimmed when another lane is lit. */
function LaneLine({ lane, lit, drawn }: { lane: Lane; lit: boolean; drawn: boolean }) {
  return (
    <g
      data-lane={lane}
      data-lit={lit}
      style={laneStyle(lane)}
      className={cn('transition-opacity duration-300', lit ? 'opacity-100' : 'opacity-15')}
    >
      <path
        d={metroPath(LANE_ROUTES[lane], BEND_RADIUS)}
        pathLength={1}
        style={{ transitionDuration: `${DRAW_MS}ms` }}
        className={cn(
          'fill-none stroke-(--lane-light) [stroke-dasharray:1] [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:10] transition-[stroke-dashoffset] ease-[cubic-bezier(0.65,0,0.35,1)] dark:stroke-(--lane-dark)',
          drawn ? '[stroke-dashoffset:0]' : '[stroke-dashoffset:1]',
          'motion-reduce:[stroke-dashoffset:0]! print:[stroke-dashoffset:0]!',
        )}
      />
    </g>
  );
}

/** The three lanes on the canvas; the SVG is decoration, the legend and station buttons carry the meaning. */
export function MetroLines({ lit, drawn }: { lit: readonly Lane[]; drawn: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
      className="absolute inset-0 size-full overflow-visible"
    >
      {LANES.map((lane) => (
        <LaneLine key={lane} lane={lane} lit={lit.includes(lane)} drawn={drawn} />
      ))}
    </svg>
  );
}
