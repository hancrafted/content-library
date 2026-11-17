import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { PilotAtConsole } from '@/episodes/components/slide-shared/deep-sea-expedition/pilot-at-console';
import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { SCENE_HEIGHT, SCENE_WIDTH } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import art from './room-art.json';
import styles from './slide.module.css';

export const ROOM_HEIGHT = 540;
const ROOM_TOP = SCENE_HEIGHT - ROOM_HEIGHT;
const FLOOR = 462;

export const at = (x: number, y: number) => ({
  left: `${(x / SCENE_WIDTH) * 100}%`,
  top: `${(y / ROOM_HEIGHT) * 100}%`,
});

export const wide = (width: number) => `${(width / SCENE_WIDTH) * 100}%`;

const CONSOLE_SCALE = 1.8;
const DESK_TOP = FLOOR - 70 * CONSOLE_SCALE;
const LEFT_CONSOLE = { x: 300, width: 270 } as const;
const RIGHT_CONSOLE = { x: 716, width: 200 } as const;
const MANUAL_LIFT = DESK_TOP - 369;
const PILOT_REACH = 24;
export const PULLED = { x: 343, y: 210, width: 206, height: 106 } as const;
export const INDEX = { x: 924, y: 50, width: 256, height: 380 } as const;
export const TASK = { x: 630, y: 140 } as const;

function PilotAt({ x, width }: { readonly x: number; readonly width: number }) {
  return (
    <g transform={`translate(${x} ${DESK_TOP}) scale(${CONSOLE_SCALE})`}>
      <PilotAtConsole width={width / CONSOLE_SCALE} reach={PILOT_REACH} />
    </g>
  );
}

export interface Says {
  readonly chat: string;
  readonly coding: string;
}

function Captain({ says }: { readonly says: Says }) {
  return (
    <>
      {(['chat', 'coding'] as const).map((view) => (
        <g key={view} data-view={view} className={styles.inView} transform={`translate(120 ${FLOOR}) scale(2.2)`}>
          <Character preset={captain} pose="point" says={says[view]} />
        </g>
      ))}
    </>
  );
}

function ByName({ says }: { readonly says: Says }) {
  return (
    <>
      <Captain says={says} />
      <PilotAt {...LEFT_CONSOLE} />
      <g transform={`translate(0 ${MANUAL_LIFT})`}>
        <ToneFacets toneAttribute="data-lp" part="manual" facets={art.manual} />
      </g>
      <ToneFacets toneAttribute="data-lp" part="pulled-card" facets={art.pulledCard} />
      <ToneFacets toneAttribute="data-lp" part="call" facets={art.call} />
    </>
  );
}

function ByDescription() {
  return (
    <>
      <PilotAt {...RIGHT_CONSOLE} />
      <ToneFacets toneAttribute="data-lp" part="index-board" facets={art.indexBoard} />
      <g data-motion="scan">
        <ToneFacets toneAttribute="data-lp" part="scan" facets={art.scan} className={styles.scan} />
      </g>
    </>
  );
}

export function ControlRoomArt({ says }: { readonly says: Says }) {
  return (
    <g transform={`translate(0 ${ROOM_TOP})`} className={styles.art}>
      <ToneFacets toneAttribute="data-lp" part="room" facets={art.room} />
      <ToneFacets toneAttribute="data-lp" part="bulkhead" facets={art.bulkhead} />
      <ByName says={says} />
      <ByDescription />
    </g>
  );
}
