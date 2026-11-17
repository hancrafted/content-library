import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import styles from './depth-rail.module.css';
import { railBands, zoneToken, type Zone } from './zones.pure';

export interface DepthRailProps {
  readonly sections: readonly Zone[];
  readonly lit: number;
  readonly phoneOnly?: boolean;
}

export function DepthRail({ sections, lit, phoneOnly = false }: DepthRailProps) {
  const tiles = railBands(sections, lit).flatMap(({ zone, tiles: own }) => own.map((tile) => ({ zone, ...tile })));
  return (
    <div
      data-depth-rail
      data-phone-only={phoneOnly ? '' : undefined}
      aria-hidden="true"
      className={cn(styles.rail, phoneOnly && styles.phoneOnly)}
    >
      {tiles.map(({ zone, section, lit: on }) => (
        <span
          key={section}
          data-section={section}
          data-rail-zone={zone}
          data-lit={on ? '' : undefined}
          style={{ '--zone': zoneToken(zone) } as CSSProperties}
          className={cn(styles.railTile, on && styles.lit)}
        />
      ))}
    </div>
  );
}
