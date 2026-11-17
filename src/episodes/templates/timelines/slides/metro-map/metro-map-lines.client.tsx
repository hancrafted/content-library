'use client';

import { cn } from '@/shared/lib/utils';
import styles from './metro-map.module.css';
import { CANVAS, LANE_ROUTES, LANES, metroPath, type Lane } from './metro-map.pure';

const BEND_RADIUS = 18;

const LANE_CLASS: Record<Lane, string> = { a: styles.laneA, b: styles.laneB, c: styles.laneC };

export function laneClass(lane: Lane): string {
  return LANE_CLASS[lane];
}

function LaneLine({ lane, lit }: { lane: Lane; lit: boolean }) {
  return (
    <g
      data-lane={lane}
      data-lit={lit}
      className={cn(laneClass(lane), 'transition-opacity duration-300', lit ? 'opacity-100' : 'opacity-15')}
    >
      <path
        d={metroPath(LANE_ROUTES[lane], BEND_RADIUS)}
        className="fill-none stroke-(--lane) [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:10]"
      />
    </g>
  );
}

export function MetroLines({ lit }: { lit: readonly Lane[] }) {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
      className="absolute inset-0 size-full overflow-visible"
    >
      {LANES.map((lane) => (
        <LaneLine key={lane} lane={lane} lit={lit.includes(lane)} />
      ))}
    </svg>
  );
}
