import { cn } from '@/shared/lib/utils';
import type { ComponentType, CSSProperties, ReactNode } from 'react';
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
/** Sky and water run a drawing's width past each side, for a screen wider than the drawing. */
const BLEED = heroBleed(HERO_DEPTH);
/** Each underwater band: faceted across the drawing, flat across the bleed (decision 8), between wavy boundaries. */
const WATER = heroWater(HERO_DEPTH);
/** What the hero's CSS lifts the drawing by on a short window, so the title clears the masthead (`heroLift`). */
const LIFT = heroLiftStyle(HERO_DEPTH);
/** How far the sky runs up above the drawing, for the lift: more than the most a phone lifts it, in the drawing's units. */
const SKY_RISE = 900;
/** The seabed the Abyss ends on (feedback 3, decision 45). */
const SEABED = heroSeabed(HERO_DEPTH);
/** The sun low in the sky right of the berg, clear of the title above the masthead and of the ship and the berg. */
const SUN = { x: 1130, y: 300, r: 30 } as const;
/**
 * The sky's clouds in the three drifting layers the Section titles' sky has (decision 9), low on the horizon below the
 * masthead's height, so the title reads on open sky, and clear of the sun, the ship and the berg.
 */
const CLOUDS: readonly CloudAt[] = [
  { x: 150, y: waterline - 95, scale: 0.38, shape: 1, layer: 'far' },
  { x: 900, y: waterline - 120, scale: 0.4, shape: 0, layer: 'far' },
  { x: 420, y: waterline - 60, scale: 0.5, shape: 1, layer: 'mid' },
  { x: 1240, y: waterline - 70, scale: 0.55, shape: 0, layer: 'mid' },
  { x: 220, y: waterline - 25, scale: 0.85, shape: 0, layer: 'near' },
  { x: -120, y: waterline - 40, scale: 0.7, shape: 1, layer: 'near' },
];
/** The one iceberg placement: body in the Sunlit band, keel touching the Twilight band, keel twice the tip. */
const BERG = heroIceberg(HERO_DEPTH);
/** The fish in the Sunlit zone, the whale in the Twilight. */
const FISH = { x: 790, y: waterline + 62 } as const;
const WHALE = { x: 560, y: waterline + 340, scale: 0.7 } as const;

/** Each zone's water under the waterline, in its own colour, low poly across the drawing and its bleed. */
function Water() {
  return WATER.map(({ zone, facets }) => (
    <g key={zone} data-depth-band={zone} style={{ '--water': zoneToken(zone) } as CSSProperties}>
      <Band facets={facets} />
    </g>
  ));
}

/**
 * The seabed across the drawing and, mirrored, across the bleed on each side: a mirrored copy meets the drawn one on
 * the same edge, so a wide screen sees one floor.
 */
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

/** The drawing: the Surface sky, each zone's water, the iceberg, sun rays, fish and whale, and the seabed. */
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
