import { Character } from '@/episodes/components/slide-shared/character/character';
import { pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { SCENE_HEIGHT, SCENE_WIDTH } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import art from './room-art.json';
import styles from './slide.module.css';

/*
 * The control room, lifted facet by facet from the approved Spec's Option 4b (feedback 3, decision 46): `room-art.json`
 * holds its drawing as rows of tone and outline, in the Spec's 1200 by 470 units and its paint order. The Scene shows
 * its lower 470 units and the room sits there, so every place below is in the Spec's units. The Spec's own pilot and
 * console are left out: the shared Console and cast stand in their place.
 */

/** How tall the room is; the Scene's box keeps this ratio, so the room fills it. */
export const ROOM_HEIGHT = 470;
const ROOM_TOP = SCENE_HEIGHT - ROOM_HEIGHT;

/** Where an overlay word sits over the room, in the Spec's units, as percentages of the visible box. */
export const at = (x: number, y: number) => ({
  left: `${(x / SCENE_WIDTH) * 100}%`,
  top: `${(y / ROOM_HEIGHT) * 100}%`,
});

/** The propped card on the console, its words the overlay's. */
export const PROPPED = { x: 610, y: 196, width: 160, height: 100 } as const;
/** The console where the Spec's stands, desk top to floor. */
const CONSOLE = { x: 560, y: 297, width: 173, scale: 1.5 } as const;
/** The Spec's pilot sits with his hands on the desk: his chair rolls this far in from the shared console's seat. */
const PILOT_REACH = 16;

/** One row of the drawing: its tone, its outline, and the motion hook it carries, if any. */
type Facet = readonly string[];

/** The light's way across the room: the halo on the shelf, the halo on the card, then the lamp's beam. */
const MOTION: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  'halo-index': { 'data-halo': 'index', 'data-motion': 'halo', className: styles.halo ?? '' },
  'halo-card': { 'data-halo': 'card', 'data-motion': 'halo', className: styles.halo ?? '' },
  'lamp-on': { 'data-motion': 'lamp-on', className: styles.beam ?? '' },
};

/** A part of the drawing, its facets in the Spec's paint order. */
function Facets({ part, facets }: { readonly part: string; readonly facets: readonly Facet[] }) {
  return (
    <g data-part={part}>
      {facets.map(([tone, d, role], index) => (
        <path key={index} data-lp={tone} d={d} {...(role === undefined ? {} : MOTION[role])} />
      ))}
    </g>
  );
}

/** The pilot seated at the console. */
function PilotAtConsole() {
  const { seat } = consoleLayout({ width: CONSOLE.width });
  return (
    <g transform={`translate(${CONSOLE.x} ${CONSOLE.y}) scale(${CONSOLE.scale})`}>
      <Console width={CONSOLE.width} />
      <g transform={`translate(${seat.x + PILOT_REACH} ${seat.y})`}>
        <Character preset={pilot} pose="sit" />
      </g>
    </g>
  );
}

/**
 * The control room from the side, read left to right as the three loading levels: the manual's index on the wall,
 * its cards standing at uneven heights; the pilot at the console with one card propped up; the sleeve on the side table
 * under the lamp, the species guide, label template and arm preset slid out. The window's two panes show the Surface
 * sky with a cloud. Halos mark the light's way across the room.
 */
export function ControlRoomArt() {
  return (
    <g transform={`translate(0 ${ROOM_TOP})`} className={styles.art}>
      <Facets part="room" facets={art.room} />
      <Facets part="manual-shelf" facets={art.shelf} />
      <PilotAtConsole />
      <Facets part="pulled-card" facets={art.card} />
      <Facets part="side-table" facets={art.table} />
    </g>
  );
}
