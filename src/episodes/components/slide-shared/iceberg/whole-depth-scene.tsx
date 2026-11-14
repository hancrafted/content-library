import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import { SceneMotionRoot } from './scene-motion.client';
import { Clouds } from './scenery/clouds';
import { FlatSky, LitWaterline } from './scenery/flat-sky';
import { Iceberg } from './scenery/iceberg';
import { placeIceberg } from './scenery/iceberg-placement.pure';
import { Seabed } from './scenery/seabed';
import { SunMoon } from './scenery/sun-moon';
import { Band, type ZoneSceneProps } from './zone-scene';
import styles from './zone-scene.module.css';
import { depthBands, seaFacets, WATER_CELL, WHOLE_DEPTH } from './zone-scene.pure';
import { zoneToken } from './zones.pure';

/** The whole depth's water under the waterline: its own facets, four bands deep; the Surface is the sky above. */
const WHOLE_BANDS = depthBands()
  .filter(({ zone }) => zone !== 'surface')
  .map((band, depth) => ({
    ...band,
    facets: seaFacets({
      width: WHOLE_DEPTH.width,
      height: band.bottom - band.top,
      cell: WATER_CELL,
      seed: 5 + depth * 6,
    }),
  }));
const bandOf = (zone: 'sunlit' | 'twilight') => WHOLE_BANDS.find((band) => band.zone === zone)!;
/** The clouds in three layers, kept clear of the ship, the berg and the Surface's words floating in the sky. */
const WHOLE_CLOUDS = [
  { x: 470, y: 95, scale: 0.35, shape: 1 },
  { x: 150, y: 130, scale: 0.6, shape: 0 },
  { x: 770, y: 430, scale: 0.8, shape: 0 },
] as const;
/** The iceberg pushed to the right edge, so the zones have open water for words; its keel touches the Twilight zone. */
const WHOLE_BERG = placeIceberg({
  x: 1165,
  waterline: WHOLE_DEPTH.waterline,
  scale: 0.6,
  sunlitBottom: bandOf('sunlit').bottom,
  twilightDepth: bandOf('twilight').bottom - bandOf('twilight').top,
});
const WHOLE_SEABED_TOP = 845;

export type WholeDepthSceneProps = Omit<ZoneSceneProps, 'zone' | 'iceberg'>;

/** The whole depth's drawing: the sky, each zone's water from the waterline down, the iceberg and the seabed. */
function WholeDepth() {
  return (
    <>
      <FlatSky width={WHOLE_DEPTH.width} height={WHOLE_DEPTH.waterline} />
      <SunMoon x={1120} y={70} r={28} />
      <Clouds at={WHOLE_CLOUDS} />
      {WHOLE_BANDS.map(({ zone, top, facets }) => (
        <g
          key={zone}
          data-depth-band={zone}
          transform={`translate(0 ${top})`}
          style={{ '--water': zoneToken(zone) } as CSSProperties}
        >
          <Band facets={facets} />
        </g>
      ))}
      <LitWaterline width={WHOLE_DEPTH.width} y={WHOLE_DEPTH.waterline} />
      <Iceberg part="whole" {...WHOLE_BERG} />
      <Seabed y={WHOLE_SEABED_TOP} />
    </>
  );
}

/**
 * The Iceberg style's whole depth in one Scene: the Surface sky, then each zone's own water stacked from the waterline
 * to the seabed (`depthBands`, whose Surface band floats in the sky), the whole iceberg pushed right with its keel touching the Twilight zone. For a closing Slide
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
