import { CLOSE_UP, FLOOR_Y } from './close-up.pure';

type WallTone = 'room' | 'room-lit' | 'room-shade' | 'house-shade';

const SPEC_ROOM = { left: 366, right: 916, top: 112, floor: 302 } as const;

const WALL_FACETS: readonly (readonly [WallTone, string])[] = [
  ['room-shade', 'M604 316L557 317L618 236Z'],
  ['room', 'M557 317L525 261L618 236Z'],
  ['room-shade', 'M557 317L501 317L525 261Z'],
  ['room', 'M701 167L797 113L776 220ZM525 261L541 163L618 236Z'],
  ['room-shade', 'M680 316L604 316L618 236Z'],
  ['room-lit', 'M616 166L701 167L618 236Z'],
  ['room', 'M541 163L616 166L618 236ZM701 167L719 114L797 113Z'],
  ['room-lit', 'M916 256L840 259L916 193Z'],
  ['room-shade', 'M798 315L732 315L776 220Z'],
  ['room', 'M840 259L798 315L776 220Z'],
  ['room-shade', 'M701 167L713 258L618 236ZM713 258L680 316L618 236Z'],
  ['room', 'M713 258L701 167L776 220ZM680 316L713 258L732 315Z'],
  ['room-lit', 'M732 315L713 258L776 220ZM366 245L423 318L366 318Z'],
  ['room', 'M856 174L843 113L916 112Z'],
  ['room-shade', 'M916 193L856 174L916 112ZM840 259L856 174L916 193Z'],
  ['room', 'M856 174L840 259L776 220Z'],
  ['room-lit', 'M843 113L856 174L797 113ZM797 113L856 174L776 220ZM667 114L719 114L701 167Z'],
  ['room', 'M667 114L616 166L622 115Z'],
  ['room-lit', 'M616 166L667 114L701 167ZM502 116L557 115L541 163ZM616 166L557 115L622 115Z'],
  ['room', 'M557 115L616 166L541 163Z'],
  ['room-lit', 'M442 116L366 191L366 117Z'],
  ['room-shade', 'M854 315L798 315L840 259ZM854 315L916 256L916 314ZM916 256L854 315L840 259Z'],
  ['room-lit', 'M447 209L442 116L502 116ZM447 209L502 116L541 163Z'],
  ['room', 'M447 209L541 163L525 261Z'],
  ['room-lit', 'M442 116L447 209L366 191Z'],
  ['room', 'M447 209L366 245L366 191ZM366 245L447 209L423 318ZM423 318L447 209L501 317ZM501 317L447 209L525 261Z'],
  [
    'house-shade',
    'M366 117L413 113L470 117L520 114L562 116L621 114L668 118L719 113L770 117L813 112L868 117L916 112L916 118L366 122Z',
  ],
];

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

const FLOOR_EDGE = 6;

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

const SPEC_BRIEF = { x: 776, y: 134, width: 110 } as const;
const BRIEF_FACETS: readonly (readonly [string, string])[] = [
  ['frame-lit', 'M886 134L776 134L782 140L880 140ZM886 134L880 140L880 230L886 236Z'],
  ['frame-shade', 'M776 134L776 236L782 230L782 140ZM886 236L880 230L782 230L776 236Z'],
  ['paper', 'M880 140L782 140L782 230L880 230Z'],
  ['paper-head', 'M880 140L782 140L782 156L880 156Z'],
  [
    'paper-rule',
    'M872 168L790 168L790 170L872 170ZM872 179L806 179L806 181L872 181ZM872 190L798 190L798 192L872 192ZM872 201L823 201L823 203L872 203ZM872 212L802 212L802 214L872 214Z',
  ],
  ['pin', 'M834 132L828 132L828 138L834 138Z'],
];

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
