import { cn } from '@/shared/lib/utils';
import type { ComponentType, CSSProperties, ReactNode } from 'react';
import styles from './hero-depth-scene.module.css';
import { HERO_DEPTH, heroDepthBands } from './hero-depth.pure';
import { isDarkZone, zoneToken } from './ruler.pure';
import { SceneMotionRoot } from './scene-motion.client';
import { Iceberg } from './scenery/iceberg';
import { depthScaleForKeel } from './scenery/scenery.pure';
import { FishSchool, Whale } from './scenery/sea-life';
import { LightRays } from './scenery/seabed';
import { Clouds, SunMoon } from './scenery/sky';
import { ZoneLabel } from './zone-label';
import { Band } from './zone-scene';
import sceneStyles from './zone-scene.module.css';
import { seaFacets } from './zone-scene.pure';
import type { ZoneWords } from './zone-words.pure';

const { width, height, waterline } = HERO_DEPTH;
const BANDS = heroDepthBands(HERO_DEPTH);
const SKY = seaFacets({ width, height: waterline, cell: 160, seed: 11 });
const WATER = BANDS.slice(1).map((band, depth) => ({
  ...band,
  facets: seaFacets({ width, height: band.bottom - band.top, cell: 140, seed: 5 + depth * 6 }),
}));
/** Clouds kept to the right and low on the left, so the title and lede read on open sky. */
const CLOUDS = [
  { x: 1050, y: 210, scale: 0.9, shape: 0 },
  { x: 160, y: 660, scale: 0.85, shape: 0 },
  { x: 560, y: 560, scale: 0.55, shape: 1 },
] as const;
const BERG = { x: 1010, scale: 0.8, keel: 900 } as const;

/** The drawing: the Surface sky, each zone's water from the waterline down, the iceberg, sun rays, fish and whale. */
function Depth({ children }: { readonly children?: ReactNode }) {
  return (
    <>
      <Band facets={SKY} band="sky" />
      <SunMoon x={1110} y={110} r={30} />
      <Clouds at={CLOUDS} />
      {WATER.map(({ zone, top, facets }) => (
        <g
          key={zone}
          data-depth-band={zone}
          transform={`translate(0 ${top})`}
          style={{ '--water': zoneToken(zone) } as CSSProperties}
        >
          <Band facets={facets} band="water" />
        </g>
      ))}
      <LightRays x={140} y={waterline} count={6} spread={130} length={230} />
      <Iceberg
        part="whole"
        x={BERG.x}
        waterline={waterline}
        scale={BERG.scale}
        depthScale={depthScaleForKeel(0, (BERG.keel - waterline) / BERG.scale)}
      />
      <FishSchool x={330} y={762} />
      <Whale x={300} y={915} scale={0.7} />
      {children}
    </>
  );
}

/** The ruler drawn down the Scene's left edge: each zone's plain name at its band, the Surface's tile lit. */
function Ruler({ zones, label }: { readonly zones: ZoneWords; readonly label: string }) {
  return (
    <ol aria-label={label} data-hero-ruler className={styles.ruler}>
      {BANDS.map(({ zone, label: y }) => (
        <li
          key={zone}
          data-ruler-zone={zone}
          data-lit={zone === 'surface' ? '' : undefined}
          data-dark={isDarkZone(zone) ? '' : undefined}
          style={{ '--at-y': y } as CSSProperties}
          className={styles.zone}
        >
          <span aria-hidden="true" className={styles.tile} />
          <ZoneLabel words={zones[zone]} className={styles.label} />
        </li>
      ))}
    </ol>
  );
}

export interface HeroDepthSceneProps {
  /** The Slide master's Backdrop, handed in: a `slide-shared` part does not import the Slide master. */
  readonly layers: { readonly Backdrop: ComponentType<{ mobile?: boolean; children?: ReactNode }> };
  /** Words for the picture: the drawing sits in the Backdrop, hidden from assistive tech, so they are read here. */
  readonly label: string;
  readonly zones: ZoneWords;
  /** The ruler's name for assistive tech. */
  readonly rulerLabel: string;
  /** The "you are here" pill and the point in the drawing it hangs under, such as the robot. */
  readonly marker: { readonly text: string; readonly x: number; readonly y: number };
  /** The Slide's figures: SVG in the drawing's 1200 by 1000 space, waterline at `HERO_DEPTH.waterline`. */
  readonly children?: ReactNode;
  /** HTML the Slide places over the hero, such as the view switch. */
  readonly overlay?: ReactNode;
}

/** The whole depth in the Slide's Backdrop: decoration, full-bleed, filled from the bottom. */
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
          preserveAspectRatio="xMidYMax slice"
          aria-hidden="true"
          data-hero-depth
          className="absolute inset-0 size-full"
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
 * Slide's title and lede sit in its sky. Over it, the depth ruler down the left edge, each zone's label beside its
 * band, and the "you are here" pill under the figure the Slide names. The drawing fills its box from the bottom
 * (`slice`); the ruler and the pill follow it through the same scale, read from the overlay's container size.
 */
export function HeroDepthScene({ layers, label, zones, rulerLabel, marker, children, overlay }: HeroDepthSceneProps) {
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
        <Ruler zones={zones} label={rulerLabel} />
        <Marker marker={marker} />
        {overlay}
      </div>
    </>
  );
}
