import { cn } from '@/shared/lib/utils';
import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { DepthGauge } from './depth-gauge';
import styles from './hero-depth-scene.module.css';
import { HERO_DEPTH, heroBleed, heroDepthBands, heroKeel } from './hero-depth.pure';
import { zoneToken } from './ruler.pure';
import { SceneMotionRoot } from './scene-motion.client';
import { Iceberg } from './scenery/iceberg';
import { depthScaleForKeel } from './scenery/scenery.pure';
import { FishSchool, Whale } from './scenery/sea-life';
import { LightRays } from './scenery/seabed';
import { Clouds, SunMoon } from './scenery/sky';
import { Band } from './zone-scene';
import sceneStyles from './zone-scene.module.css';
import { seaFacets } from './zone-scene.pure';
import type { ZoneWords } from './zone-words.pure';

const { width, height, waterline } = HERO_DEPTH;
const BANDS = heroDepthBands(HERO_DEPTH);
/** Sky and water run a drawing's width past each side, for a screen wider than the drawing. */
const BLEED = heroBleed(HERO_DEPTH);
const SKY = seaFacets({ width: BLEED.width, height: waterline, cell: 160, seed: 11 });
const WATER = BANDS.slice(1).map((band, depth) => ({
  ...band,
  facets: seaFacets({ width: BLEED.width, height: band.bottom - band.top, cell: 140, seed: 5 + depth * 6 }),
}));
/** The sun under the header bar and above the title, near enough the middle that a phone still shows it. */
const SUN = { x: 850, y: 200, r: 34 } as const;
/** Clouds kept to the right and low on the left, so the title reads on open sky; heights above the waterline. */
const CLOUDS = [
  { x: 1090, y: 290, scale: 0.9, shape: 0 },
  { x: 160, y: waterline - 50, scale: 0.85, shape: 0 },
  { x: 560, y: waterline - 150, scale: 0.55, shape: 1 },
] as const;
/** The iceberg, its keel a fifth into the Twilight zone; the fish in the Sunlit zone, the whale in the Twilight. */
const BERG = { x: 1010, scale: 0.7, keel: heroKeel(HERO_DEPTH) } as const;
const FISH = { x: 790, y: waterline + 62 } as const;
const WHALE = { x: 560, y: waterline + 265, scale: 0.7 } as const;

/** Each zone's water under the waterline, in its own colour, bleeding past both sides. */
function Water() {
  return WATER.map(({ zone, top, facets }) => (
    <g
      key={zone}
      data-depth-band={zone}
      transform={`translate(${BLEED.left} ${top})`}
      style={{ '--water': zoneToken(zone) } as CSSProperties}
    >
      <Band facets={facets} band="water" />
    </g>
  ));
}

/** The drawing: the Surface sky, each zone's water, the iceberg, sun rays, and fish and whale. */
function Depth({ children }: { readonly children?: ReactNode }) {
  return (
    <>
      <g transform={`translate(${BLEED.left} 0)`}>
        <Band facets={SKY} band="sky" />
      </g>
      <SunMoon x={SUN.x} y={SUN.y} r={SUN.r} />
      <Clouds at={CLOUDS} />
      <Water />
      <LightRays x={140} y={waterline} count={6} spread={130} length={230} />
      <Iceberg
        part="whole"
        x={BERG.x}
        waterline={waterline}
        scale={BERG.scale}
        depthScale={depthScaleForKeel(0, (BERG.keel - waterline) / BERG.scale)}
      />
      <FishSchool x={FISH.x} y={FISH.y} />
      <Whale x={WHALE.x} y={WHALE.y} scale={WHALE.scale} />
      {children}
    </>
  );
}

export interface HeroDepthSceneProps {
  /** The Slide master's Backdrop, handed in: a `slide-shared` part does not import the Slide master. */
  readonly layers: { readonly Backdrop: ComponentType<{ mobile?: boolean; children?: ReactNode }> };
  /** Words for the picture: the drawing sits in the Backdrop, hidden from assistive tech, so they are read here. */
  readonly label: string;
  readonly zones: ZoneWords;
  /** The depth gauge's name for assistive tech. */
  readonly gaugeLabel: string;
  /** The "you are here" pill and the point in the drawing it hangs under, such as the robot. */
  readonly marker: { readonly text: string; readonly x: number; readonly y: number };
  /** The Slide's figures: SVG in the drawing's `HERO_DEPTH` space, waterline at `HERO_DEPTH.waterline`. */
  readonly children?: ReactNode;
  /** HTML the Slide places over the hero, such as the view switch. */
  readonly overlay?: ReactNode;
}

/**
 * The whole depth in the Slide's Backdrop: decoration, full-bleed, fitted to the hero's height and centred, so the sky,
 * the sun and all five zones stay in view; a wider screen sees the bleed of sky and water past the drawing's sides.
 */
function Drawing({ Backdrop, children }: Pick<HeroDepthSceneProps, 'children'> & HeroDepthSceneProps['layers']) {
  return (
    <Backdrop mobile>
      <SceneMotionRoot
        zone="surface"
        style={{ '--zone': zoneToken('surface') } as CSSProperties}
        className={cn(sceneStyles.scene, 'absolute inset-0 overflow-hidden')}
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
      </SceneMotionRoot>
    </Backdrop>
  );
}

/** The "you are here" pill, hung under its point in the drawing. */
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

/**
 * The Title slide's full-bleed hero in the Iceberg style (the Spec's picked Title-slide Option 0a): one drawing of the
 * whole depth fills the Slide from edge to edge as its Backdrop, under the hidden table of contents too, so the
 * Slide's title sits in its sky. Over it, the slim depth gauge at the right edge naming the Surface, and the "you are
 * here" pill under the figure the Slide names. The drawing takes the hero's full height, so every zone shows; the pill
 * follows it through the same scale, read from the overlay's container size.
 */
export function HeroDepthScene({ layers, label, zones, gaugeLabel, marker, children, overlay }: HeroDepthSceneProps) {
  return (
    <>
      <Drawing Backdrop={layers.Backdrop}>{children}</Drawing>
      <div
        data-hero-overlay
        style={{ '--hero-width': width, '--hero-height': height } as CSSProperties}
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
