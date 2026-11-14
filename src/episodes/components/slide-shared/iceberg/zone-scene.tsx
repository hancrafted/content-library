import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import { zoneToken, type Zone } from './ruler.pure';
import { SceneMotionRoot } from './scene-motion.client';
import { Iceberg } from './scenery/iceberg';
import { depthScaleForKeel } from './scenery/scenery.pure';
import { Bubbles, FishSchool, Jellies, Whale } from './scenery/sea-life';
import { LightRays, Seabed } from './scenery/seabed';
import { Clouds, SunMoon } from './scenery/sky';
import styles from './zone-scene.module.css';
import {
  depthBands,
  seaFacets,
  WHOLE_DEPTH,
  zoneSceneParts,
  type SceneIceberg,
  type SceneLife,
  type SeaFacet,
} from './zone-scene.pure';

/** Every Scene draws in one space, 1200 by 800, so a Slide places its figures in the same numbers at every zone. */
export const SCENE_WIDTH = 1200;
export const SCENE_HEIGHT = 800;
/** Where the Surface's waterline runs; below the Surface the whole Scene is water. */
export const SURFACE_WATERLINE = 400;

const KEEL_REACH = 520;
const SEABED_TOP = 690;

export interface ZoneSceneProps {
  /** The one choice a Slide makes: the zone it sits in. */
  readonly zone: Zone;
  /** Another part of the iceberg than the zone's own (`whole` on the Surface, `keel` in Sunlit, none deeper). */
  readonly iceberg?: SceneIceberg;
  /** Words for the picture; without them it is decoration, hidden from assistive tech. */
  readonly label?: string;
  /** The Slide's figures: SVG in the Scene's 1200 by 800 space, placed with `transform` or `Travel`. */
  readonly children?: ReactNode;
  /** HTML over the drawing, such as a card or the depth ruler, inside the Scene so its motion settles with it. */
  readonly overlay?: ReactNode;
  readonly className?: string;
}

function Band({ facets, band }: { readonly facets: readonly SeaFacet[]; readonly band: 'sky' | 'water' }) {
  return (
    <g data-band={band} className={styles[band]}>
      {facets.map(({ points, tone }) => (
        <polygon key={points} data-tone={tone} points={points} />
      ))}
    </g>
  );
}

function Life({ life }: { readonly life: SceneLife }) {
  switch (life) {
    case 'fish':
      return <FishSchool x={320} y={430} />;
    case 'jellies':
      return <Jellies x={260} y={300} scale={1.6} />;
    case 'whale':
      return <Whale x={360} y={420} scale={1.1} />;
    case 'bubbles':
      return <Bubbles x={220} y={560} count={9} scale={1.5} />;
    case 'wind':
      // The Surface's wind lives in its clouds, which the sky draws.
      return null;
  }
}

function Berg({ part, surface }: { readonly part: SceneIceberg; readonly surface: boolean }) {
  if (part === 'none') return null;
  const waterline = surface ? SURFACE_WATERLINE : 0;
  const depthScale = part === 'tip' ? 1 : depthScaleForKeel(waterline, waterline + KEEL_REACH);
  return <Iceberg part={part} x={900} waterline={waterline} scale={surface ? 0.8 : 1} depthScale={depthScale} />;
}

const SKY_FACETS = seaFacets({ width: SCENE_WIDTH, height: SURFACE_WATERLINE, cell: 160, seed: 11 });
const SURFACE_WATER = seaFacets({ width: SCENE_WIDTH, height: SCENE_HEIGHT - SURFACE_WATERLINE, cell: 150, seed: 5 });
const DEEP_WATER = seaFacets({ width: SCENE_WIDTH, height: SCENE_HEIGHT, cell: 170, seed: 23 });

/** The Surface's sky over its water, or a deeper zone's water throughout. */
function Ground({ sky }: { readonly sky: boolean }) {
  if (!sky) return <Band facets={DEEP_WATER} band="water" />;
  return (
    <>
      <Band facets={SKY_FACETS} band="sky" />
      <SunMoon x={980} y={120} />
      <Clouds />
      <g transform={`translate(0 ${SURFACE_WATERLINE})`}>
        <Band facets={SURFACE_WATER} band="water" />
      </g>
    </>
  );
}

/**
 * The Iceberg style's Scene (design-ADR 0025): the zone's sky or water, its light rays or seabed, the iceberg and the
 * zone's one slow ambient loop, drawn from the scenery parts. A Slide names its zone and places its cast; retuning a
 * zone is one token (`--zone-<zone>` in `globals.css`) every Slide in it follows. The drawing fills the Scene's box
 * from the bottom (`slice`), so the waterline and the seabed stay in view at any width.
 */
export function ZoneScene({ zone, iceberg, label, children, overlay, className }: ZoneSceneProps) {
  const parts = zoneSceneParts({ zone, iceberg });
  const tokens = { '--zone': zoneToken(zone), '--water': zoneToken(parts.water) } as CSSProperties;
  return (
    <SceneMotionRoot
      zone={zone}
      style={tokens}
      className={cn(styles.scene, 'relative isolate overflow-hidden', className)}
    >
      <svg
        viewBox={`0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`}
        preserveAspectRatio="xMidYMax slice"
        role={label === undefined ? undefined : 'img'}
        aria-label={label}
        aria-hidden={label === undefined ? true : undefined}
        className="absolute inset-0 -z-10 size-full"
      >
        <Ground sky={parts.sky} />
        {parts.rays && <LightRays x={60} y={0} count={7} spread={150} length={700} />}
        <Berg part={parts.iceberg} surface={parts.sky} />
        {parts.seabed && <Seabed y={SEABED_TOP} />}
        <Life life={parts.life} />
        {children}
      </svg>
      {overlay}
    </SceneMotionRoot>
  );
}

/** The whole depth's sky and water: its own facets, since its sky is shorter and its water five bands deep. */
const WHOLE_SKY = seaFacets({ width: WHOLE_DEPTH.width, height: WHOLE_DEPTH.waterline, cell: 160, seed: 11 });
const WHOLE_BANDS = depthBands().map((band, depth) => ({
  ...band,
  facets: seaFacets({ width: WHOLE_DEPTH.width, height: band.bottom - band.top, cell: 150, seed: 5 + depth * 6 }),
}));
/** The clouds kept clear of the ship on the left and of the words a Slide writes beside it. */
const WHOLE_CLOUDS = [
  { x: 120, y: 150, scale: 0.75, shape: 0 },
  { x: 1060, y: 230, scale: 0.5, shape: 1 },
] as const;
/** The iceberg pushed to the right edge, so the zones have open water for words; its keel reaches the Abyss. */
const WHOLE_BERG = { x: 1165, scale: 0.6, keel: 820 } as const;
const WHOLE_SEABED_TOP = 845;

export type WholeDepthSceneProps = Omit<ZoneSceneProps, 'zone' | 'iceberg'>;

/** The whole depth's drawing: the sky, each zone's water from the waterline down, the iceberg and the seabed. */
function WholeDepth() {
  return (
    <>
      <Band facets={WHOLE_SKY} band="sky" />
      <SunMoon x={1120} y={70} r={28} />
      <Clouds at={WHOLE_CLOUDS} />
      {WHOLE_BANDS.map(({ zone, top, facets }) => (
        <g
          key={zone}
          data-depth-band={zone}
          transform={`translate(0 ${top})`}
          style={{ '--water': zoneToken(zone) } as CSSProperties}
        >
          <Band facets={facets} band="water" />
        </g>
      ))}
      <Iceberg
        part="whole"
        x={WHOLE_BERG.x}
        waterline={WHOLE_DEPTH.waterline}
        scale={WHOLE_BERG.scale}
        depthScale={depthScaleForKeel(0, (WHOLE_BERG.keel - WHOLE_DEPTH.waterline) / WHOLE_BERG.scale)}
      />
      <Seabed y={WHOLE_SEABED_TOP} />
    </>
  );
}

/**
 * The Iceberg style's whole depth in one Scene: the Surface sky, then each zone's own water stacked from the waterline
 * to the seabed (`depthBands`), the whole iceberg pushed right with its keel down into the Abyss. For a closing Slide
 * that looks at every zone at once; a Slide in one zone uses `ZoneScene`. It draws no creatures, so words written on
 * the water stay legible, and keeps the Surface's wind as its one ambient loop. The drawing keeps its proportions
 * (1200 by 880), so a Slide places its overlay in the drawing's units read against the Scene's width.
 */
export function WholeDepthScene({ label, children, overlay, className }: WholeDepthSceneProps) {
  const { width, height } = WHOLE_DEPTH;
  return (
    <SceneMotionRoot
      zone="surface"
      style={{ '--zone': zoneToken('surface') } as CSSProperties}
      className={cn(styles.scene, 'relative isolate', className)}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: `${width} / ${height}` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role={label === undefined ? undefined : 'img'}
          aria-label={label}
          aria-hidden={label === undefined ? true : undefined}
          className="absolute inset-0 -z-10 size-full"
        >
          <WholeDepth />
          {children}
        </svg>
      </div>
      {overlay}
    </SceneMotionRoot>
  );
}
