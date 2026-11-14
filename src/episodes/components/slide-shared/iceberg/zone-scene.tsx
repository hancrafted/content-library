import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import { zoneToken, type Zone } from './ruler.pure';
import { SceneMotionRoot } from './scene-motion.client';
import { Clouds } from './scenery/clouds';
import { FishSchool } from './scenery/fish-school';
import { FlatSky, FlatWater, LitWaterline } from './scenery/flat-sky';
import { Iceberg } from './scenery/iceberg';
import { placeIceberg } from './scenery/iceberg-placement.pure';
import { Jellies } from './scenery/jellies';
import { Lanternfish } from './scenery/lanternfish';
import { Bubbles } from './scenery/sea-life';
import { LightRays, Seabed } from './scenery/seabed';
import { Siphonophore } from './scenery/siphonophore';
import { SunMoon } from './scenery/sun-moon';
import { Whale } from './scenery/whale';
import styles from './zone-scene.module.css';
import {
  seaFacets,
  TITLE_LIFE_AT,
  WATER_CELL,
  zoneSceneParts,
  type SceneIceberg,
  type SceneLife,
  type SeaFacet,
  type TitleLife,
} from './zone-scene.pure';

/** Every Scene draws in one space, 1200 by 800, so a Slide places its figures in the same numbers at every zone. */
export const SCENE_WIDTH = 1200;
export const SCENE_HEIGHT = 800;
/** Where the Surface's waterline runs; below the Surface the whole Scene is water. */
export const SURFACE_WATERLINE = 400;

const SEABED_TOP = 690;
/** The zone a ZoneScene draws fills the Scene, so the Twilight zone it does not draw starts at the Scene's bottom. */
const UNSEEN_TWILIGHT = 100;

export interface ZoneSceneProps {
  /** The one choice a Slide makes: the zone it sits in. */
  readonly zone: Zone;
  /** Another part of the iceberg than the zone's own (`whole` on the Surface, `keel` in Sunlit, none deeper). */
  readonly iceberg?: SceneIceberg;
  /**
   * The Scene is a Section title's drawing, so it adds its zone's title life (feedback 2, decision 11): on a Twilight
   * title a lanternfish school and a siphonophore beside the drifting jellies; every other zone draws as on a page.
   */
  readonly sectionTitle?: boolean;
  /** Words for the picture; without them it is decoration, hidden from assistive tech. */
  readonly label?: string;
  /** The Slide's figures: SVG in the Scene's 1200 by 800 space, placed with `transform` or `Travel`. */
  readonly children?: ReactNode;
  /** HTML over the drawing, such as a card or the depth gauge, inside the Scene so its motion settles with it. */
  readonly overlay?: ReactNode;
  readonly className?: string;
}

/** One band of faceted water, filled from the Scene's `--water`; the sky and the Surface's water are flat. */
export function Band({ facets }: { readonly facets: readonly SeaFacet[] }) {
  return (
    <g data-band="water" className={styles.water}>
      {facets.map(({ points, tone }) => (
        <polygon key={points} data-tone={tone} points={points} />
      ))}
    </g>
  );
}

/** The zone's one ambient loop, and the creatures only its Section title adds. */
function Life({ life, titleLife }: { readonly life: SceneLife; readonly titleLife: readonly TitleLife[] }) {
  return (
    <>
      <Loop life={life} />
      {titleLife.map((creature) => (
        <TitleCreature key={creature} life={creature} />
      ))}
    </>
  );
}

function Loop({ life }: { readonly life: SceneLife }) {
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

/** The Twilight Section titles' extra life: a lanternfish school low right of the robot, a siphonophore beside it, in view on a phone. */
function TitleCreature({ life }: { readonly life: TitleLife }) {
  switch (life) {
    case 'lanternfish':
      return <Lanternfish {...TITLE_LIFE_AT.lanternfish} />;
    case 'siphonophore':
      return <Siphonophore {...TITLE_LIFE_AT.siphonophore} />;
  }
}

/** The berg through the one placement every Scene shares: body in the Sunlit zone, keel touching the Twilight zone. */
function Berg({ part, surface }: { readonly part: SceneIceberg; readonly surface: boolean }) {
  if (part === 'none') return null;
  const placed = placeIceberg({
    x: 900,
    waterline: surface ? SURFACE_WATERLINE : 0,
    scale: surface ? 0.8 : 1,
    sunlitBottom: SCENE_HEIGHT,
    twilightDepth: UNSEEN_TWILIGHT,
  });
  return <Iceberg part={part} {...placed} depthScale={part === 'tip' ? 1 : placed.depthScale} />;
}

const DEEP_WATER = seaFacets({ width: SCENE_WIDTH, height: SCENE_HEIGHT, cell: WATER_CELL, seed: 23 });

/** The Surface's flat sky over its flat water, the waterline lit between them, or a deeper zone's faceted water. */
function Ground({ sky }: { readonly sky: boolean }) {
  if (!sky) return <Band facets={DEEP_WATER} />;
  return (
    <>
      <FlatSky width={SCENE_WIDTH} height={SURFACE_WATERLINE} />
      <SunMoon x={980} y={120} />
      <Clouds />
      <g transform={`translate(0 ${SURFACE_WATERLINE})`}>
        <FlatWater width={SCENE_WIDTH} height={SCENE_HEIGHT - SURFACE_WATERLINE} />
      </g>
      <LitWaterline width={SCENE_WIDTH} y={SURFACE_WATERLINE} />
    </>
  );
}

/**
 * The Iceberg style's Scene (design-ADR 0025): the zone's sky or water, its light rays or seabed, the iceberg and the
 * zone's one slow ambient loop, drawn from the scenery parts. A Slide names its zone and places its cast; retuning a
 * zone is one token (`--zone-<zone>` in `globals.css`) every Slide in it follows. The drawing fills the Scene's box
 * from the bottom (`slice`), so the waterline and the seabed stay in view at any width.
 */
export function ZoneScene({ zone, iceberg, sectionTitle, label, children, overlay, className }: ZoneSceneProps) {
  const parts = zoneSceneParts({ zone, iceberg, sectionTitle });
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
        <Life life={parts.life} titleLife={parts.titleLife} />
        {children}
      </svg>
      {overlay}
    </SceneMotionRoot>
  );
}
