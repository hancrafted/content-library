import { SCENE_HEIGHT, SCENE_WIDTH } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { seaFacets } from '@/episodes/components/slide-shared/iceberg/zone-scene.pure';
import { useId } from 'react';
import styles from './slide.module.css';

/** A cut-out in the wall, in the Scene's 1200 by 800 units, through which `ZoneScene`'s own sea and sky show. */
export interface Opening {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** A window frame around it; an opening without one runs to the Scene's edge. */
  readonly framed?: boolean;
}

const WALL = seaFacets({ width: SCENE_WIDTH, height: SCENE_HEIGHT, cell: 190, seed: 31 });
const FLOOR_FACETS = 6;
const FRAME = 10;

/** The wall's outline with its openings cut out, as one even-odd path. */
const wallPath = (openings: readonly Opening[]) =>
  [
    `M0 0H${SCENE_WIDTH}V${SCENE_HEIGHT}H0Z`,
    ...openings.map(({ x, y, width, height }) => `M${x} ${y}h${width}v${height}h${-width}Z`),
  ].join(' ');

/** The faceted wall, clipped so the openings stay clear; its clip path's id comes from `useId`, so a copied Slide repeats none. */
function Wall({ openings }: { readonly openings: readonly Opening[] }) {
  const clip = useId();
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <path d={wallPath(openings)} clipRule="evenodd" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`} className={styles.wall}>
        {WALL.map(({ points, tone }) => (
          <polygon key={points} data-tone={tone} points={points} />
        ))}
      </g>
    </>
  );
}

/** A frame around each opening that asks for one. */
function Frames({ openings }: { readonly openings: readonly Opening[] }) {
  return openings
    .filter(({ framed }) => framed)
    .map(({ x, y, width, height }) => (
      <rect
        key={`${x}-${y}`}
        x={x - FRAME / 2}
        y={y - FRAME / 2}
        width={width + FRAME}
        height={height + FRAME}
        strokeWidth={FRAME}
        className="fill-none stroke-(--frame)"
      />
    ));
}

/** The floor from `floor` down, in slanted facets. */
function Floor({ floor }: { readonly floor: number }) {
  const step = SCENE_WIDTH / FLOOR_FACETS;
  return (
    <g data-floor>
      {Array.from({ length: FLOOR_FACETS }, (_, index) => (
        <polygon
          key={index}
          points={`${index * step},${floor} ${(index + 1) * step},${floor} ${(index + 1) * step - 40},${SCENE_HEIGHT} ${index * step - 40},${SCENE_HEIGHT}`}
          className={index % 2 === 0 ? 'fill-(--floor)' : 'fill-(--floor-lit)'}
        />
      ))}
    </g>
  );
}

/**
 * The control room's back wall and floor, faceted and lit from the upper left, the Slide's own scenery inside
 * `ZoneScene`: the wall covers the Scene but for its openings, where the zone's water or sky shows through.
 */
export function ControlRoom({
  openings = [],
  floor,
}: {
  readonly openings?: readonly Opening[];
  /** Where the floor starts, in the Scene's units. */
  readonly floor: number;
}) {
  return (
    <g data-control-room>
      <Wall openings={openings} />
      <Frames openings={openings} />
      <Floor floor={floor} />
    </g>
  );
}
