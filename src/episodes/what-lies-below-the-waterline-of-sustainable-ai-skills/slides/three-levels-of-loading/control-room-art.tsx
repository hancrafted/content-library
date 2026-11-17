import { PilotAtConsole } from '@/episodes/components/slide-shared/deep-sea-expedition/pilot-at-console';
import { SCENE_HEIGHT, SCENE_WIDTH } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import art from './room-art.json';
import styles from './slide.module.css';

export const ROOM_HEIGHT = 470;
const ROOM_TOP = SCENE_HEIGHT - ROOM_HEIGHT;

export const at = (x: number, y: number) => ({
  left: `${(x / SCENE_WIDTH) * 100}%`,
  top: `${(y / ROOM_HEIGHT) * 100}%`,
});

export const PROPPED = { x: 610, y: 196, width: 160, height: 100 } as const;
const CONSOLE = { x: 560, y: 297, width: 173, scale: 1.5 } as const;
const PILOT_REACH = 16;

type Facet = readonly string[];

const MOTION: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  'halo-index': { 'data-halo': 'index', 'data-motion': 'halo', className: styles.halo ?? '' },
  'halo-card': { 'data-halo': 'card', 'data-motion': 'halo', className: styles.halo ?? '' },
  'lamp-on': { 'data-motion': 'lamp-on', className: styles.beam ?? '' },
};

function Facets({ part, facets }: { readonly part: string; readonly facets: readonly Facet[] }) {
  return (
    <g data-part={part}>
      {facets.map(([tone, d, role], index) => (
        <path key={index} data-lp={tone} d={d} {...(role === undefined ? {} : MOTION[role])} />
      ))}
    </g>
  );
}

export function ControlRoomArt() {
  return (
    <g transform={`translate(0 ${ROOM_TOP})`} className={styles.art}>
      <Facets part="room" facets={art.room} />
      <Facets part="manual-shelf" facets={art.shelf} />
      <g transform={`translate(${CONSOLE.x} ${CONSOLE.y}) scale(${CONSOLE.scale})`}>
        <PilotAtConsole width={CONSOLE.width} reach={PILOT_REACH} />
      </g>
      <Facets part="pulled-card" facets={art.card} />
      <Facets part="side-table" facets={art.table} />
    </g>
  );
}
