import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import { SceneMotionRoot } from './scene-motion.client';
import { Clouds } from './scenery/clouds';
import { Iceberg } from './scenery/iceberg';
import { placeIcebergInBands } from './scenery/iceberg-placement.pure';
import { Seabed } from './scenery/seabed';
import { LitWaterline, Sky } from './scenery/sky';
import { SunMoon } from './scenery/sun-moon';
import { Band, type ZoneSceneProps } from './zone-scene';
import styles from './zone-scene.module.css';
import { depthBands, WHOLE_DEPTH, wholeWater } from './zone-scene.pure';
import { zoneToken } from './zones.pure';

const WHOLE_BANDS = wholeWater();
const WHOLE_CLOUDS = [
  { x: 470, y: 95, scale: 0.35, shape: 1 },
  { x: 150, y: 130, scale: 0.6, shape: 0 },
  { x: 770, y: 430, scale: 0.8, shape: 0 },
] as const;
const WHOLE_BERG = placeIcebergInBands(depthBands(), { x: 1165, waterline: WHOLE_DEPTH.waterline, scale: 0.6 });
const WHOLE_SEABED_TOP = 845;

export type WholeDepthSceneProps = Omit<ZoneSceneProps, 'zone' | 'iceberg'>;

function WholeDepth() {
  return (
    <>
      <Sky width={WHOLE_DEPTH.width} height={WHOLE_DEPTH.waterline} />
      <SunMoon x={1120} y={70} r={28} />
      <Clouds at={WHOLE_CLOUDS} />
      {WHOLE_BANDS.map(({ zone, facets }) => (
        <g key={zone} data-depth-band={zone} style={{ '--water': zoneToken(zone) } as CSSProperties}>
          <Band facets={facets} />
        </g>
      ))}
      <LitWaterline width={WHOLE_DEPTH.width} y={WHOLE_DEPTH.waterline} />
      <Iceberg part="whole" {...WHOLE_BERG} />
      <Seabed y={WHOLE_SEABED_TOP} />
    </>
  );
}

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
