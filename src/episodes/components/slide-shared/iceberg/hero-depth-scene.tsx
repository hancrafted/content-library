import { cn } from '@/shared/lib/utils';
import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { ArtNow } from '../art/art';
import { DepthGauge } from './depth-gauge';
import styles from './hero-depth-scene.module.css';
import { HERO_DEPTH, heroBleed, heroIceberg, heroLiftStyle, heroSeabed, heroWater } from './hero-depth.pure';
import { SceneMotionRoot } from './scene-motion.client';
import { type CloudAt, Clouds } from './scenery/clouds';
import { FishSchool } from './scenery/fish-school';
import { Iceberg } from './scenery/iceberg';
import { LightRays, Seabed } from './scenery/seabed';
import { LitWaterline, Sky } from './scenery/sky';
import { SunMoon } from './scenery/sun-moon';
import { Whale } from './scenery/whale';
import { Band } from './zone-scene';
import sceneStyles from './zone-scene.module.css';
import type { ZoneWords } from './zone-words.pure';
import { zoneToken } from './zones.pure';

const { width, height, waterline } = HERO_DEPTH;
const BLEED = heroBleed(HERO_DEPTH);
const WATER = heroWater(HERO_DEPTH);
const LIFT = heroLiftStyle(HERO_DEPTH);
const SKY_RISE = 900;
const SEABED = heroSeabed(HERO_DEPTH);
const SUN = { x: 1130, y: 300, r: 30 } as const;
const CLOUDS: readonly CloudAt[] = [
  { x: 150, y: waterline - 95, scale: 0.38, shape: 1, layer: 'far' },
  { x: 900, y: waterline - 120, scale: 0.4, shape: 0, layer: 'far' },
  { x: 420, y: waterline - 60, scale: 0.5, shape: 1, layer: 'mid' },
  { x: 1240, y: waterline - 70, scale: 0.55, shape: 0, layer: 'mid' },
  { x: 220, y: waterline - 25, scale: 0.85, shape: 0, layer: 'near' },
  { x: -120, y: waterline - 40, scale: 0.7, shape: 1, layer: 'near' },
];
const BERG = heroIceberg(HERO_DEPTH);
const FISH = { x: 790, y: waterline + 62 } as const;
const WHALE = { x: 560, y: waterline + 340, scale: 0.7 } as const;

function Water() {
  return WATER.map(({ zone, facets }) => (
    <g key={zone} data-depth-band={zone} style={{ '--water': zoneToken(zone) } as CSSProperties}>
      <Band facets={facets} />
    </g>
  ));
}

function Floor() {
  return (
    <>
      <g transform={`translate(0 ${SEABED.y}) scale(-1 1)`}>
        <Seabed y={0} />
      </g>
      <Seabed y={SEABED.y} />
      <g transform={`translate(${2 * width} ${SEABED.y}) scale(-1 1)`}>
        <Seabed y={0} />
      </g>
    </>
  );
}

function Depth({ children }: { readonly children?: ReactNode }) {
  return (
    <>
      <Sky x={BLEED.left} width={BLEED.width} height={waterline} rise={SKY_RISE} />
      <SunMoon x={SUN.x} y={SUN.y} r={SUN.r} />
      <Clouds at={CLOUDS} />
      <Water />
      <g transform={`translate(${BLEED.left} 0)`}>
        <LitWaterline width={BLEED.width} y={waterline} />
      </g>
      <LightRays x={140} y={waterline} count={6} spread={130} length={230} />
      <Iceberg part="whole" {...BERG} />
      <FishSchool x={FISH.x} y={FISH.y} />
      <Whale x={WHALE.x} y={WHALE.y} scale={WHALE.scale} />
      <Floor />
      {children}
    </>
  );
}

export interface HeroDepthSceneProps {
  readonly layers: { readonly Backdrop: ComponentType<{ mobile?: boolean; children?: ReactNode }> };
  readonly label: string;
  readonly zones: ZoneWords;
  readonly gaugeLabel: string;
  readonly marker: { readonly text: string; readonly x: number; readonly y: number };
  readonly children?: ReactNode;
  readonly overlay?: ReactNode;
}

function Drawing({ Backdrop, children }: Pick<HeroDepthSceneProps, 'children'> & HeroDepthSceneProps['layers']) {
  return (
    <Backdrop mobile>
      <SceneMotionRoot
        zone="surface"
        style={{ '--zone': zoneToken('surface'), ...LIFT } as CSSProperties}
        className={cn(sceneStyles.scene, styles.frame, 'absolute inset-0 overflow-hidden')}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          aria-hidden="true"
          data-hero-depth
          style={{ aspectRatio: `${width} / ${height}` }}
          className={styles.drawing}
        >
          <Depth>{children}</Depth>
        </svg>
        {/* The Title slide's art loads as the HTML parses: its first paint never waits for hydration (FE-009 §4). */}
        <ArtNow />
      </SceneMotionRoot>
    </Backdrop>
  );
}

function Marker({ marker: { text, x, y } }: Pick<HeroDepthSceneProps, 'marker'>) {
  return (
    <p
      data-you-are-here
      style={{ '--at-x': x, '--at-y': y } as CSSProperties}
      className={cn(
        styles.marker,
        'rounded-full bg-primary px-3 py-1 text-caption font-semibold text-primary-foreground shadow-md',
      )}
    >
      {text}
    </p>
  );
}

export function HeroDepthScene({ layers, label, zones, gaugeLabel, marker, children, overlay }: HeroDepthSceneProps) {
  return (
    <>
      <Drawing Backdrop={layers.Backdrop}>{children}</Drawing>
      <div
        data-hero-overlay
        style={{ '--hero-width': width, '--hero-height': height, ...LIFT } as CSSProperties}
        className={styles.overlay}
      >
        <p data-hero-label className="sr-only">
          {label}
        </p>
        <DepthGauge zone="surface" words={zones.surface} label={gaugeLabel} className={styles.gauge} />
        <Marker marker={marker} />
        {overlay}
      </div>
    </>
  );
}
