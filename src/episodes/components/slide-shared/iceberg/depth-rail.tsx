import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import styles from './depth-rail.module.css';
import { rulerBands, zoneToken, type Zone } from './ruler.pure';

export interface DepthRailProps {
  /** The zone each of the Episode's Sections sits in, in order. */
  readonly sections: readonly Zone[];
  /** The Section the Slide belongs to, from 0; its tile lights. */
  readonly lit: number;
  /** True keeps the rail to phones, where a section slide's depth gauge is hidden. */
  readonly phoneOnly?: boolean;
}

/**
 * The slim rail at a Slide's left edge (design guide, Iceberg): one tile per Section in its zone's colour, the
 * Slide's Section lit; on a phone a thin coloured strip, so depth still reads where the gauge's words do not fit.
 * Decoration the table of contents already says in words, so it is wordless and hidden from assistive tech.
 */
export function DepthRail({ sections, lit, phoneOnly = false }: DepthRailProps) {
  const tiles = rulerBands(sections, lit).flatMap(({ zone, tiles: own }) => own.map((tile) => ({ zone, ...tile })));
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
