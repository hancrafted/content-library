/*
 * The cabin's walls in the close-up, lifted from the approved Spec's Option 2a (feedback 3, decision 46): its faceted
 * control-room wall in three tones, lit from the upper left, and the ceiling's cut edge, in the Spec's own units
 * (x 366 to 916, wall from y 112 down to the floor at 302). `CabinWalls` maps them into the close-up; every tone is a
 * token in `close-up.module.css`. A drawing, not a figure: the crew, console and robot stay the shared parts.
 */
import { CLOSE_UP, FLOOR_Y } from './close-up.pure';

type WallTone = 'room' | 'room-lit' | 'room-shade' | 'house-shade';

/** The Spec room's frame: its left and right walls, ceiling and floor line. */
const SPEC_ROOM = { left: 366, right: 916, top: 112, floor: 302 } as const;

/** The wall's facets as the Spec drew them, back to front, then the ceiling's cut edge. */
const WALL_FACETS: readonly (readonly [WallTone, string])[] = [
  ['room-shade', 'M604 316.3L557.1 316.6L618.4 235.8Z'],
  ['room', 'M557.1 316.6L524.8 260.7L618.4 235.8Z'],
  ['room-shade', 'M557.1 316.6L500.5 317L524.8 260.7Z'],
  ['room', 'M701.4 167.4L796.5 113.1L776 219.5ZM524.8 260.7L540.9 163.1L618.4 235.8Z'],
  ['room-shade', 'M680.4 315.7L604 316.3L618.4 235.8Z'],
  ['room-lit', 'M615.5 165.5L701.4 167.4L618.4 235.8Z'],
  ['room', 'M540.9 163.1L615.5 165.5L618.4 235.8ZM701.4 167.4L718.8 113.8L796.5 113.1Z'],
  ['room-lit', 'M916 255.7L840.3 259.3L916 192.7Z'],
  ['room-shade', 'M798.3 314.9L732.4 315.3L776 219.5Z'],
  ['room', 'M840.3 259.3L798.3 314.9L776 219.5Z'],
  ['room-shade', 'M701.4 167.4L713 257.5L618.4 235.8ZM713 257.5L680.4 315.7L618.4 235.8Z'],
  ['room', 'M713 257.5L701.4 167.4L776 219.5ZM680.4 315.7L713 257.5L732.4 315.3Z'],
  ['room-lit', 'M732.4 315.3L713 257.5L776 219.5ZM366 245.3L422.8 317.6L366 318Z'],
  ['room', 'M856.4 174.1L843.2 112.7L916 112Z'],
  ['room-shade', 'M916 192.7L856.4 174.1L916 112ZM840.3 259.3L856.4 174.1L916 192.7Z'],
  ['room', 'M856.4 174.1L840.3 259.3L776 219.5Z'],
  [
    'room-lit',
    'M843.2 112.7L856.4 174.1L796.5 113.1ZM796.5 113.1L856.4 174.1L776 219.5ZM667 114.3L718.8 113.8L701.4 167.4Z',
  ],
  ['room', 'M667 114.3L615.5 165.5L621.8 114.7Z'],
  [
    'room-lit',
    'M615.5 165.5L667 114.3L701.4 167.4ZM502.2 115.8L557.2 115.3L540.9 163.1ZM615.5 165.5L557.2 115.3L621.8 114.7Z',
  ],
  ['room', 'M557.2 115.3L615.5 165.5L540.9 163.1Z'],
  ['room-lit', 'M442.2 116.3L366 190.7L366 117Z'],
  [
    'room-shade',
    'M853.7 314.5L798.3 314.9L840.3 259.3ZM853.7 314.5L916 255.7L916 314ZM916 255.7L853.7 314.5L840.3 259.3Z',
  ],
  ['room-lit', 'M446.9 209.2L442.2 116.3L502.2 115.8ZM446.9 209.2L502.2 115.8L540.9 163.1Z'],
  ['room', 'M446.9 209.2L540.9 163.1L524.8 260.7Z'],
  ['room-lit', 'M442.2 116.3L446.9 209.2L366 190.7Z'],
  [
    'room',
    'M446.9 209.2L366 245.3L366 190.7ZM366 245.3L446.9 209.2L422.8 317.6ZM422.8 317.6L446.9 209.2L500.5 317ZM500.5 317L446.9 209.2L524.8 260.7Z',
  ],
  [
    'house-shade',
    'M366 117L413 113.4L470.4 117.2L520.4 113.8L561.7 116.2L621.3 113.5L668.3 117.7L719.1 112.8L769.9 117.3L813.3 111.5L868.3 116.8L916 112L916 118L366 122Z',
  ],
];

/** The Spec room stretched to fill the close-up from its top edge down to the cabin floor. */
const SCALE = {
  x: CLOSE_UP.width / (SPEC_ROOM.right - SPEC_ROOM.left),
  y: (FLOOR_Y - CLOSE_UP.y) / (SPEC_ROOM.floor - SPEC_ROOM.top),
} as const;
const MATRIX = [
  SCALE.x,
  0,
  0,
  SCALE.y,
  CLOSE_UP.x - SPEC_ROOM.left * SCALE.x,
  CLOSE_UP.y - SPEC_ROOM.top * SCALE.y,
].join(' ');

/** The floor under the crew: a lit edge, then the boards to the close-up's bottom. */
const FLOOR_EDGE = 6;

/** The cabin's faceted wall and its floor, filling the close-up. */
export function CabinWalls() {
  const floor = CLOSE_UP.y + CLOSE_UP.height - FLOOR_Y;
  return (
    <g data-cabin-walls>
      <g transform={`matrix(${MATRIX})`}>
        {WALL_FACETS.map(([tone, d]) => (
          <path key={d} d={d} data-tone={tone} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      <rect x={CLOSE_UP.x} y={FLOOR_Y} width={CLOSE_UP.width} height={floor} data-tone="floor" />
      <rect x={CLOSE_UP.x} y={FLOOR_Y} width={CLOSE_UP.width} height={FLOOR_EDGE} data-tone="floor-lit" />
    </g>
  );
}

/*
 * The project brief, framed on the wall, as the Spec drew it at (776, 134), 110 by 102: a bevelled frame, the paper,
 * its dark title band, five ruled lines and a red pin. `ProjectBrief` places it, unstretched, on the close-up's wall.
 */
const SPEC_BRIEF = { x: 776, y: 134, width: 110 } as const;
const BRIEF_FACETS: readonly (readonly [string, string])[] = [
  ['frame-lit', 'M886 134L776 134L782 140L880 140ZM886 134L880 140L880 230L886 236Z'],
  ['frame-shade', 'M776 134L776 236L782 230L782 140ZM886 236L880 230L782 230L776 236Z'],
  ['paper', 'M880 140L782 140L782 230L880 230Z'],
  ['paper-head', 'M880 140L782 140L782 156L880 156Z'],
  [
    'paper-rule',
    'M872 168L790 168L790 170.2L872 170.2ZM872 179L806.4 179L806.4 181.2L872 181.2ZM872 190L798.2 190L798.2 192.2L872 192.2ZM872 201L822.8 201L822.8 203.2L872 203.2ZM872 212L802.3 212L802.3 214.2L872 214.2Z',
  ],
  ['pin', 'M834 132L828 132L828 138L834 138Z'],
];

/** The framed project brief, its top-left corner at `x`, `y`, `width` wide in the Scene's units. */
export function ProjectBrief({ x, y, width }: { readonly x: number; readonly y: number; readonly width: number }) {
  const scale = width / SPEC_BRIEF.width;
  return (
    <g
      data-project-brief
      transform={`translate(${x} ${y}) scale(${scale}) translate(${-SPEC_BRIEF.x} ${-SPEC_BRIEF.y})`}
    >
      {BRIEF_FACETS.map(([tone, d]) => (
        <path key={tone} d={d} data-tone={tone} />
      ))}
    </g>
  );
}
