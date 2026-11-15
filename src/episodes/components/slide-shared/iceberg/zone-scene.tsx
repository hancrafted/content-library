import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import { Art } from '../art/art';
import { artName } from '../art/art.pure';
import { SceneMotionRoot } from './scene-motion.client';
import { Bubbles } from './scenery/bubbles';
import { Clouds } from './scenery/clouds';
import { FishSchool } from './scenery/fish-school';
import { Iceberg } from './scenery/iceberg';
import { placeIceberg } from './scenery/iceberg-placement.pure';
import { Jellies } from './scenery/jellies';
import { Lanternfish } from './scenery/lanternfish';
import { LightRays, Seabed } from './scenery/seabed';
import { Siphonophore } from './scenery/siphonophore';
import { FlatWater, LitWaterline, Sky } from './scenery/sky';
import { SunMoon } from './scenery/sun-moon';
import { Whale } from './scenery/whale';
import { seaFacets, WATER_CELL, type SeaFacet } from './zone-edges.pure';
import styles from './zone-scene.module.css';
import {
  sectionTitleLiftStyle,
  SURFACE_WATERLINE,
  TITLE_LIFE_AT,
  TITLE_LOOP_AT,
  zoneSceneParts,
  type SceneIceberg,
  type SceneLife,
  type TitleLife,
} from './zone-scene.pure';
import { zoneToken, type Zone } from './zones.pure';

/** Every Scene draws in one space, 1200 by 800, so a Slide places its figures in the same numbers at every zone. */
export const SCENE_WIDTH = 1200;
export const SCENE_HEIGHT = 800;
/** Where the Surface's waterline runs; below the Surface the whole Scene is water. */
export { SURFACE_WATERLINE };
/** How far a lifted Surface title's sky runs on above its drawing, in the Scene's units: past any lift a phone takes. */
const SKY_RISE = 600;

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
   * A Surface title's drawing starts at the top (feedback 3, decision 48); `figuresReach` is how far the Slide's
   * figures reach above the waterline, such as the ship's masthead, and the drawing moves down only as far as keeps
   * them below the title.
   */
  readonly sectionTitle?: boolean | { readonly figuresReach: number };
  /**
   * `false` when the Slide's overlay covers the zone's open water, so its ambient creature (the Midnight whale, the
   * Twilight jellies) would show only as a stray part between the overlay's cards. The water, rays and seabed stay.
   */
  readonly openWater?: boolean;
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
      <Art name={artName('water', facets)}>
        {facets.map(({ points, tone }) => (
          <polygon key={points} data-tone={tone} points={points} />
        ))}
      </Art>
    </g>
  );
}

/** The zone's one ambient loop, and the creatures only its Section title adds; none where the Slide covers the water. */
function Life({
  life,
  titleLife,
  sectionTitle,
  open = true,
}: {
  readonly life: SceneLife;
  readonly titleLife: readonly TitleLife[];
  readonly sectionTitle: boolean;
  readonly open?: boolean;
}) {
  if (!open) return null;
  return (
    <>
      <Loop life={life} sectionTitle={sectionTitle} />
      {titleLife.map((creature) => (
        <TitleCreature key={creature} life={creature} />
      ))}
    </>
  );
}

function Loop({ life, sectionTitle }: { readonly life: SceneLife; readonly sectionTitle: boolean }) {
  switch (life) {
    case 'fish':
      return <FishSchool x={320} y={430} />;
    case 'jellies':
      return <Jellies x={260} y={300} scale={1.6} />;
    case 'whale':
      return <Whale x={360} y={420} scale={1.1} />;
    case 'bubbles':
      return sectionTitle ? (
        <Bubbles
          x={TITLE_LOOP_AT.bubbles.x}
          y={TITLE_LOOP_AT.bubbles.y}
          count={9}
          scale={TITLE_LOOP_AT.bubbles.scale}
        />
      ) : (
        <Bubbles x={220} y={560} count={9} scale={1.5} />
      );
    case 'wind':
      // The Surface's wind lives in its clouds, which the sky draws.
      return null;
  }
}

/** The Twilight Section titles' extra life: a lanternfish school low right of the robot, a siphonophore beside it, in view on a phone. */
function TitleCreature({ life }: { readonly life: TitleLife }) {
  switch (life) {
    case 'lanternfish':
      return (
        <Lanternfish
          x={TITLE_LIFE_AT.lanternfish.x}
          y={TITLE_LIFE_AT.lanternfish.y}
          scale={TITLE_LIFE_AT.lanternfish.scale}
        />
      );
    case 'siphonophore':
      return (
        <Siphonophore
          x={TITLE_LIFE_AT.siphonophore.x}
          y={TITLE_LIFE_AT.siphonophore.y}
          scale={TITLE_LIFE_AT.siphonophore.scale}
        />
      );
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

/** The Surface's faceted sky over its flat water, the waterline lit between them, or a deeper zone's faceted water. */
function Ground({ sky, rise }: { readonly sky: boolean; readonly rise: number }) {
  if (!sky) return <Band facets={DEEP_WATER} />;
  return (
    <>
      <Sky width={SCENE_WIDTH} height={SURFACE_WATERLINE} rise={rise} />
      <SunMoon x={980} y={120} />
      <Clouds />
      <g transform={`translate(0 ${SURFACE_WATERLINE})`}>
        <FlatWater width={SCENE_WIDTH} height={SCENE_HEIGHT - SURFACE_WATERLINE} />
      </g>
      <LitWaterline width={SCENE_WIDTH} y={SURFACE_WATERLINE} />
    </>
  );
}

/** How a Scene fills its box: from the bottom, or a Surface title from the top, lifted clear of its title's words. */
function fillOf(sectionTitle: ZoneSceneProps['sectionTitle'], sky: boolean) {
  if (!sectionTitle || !sky) return { aspect: 'xMidYMax slice', rise: 0 } as const;
  return {
    aspect: 'xMidYMin slice',
    rise: SKY_RISE,
    root: styles.lifted,
    drawing: styles.liftedDrawing,
    style: sectionTitleLiftStyle(sectionTitle === true ? 0 : sectionTitle.figuresReach),
  } as const;
}

/**
 * The Iceberg style's Scene (design-ADR 0025): the zone's sky or water, its light rays or seabed, the iceberg and the
 * zone's one slow ambient loop, drawn from the scenery parts. A Slide names its zone and places its cast; retuning a
 * zone is one token (`--zone-<zone>` in `globals.css`) every Slide in it follows. The drawing fills the Scene's box
 * from the bottom (`slice`), so the waterline and the seabed stay in view at any width; a Surface Section title fills
 * it from the top instead, its whole sky at the top edge, moved down only as far as keeps its figures under the title.
 */
export function ZoneScene(props: ZoneSceneProps) {
  const { zone, iceberg, sectionTitle, openWater, label, children, overlay, className } = props;
  const parts = zoneSceneParts({ zone, iceberg, sectionTitle: Boolean(sectionTitle) });
  const fill = fillOf(sectionTitle, parts.sky);
  const tokens = { '--zone': zoneToken(zone), '--water': zoneToken(parts.water), ...fill.style } as CSSProperties;
  return (
    <SceneMotionRoot
      zone={zone}
      style={tokens}
      className={cn(styles.scene, fill.root, 'relative isolate overflow-hidden', className)}
    >
      <svg
        viewBox={`0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`}
        preserveAspectRatio={fill.aspect}
        role={label === undefined ? undefined : 'img'}
        aria-label={label}
        aria-hidden={label === undefined ? true : undefined}
        className={cn('absolute inset-0 -z-10 size-full', fill.drawing)}
      >
        <Ground sky={parts.sky} rise={fill.rise} />
        {parts.rays && <LightRays x={60} y={0} count={7} spread={150} length={700} />}
        <Berg part={parts.iceberg} surface={parts.sky} />
        {parts.seabed && <Seabed y={SEABED_TOP} />}
        <Life life={parts.life} titleLife={parts.titleLife} sectionTitle={Boolean(sectionTitle)} open={openWater} />
        {children}
      </svg>
      {overlay}
    </SceneMotionRoot>
  );
}
