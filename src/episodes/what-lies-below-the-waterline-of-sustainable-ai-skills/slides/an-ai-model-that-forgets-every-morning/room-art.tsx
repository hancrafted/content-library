import type { ReactNode } from 'react';

type Tone = 'room' | 'room-lit' | 'room-shade' | 'floor' | 'floor-lit';
type Facets = readonly (readonly [Tone, string])[];

const MORNING_WALL: Facets = [
  ['room', 'M139 0L226 0L141 98ZM360 62L360 153L303 118Z'],
  ['room-lit', 'M59 51L88 0L139 0Z'],
  ['room', 'M59 51L139 0L141 98Z'],
  ['room-lit', 'M88 0L59 51L0 0Z'],
  ['room', 'M165 214L88 157L141 98ZM88 157L59 51L141 98Z'],
  ['room-lit', 'M226 0L235 96L141 98Z'],
  ['room-shade', 'M165 214L238 179L199 276Z'],
  ['room-lit', 'M238 179L235 96L303 118ZM238 179L165 214L141 98ZM235 96L238 179L141 98Z'],
  ['room', 'M360 62L291 0L360 0ZM291 0L235 96L226 0ZM291 0L360 62L303 118Z'],
  ['room-lit', 'M235 96L291 0L303 118Z'],
  ['room', 'M59 51L0 85L0 0ZM0 85L88 157L0 139ZM88 157L0 85L59 51Z'],
  ['room-shade', 'M154 276L165 214L199 276Z'],
  ['room-lit', 'M154 276L61 276L165 214ZM88 157L0 201L0 139ZM61 276L47 222L165 214Z'],
  ['room-shade', 'M47 222L88 157L165 214ZM47 222L0 201L88 157Z'],
  ['room', 'M47 222L61 276L0 276Z'],
  ['room-shade', 'M0 201L47 222L0 276ZM303 226L293 276L199 276Z'],
  ['room', 'M238 179L303 226L199 276Z'],
  ['room-shade', 'M293 276L303 226L360 276ZM303 226L360 220L360 276ZM360 220L303 226L360 153Z'],
  ['room', 'M360 153L303 226L303 118Z'],
  ['room-lit', 'M303 226L238 179L303 118Z'],
  ['room-shade', 'M0 270L360 270L360 276L0 276Z'],
];

const MORNING_FLOOR: Facets = [
  ['floor-lit', 'M360 300L315 276L360 276Z'],
  ['floor', 'M231 300L178 300L180 276ZM178 300L141 276L180 276Z'],
  ['floor-lit', 'M235 276L231 300L180 276ZM315 276L306 300L265 276ZM306 300L315 276L360 300Z'],
  [
    'floor',
    'M40 300L42 276L91 276ZM98 300L40 300L91 276ZM42 276L40 300L0 276ZM40 300L0 300L0 276ZM141 276L129 300L91 276ZM129 300L98 300L91 276Z',
  ],
  ['floor-lit', 'M129 300L141 276L178 300ZM306 300L260 300L265 276ZM260 300L235 276L265 276ZM235 276L260 300L231 300Z'],
];

const PHOTO_WALL: Facets = [
  ['room-shade', 'M293 79L360 82L360 149Z'],
  ['room', 'M360 82L293 79L360 0ZM301 237L262 157L360 149Z'],
  ['room-shade', 'M262 157L293 79L360 149ZM301 237L360 240L360 300ZM360 240L301 237L360 149ZM286 300L301 237L360 300Z'],
  ['room', 'M0 231L0 140L51 181Z'],
  ['room-lit', 'M0 140L85 108L51 181Z'],
  ['room', 'M85 108L126 190L51 181ZM126 190L85 108L189 148Z'],
  ['room-shade', 'M212 218L126 190L189 148ZM262 157L212 218L189 148Z'],
  ['room', 'M212 218L262 157L301 237ZM212 218L286 300L198 300ZM286 300L212 218L301 237Z'],
  ['room-lit', 'M85 108L188 67L189 148ZM188 67L85 108L147 0Z'],
  ['room', 'M188 67L262 157L189 148ZM262 157L188 67L293 79Z'],
  ['room-lit', 'M293 79L281 0L360 0ZM0 74L85 108L0 140Z'],
  ['room', 'M153 300L212 218L198 300ZM212 218L153 300L126 190Z'],
  ['room-shade', 'M0 231L61 256L0 300Z'],
  ['room-lit', 'M61 256L86 300L0 300Z'],
  ['room-shade', 'M61 256L0 231L51 181ZM126 190L61 256L51 181Z'],
  ['room-lit', 'M61 256L153 300L86 300Z'],
  ['room', 'M153 300L61 256L126 190Z'],
  ['room-lit', 'M188 67L228 0L293 79ZM228 0L281 0L293 79ZM228 0L188 67L147 0ZM44 48L0 74L0 0Z'],
  ['room', 'M60 0L44 48L0 0ZM0 74L44 48L85 108Z'],
  ['room-lit', 'M44 48L60 0L147 0Z'],
  ['room', 'M85 108L44 48L147 0Z'],
];

const SPEC_ROOM = { width: 360, floor: 276, bottom: 300 } as const;

function FacetPaths({ facets }: { readonly facets: Facets }) {
  return facets.map(([tone, d]) => <path key={d} d={d} data-tone={tone} vectorEffect="non-scaling-stroke" />);
}

export interface MorningRoomProps {
  readonly width: number;
  readonly floorY: number;
  readonly bottom: number;
  readonly clipId: string;
  readonly clip: ReactNode;
}

export function MorningRoom({ width, floorY, bottom, clipId, clip }: MorningRoomProps) {
  const sx = width / SPEC_ROOM.width;
  const wall = `scale(${sx} ${floorY / SPEC_ROOM.floor})`;
  const floor = `translate(0 ${floorY}) scale(${sx} ${(bottom - floorY) / (SPEC_ROOM.bottom - SPEC_ROOM.floor)}) translate(0 ${-SPEC_ROOM.floor})`;
  return (
    <g data-room-art>
      <defs>
        <clipPath id={clipId}>{clip}</clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <g transform={wall}>
          <FacetPaths facets={MORNING_WALL} />
        </g>
      </g>
      <g transform={floor}>
        <FacetPaths facets={MORNING_FLOOR} />
      </g>
    </g>
  );
}

export const PHOTO_WALL_BOX = { width: 360, height: 212 } as const;
const FRAME = { x0: 46, y0: 26, x1: 286, y1: 194, t: 12 } as const;
export const PICTURE = {
  left: (FRAME.x0 + FRAME.t) / PHOTO_WALL_BOX.width,
  top: (FRAME.y0 + FRAME.t) / PHOTO_WALL_BOX.height,
  width: (FRAME.x1 - FRAME.x0 - 2 * FRAME.t) / PHOTO_WALL_BOX.width,
  height: (FRAME.y1 - FRAME.y0 - 2 * FRAME.t) / PHOTO_WALL_BOX.height,
} as const;

function Frame() {
  const { x0, y0, x1, y1, t } = FRAME;
  return (
    <g data-picture-frame>
      <path
        d={`M${x0} ${y0}L${x1} ${y0}L${x1 - t} ${y0 + t}L${x0 + t} ${y0 + t}ZM${x0} ${y0}L${x0 + t} ${y0 + t}L${x0 + t} ${y1 - t}L${x0} ${y1}Z`}
        data-tone="frame-lit"
      />
      <path
        d={`M${x1} ${y0}L${x1} ${y1}L${x1 - t} ${y1 - t}L${x1 - t} ${y0 + t}ZM${x0} ${y1}L${x0 + t} ${y1 - t}L${x1 - t} ${y1 - t}L${x1} ${y1}Z`}
        data-tone="frame-shade"
      />
      <path d="M106 26L166 8L226 26L166 10Z" data-tone="frame-shade" />
      <path d="M163 5L169 5L169 11L163 11Z" data-tone="nail" />
    </g>
  );
}

export function PhotoWall() {
  return (
    <svg
      viewBox={`0 0 ${PHOTO_WALL_BOX.width} ${PHOTO_WALL_BOX.height}`}
      aria-hidden
      data-photo-wall
      className="absolute inset-0 block h-full w-full"
    >
      <FacetPaths facets={PHOTO_WALL} />
      <Frame />
      <Clock cx={322} cy={52} r={18} />
    </svg>
  );
}

export function PaneGlint() {
  return (
    <svg viewBox="0 0 216 144" aria-hidden className="pointer-events-none absolute inset-0 block h-full w-full">
      <path d="M0 0L50 0L0 50Z" data-tone="pane-glint" />
    </svg>
  );
}

const CLOCK_SIDES = 8;
const LIT_SIDES: ReadonlySet<number> = new Set([5, 6, 7, 0]);
const HOURS = 12;

const ring = (cx: number, cy: number, r: number) =>
  Array.from({ length: CLOCK_SIDES }, (_, index) => {
    const angle = -Math.PI / 2 + (index / CLOCK_SIDES) * 2 * Math.PI;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const;
  });

const pts = (points: readonly (readonly [number, number])[]) =>
  points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

function ClockRing({ cx, cy, r, part }: { cx: number; cy: number; r: number; part: 'rim' | 'face' }) {
  const outer = ring(cx, cy, r);
  const inner = ring(cx, cy, r * 0.8);
  return inner.map((corner, index) => {
    const next = (index + 1) % CLOCK_SIDES;
    const lit = LIT_SIDES.has(index);
    const points =
      part === 'rim'
        ? [outer[index]!, outer[next]!, inner[next]!, corner]
        : ([[cx, cy], corner, inner[next]!] as const);
    const tone = `clock-${part}${lit ? '-lit' : ''}`;
    return <polygon key={`${part}-${index}`} points={pts(points)} data-tone={tone} />;
  });
}

export function Clock({ cx, cy, r, hour = 7 }: { cx: number; cy: number; r: number; hour?: number }) {
  const angle = -Math.PI / 2 + (hour / HOURS) * 2 * Math.PI;
  const tip = [cx + Math.cos(angle) * r * 0.45, cy + Math.sin(angle) * r * 0.45] as const;
  const side = [-Math.sin(angle) * r * 0.07, Math.cos(angle) * r * 0.07] as const;
  return (
    <g data-clock>
      <ClockRing cx={cx} cy={cy} r={r} part="rim" />
      <ClockRing cx={cx} cy={cy} r={r} part="face" />
      <polygon points={pts([[cx + side[0], cy + side[1]], tip, [cx - side[0], cy - side[1]]])} data-tone="clock-hand" />
      <polygon
        points={pts([
          [cx - r * 0.06, cy],
          [cx, cy - r * 0.68],
          [cx + r * 0.06, cy],
        ])}
        data-tone="clock-hand"
      />
    </g>
  );
}
