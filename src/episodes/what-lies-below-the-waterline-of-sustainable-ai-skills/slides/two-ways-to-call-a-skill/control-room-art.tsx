import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain, pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { SCENE_HEIGHT, SCENE_WIDTH } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import art from './room-art.json';
import styles from './slide.module.css';

/*
 * The control room split by a bulkhead, lifted facet by facet from the approved Spec's Option 7a (feedback 3, decision
 * 46): `room-art.json` holds its drawing as rows of tone and outline, in the Spec's 1200 by 540 units and paint order.
 * The Scene shows its lower 540 units and the room sits there, so every place below is in the Spec's units. The Spec's
 * own captain, pilots and consoles are left out: the shared cast and Console stand in their place. The call line starts
 * at the shared bubble's corner rather than the Spec's HTML bubble (decision 53).
 */

/** How tall the room is; the Scene's box keeps this ratio, so the room fills it. */
export const ROOM_HEIGHT = 540;
const ROOM_TOP = SCENE_HEIGHT - ROOM_HEIGHT;
const FLOOR = 462;

/** Where an overlay word sits over the room, in the Spec's units, as percentages of the visible box. */
export const at = (x: number, y: number) => ({
  left: `${(x / SCENE_WIDTH) * 100}%`,
  top: `${(y / ROOM_HEIGHT) * 100}%`,
});

/** A width in the Spec's units, as a percentage of the box. */
export const wide = (width: number) => `${(width / SCENE_WIDTH) * 100}%`;

const CONSOLE_SCALE = 1.8;
const DESK_TOP = FLOOR - 70 * CONSOLE_SCALE;
/** Each console where the Spec's stands, its desk's left end and width in the Spec's units. */
const LEFT_CONSOLE = { x: 300, width: 270 } as const;
const RIGHT_CONSOLE = { x: 716, width: 200 } as const;
/** The Spec's desk top is lower than the shared Console's at the cast's scale; the manual stands on the shared one. */
const MANUAL_LIFT = DESK_TOP - 369;
/** The pulled card above the left console, where its words go. */
export const PULLED = { x: 343, y: 210, width: 206, height: 106 } as const;
/** The index board on the right wall; its entries are the overlay's. */
export const INDEX = { x: 924, y: 50, width: 256, height: 380 } as const;
/** The task note the pilot reads on the right, the scan line starting at its corner. */
export const TASK = { x: 630, y: 140 } as const;

type Facet = readonly string[];

/** A part of the drawing, its facets in the Spec's paint order; `className` adds a motion hook. */
function Facets(props: { readonly part: string; readonly facets: readonly Facet[]; readonly className?: string }) {
  return (
    <g data-part={props.part}>
      {props.facets.map(([tone, d], index) => (
        <path key={index} data-lp={tone} d={d} className={props.className} />
      ))}
    </g>
  );
}

/** The pilot seated at a console whose desk starts at `x`. */
function PilotAtConsole({ x, width }: { readonly x: number; readonly width: number }) {
  const units = width / CONSOLE_SCALE;
  const { seat } = consoleLayout({ width: units });
  return (
    <g transform={`translate(${x} ${DESK_TOP}) scale(${CONSOLE_SCALE})`}>
      <Console width={units} />
      <g transform={`translate(${seat.x} ${seat.y})`}>
        <Character preset={pilot} pose="sit" />
      </g>
    </g>
  );
}

/** What the captain says in each view: the request in the Chat app, the slash command in the Coding agent. */
export interface Says {
  readonly chat: string;
  readonly coding: string;
}

/**
 * The captain asking, the words in the shared Character's own bubble (feedback 3, decision 53). The bubble's words
 * follow the page's view, so the captain is drawn once per view and the other view's drawing hides.
 */
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

/** Left, called by name: you, the captain, ask, and the pilot pulls that one card out of the manual. */
function ByName({ says }: { readonly says: Says }) {
  return (
    <>
      <Captain says={says} />
      <PilotAtConsole {...LEFT_CONSOLE} />
      <g transform={`translate(0 ${MANUAL_LIFT})`}>
        <Facets part="manual" facets={art.manual} />
      </g>
      <Facets part="pulled-card" facets={art.pulledCard} />
      <Facets part="call" facets={art.call} />
    </>
  );
}

/** Right, picked from its description: the pilot reads the index board, and the scan line runs to the matching line. */
function ByDescription() {
  return (
    <>
      <PilotAtConsole {...RIGHT_CONSOLE} />
      <Facets part="index-board" facets={art.indexBoard} />
      <g data-motion="scan">
        <Facets part="scan" facets={art.scan} className={styles.scan} />
      </g>
    </>
  );
}

/**
 * The control room split by a bulkhead, inside `ZoneScene`: called by name on the left, picked from its description on
 * the right, where nobody names a skill.
 */
export function ControlRoomArt({ says }: { readonly says: Says }) {
  return (
    <g transform={`translate(0 ${ROOM_TOP})`} className={styles.art}>
      <Facets part="room" facets={art.room} />
      <Facets part="bulkhead" facets={art.bulkhead} />
      <ByName says={says} />
      <ByDescription />
    </g>
  );
}
