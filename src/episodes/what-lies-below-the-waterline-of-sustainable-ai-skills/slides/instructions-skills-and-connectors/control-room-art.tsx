import { Character } from '@/episodes/components/slide-shared/character/character';
import { captain } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { PilotAtConsole } from '@/episodes/components/slide-shared/deep-sea-expedition/pilot-at-console';
import { ToneFacets, type ToneFacet } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { SCENE_HEIGHT, SCENE_WIDTH } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import art from './room-art.json';
import styles from './slide.module.css';

/*
 * The control room and its four cartoon panels, lifted facet by facet from the approved Spec's Option 6a (feedback 3,
 * decision 46): `room-art.json` holds the drawing as rows of tone and outline, in the Spec's units and paint order.
 * The room is 1200 by 520 and the Scene shows its lower 520 units, so every place below is in the Spec's units; each
 * panel is a 400 by 116 window onto the Spec's panel sheet. The Spec's own captain, pilot and console are left out:
 * the shared cast and Console stand in their place.
 */

/** How tall the room is; the Scene's box keeps this ratio, so the room fills it. */
export const ROOM_HEIGHT = 520;
const ROOM_TOP = SCENE_HEIGHT - ROOM_HEIGHT;
const FLOOR = 440;

/** Where an overlay word sits over the room, in the Spec's units, as percentages of the visible box. */
export const at = (x: number, y: number) => ({
  left: `${(x / SCENE_WIDTH) * 100}%`,
  top: `${(y / ROOM_HEIGHT) * 100}%`,
});

/** The four things the room shows, in the order the Slide reads them. */
export const THINGS = ['personal', 'project', 'skills', 'connectors'] as const;
export type Thing = (typeof THINGS)[number];

/** Where each thing's numbered pill sits over the room, its top centre, at the Spec's places. */
export const PILLS: Readonly<Record<Thing, { readonly x: number; readonly y: number }>> = {
  personal: { x: 230, y: 323 },
  project: { x: 372, y: 268 },
  skills: { x: 676, y: 176 },
  connectors: { x: 948, y: 315 },
};

interface Place {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}

const place = ({ x, y, scale }: Place) => `translate(${x} ${y}) scale(${scale})`;

/** The captain's place, the hand meeting the Spec's notebook; the console's, where the Spec's stands, at the cast's scale. */
const CAPTAIN: Place = { x: 167, y: FLOOR, scale: 2.5 };
const CONSOLE = { x: 560, y: 300, width: 135, scale: 2 } as const;
/** The Spec's pilot sits with his hands on the desk: his chair rolls this far in from the shared console's seat. */
const PILOT_REACH = 24;
/** The Spec's desk top is lower than the shared Console's at the cast's scale; the manual stands on the shared one. */
const MANUAL_LIFT = CONSOLE.y - 362;

/** The pilot seated at a console, at its place. */
function PilotAt({ width, ...at }: Place & { readonly width: number }) {
  return (
    <g transform={place(at)}>
      <PilotAtConsole width={width} reach={PILOT_REACH} />
    </g>
  );
}

/**
 * The control room in side view, inside `ZoneScene`: the faceted wall, the window's two panes on a Surface sky with a
 * cloud; you, the captain, with your notebook; the project brief pinned on the wall; the pilot at the console with the
 * manual; the bulkhead; and in the next room the lab database's rack with its lights, above the hull where the sea runs
 * with light rays, and the cable's pipes from the console up to the rack and down to the sonar drone pinging below.
 */
export function ControlRoomArt() {
  return (
    <g transform={`translate(0 ${ROOM_TOP})`} className={styles.art}>
      <ToneFacets toneAttribute="data-lp" part="room" facets={art.room} />
      <ToneFacets toneAttribute="data-lp" part="next-room" facets={art.nextRoom} />
      <ToneFacets toneAttribute="data-lp" part="bulkhead" facets={art.bulkhead} />
      <ToneFacets toneAttribute="data-lp" part="lab-rack" facets={art.rack} />
      <ToneFacets toneAttribute="data-lp" part="sonar" facets={art.sonar} />
      <ToneFacets toneAttribute="data-lp" part="cable" facets={art.cable} />
      <ToneFacets toneAttribute="data-lp" part="wall-brief" facets={art.brief} />
      <g transform={place(CAPTAIN)}>
        <Character preset={captain} pose="hold" />
      </g>
      <ToneFacets toneAttribute="data-lp" part="notebook" facets={art.notebook} />
      <PilotAt x={CONSOLE.x} y={CONSOLE.y} scale={CONSOLE.scale} width={CONSOLE.width} />
      <g transform={`translate(0 ${MANUAL_LIFT})`}>
        <ToneFacets toneAttribute="data-lp" part="manual" facets={art.manual} />
      </g>
    </g>
  );
}

/** Each panel's window onto the Spec's panel sheet: its top edge there. */
const TILE_TOP: Readonly<Record<Thing, number>> = { personal: 20, project: 152, skills: 284, connectors: 416 };
/** A panel's drawing behind its shared figures, and what it holds in front of them. */
const TILE_ART: Readonly<Record<Thing, { readonly back: readonly ToneFacet[]; readonly front: readonly ToneFacet[] }>> =
  {
    personal: { back: art.tilePersonal, front: art.tilePersonalFront },
    project: { back: art.tileProject, front: [] },
    skills: { back: art.tileSkills, front: art.tileSkillsFront },
    connectors: { back: art.tileConnectors, front: [] },
  };

/** The shared figures a panel shows in front of its drawing, in the panel's own units. */
function TileCast({ thing }: { readonly thing: Thing }) {
  switch (thing) {
    case 'personal':
      return (
        <g transform={place({ x: 293, y: 162, scale: 1.5 })}>
          <Character preset={captain} pose="hold" />
        </g>
      );
    case 'skills':
      return <PilotAt x={280} y={77} scale={1.2} width={100} />;
    default:
      return null;
  }
}

/** One cartoon panel: the thing alone, cut out of the room, 400 by 116 units. */
export function ThingTile({ thing, label }: { readonly thing: Thing; readonly label: string }) {
  const sheet = `translate(-20 ${-TILE_TOP[thing]})`;
  return (
    <svg viewBox="0 0 400 116" role="img" aria-label={label} className={`${styles.art} block h-auto w-full rounded-lg`}>
      <g transform={sheet}>
        <ToneFacets toneAttribute="data-lp" part={`tile-${thing}`} facets={TILE_ART[thing].back} />
      </g>
      <TileCast thing={thing} />
      <g transform={sheet}>
        <ToneFacets toneAttribute="data-lp" part={`tile-${thing}-front`} facets={TILE_ART[thing].front} />
      </g>
    </svg>
  );
}
