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

export const SCENE_WIDTH = 1200;
export const SCENE_HEIGHT = 800;
export { SURFACE_WATERLINE };
const SKY_RISE = 600;

const SEABED_TOP = 690;
const UNSEEN_TWILIGHT = 100;

export interface ZoneSceneProps {
  readonly zone: Zone;
  readonly iceberg?: SceneIceberg;
  readonly sectionTitle?: boolean | { readonly figuresReach: number };
  readonly openWater?: boolean;
  readonly label?: string;
  readonly children?: ReactNode;
  readonly overlay?: ReactNode;
  readonly className?: string;
}

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
      return null;
  }
}

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

// decision: docs/adr/0025-scene-figures-are-deep-modules.md
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
