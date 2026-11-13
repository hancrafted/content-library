import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import type { Zone } from './ruler.pure';
import { SceneMotionRoot } from './scene-motion.client';
import { Iceberg } from './scenery/iceberg';
import { depthScaleForKeel } from './scenery/scenery.pure';
import { Bubbles, FishSchool, Jellies, Whale } from './scenery/sea-life';
import { LightRays, Seabed } from './scenery/seabed';
import { Clouds, SunMoon } from './scenery/sky';
import styles from './zone-scene.module.css';
import { seaFacets, zoneSceneParts, type SceneIceberg, type SceneLife, type SeaFacet } from './zone-scene.pure';

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
  /** False drops the zone's creature and its loop, where the Spec keeps creatures off a Slide. */
  readonly ambient?: boolean;
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
    default:
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
export function ZoneScene({ zone, iceberg, ambient, label, children, overlay, className }: ZoneSceneProps) {
  const parts = zoneSceneParts({ zone, iceberg, ambient });
  return (
    <SceneMotionRoot zone={zone} className={cn(styles.scene, 'relative isolate overflow-hidden', className)}>
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
