import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import styles from './depth-ruler.module.css';
import { descentOf, isDarkZone, rulerBands, zoneToken, type RulerBand, type Zone } from './ruler.pure';
import { ZoneLabel } from './zone-label';
import type { ZoneLabelWords, ZoneWords } from './zone-words.pure';

export type { ZoneWords } from './zone-words.pure';

export interface DepthRulerProps {
  /** The zone each of the Episode's Sections sits in, in order. */
  readonly sections: readonly Zone[];
  /** The Section the Slide belongs to, from 0; its tile lights. */
  readonly lit: number;
  readonly zones: ZoneWords;
  /** The ruler's name for assistive tech: `Depth ruler, What a skill is lit`. */
  readonly label: string;
  /** False keeps the ruler still: the Title slide is the Surface, where no descent has begun. */
  readonly descend?: boolean;
  readonly className?: string;
}

/** The zone's surface for a band or a rail tile: its one token, and light text where the zone is dark. */
function zoneLook(zone: Zone) {
  return { style: { '--zone': zoneToken(zone) } as CSSProperties, dark: isDarkZone(zone) ? '' : undefined };
}

/** One zone's band on the ruler: its label, the ocean term beneath, and its Sections' tiles. */
function Band({ band: { zone, tiles }, words }: { readonly band: RulerBand; readonly words: ZoneLabelWords }) {
  const look = zoneLook(zone);
  return (
    <li data-ruler-zone={zone} data-dark={look.dark} style={look.style} className={styles.band}>
      <span className="flex min-w-0 flex-col">
        <ZoneLabel words={words} className={styles.label} />
        <span data-ocean-term className="text-caption opacity-80">
          {words.science}
        </span>
      </span>
      <span className="ml-auto flex shrink-0 flex-col items-end gap-1" aria-hidden="true">
        {tiles.map((tile) => (
          <span
            key={tile.section}
            data-tile
            data-section={tile.section}
            data-lit={tile.lit ? '' : undefined}
            className={cn(styles.tile, tile.lit && styles.lit)}
          />
        ))}
      </span>
    </li>
  );
}

/**
 * The whole depth ruler a section slide shows (design guide, Iceberg): the five zone bands from the Surface down, each
 * with its plain label and the ocean term beneath, one tile per Section on its band. On entry the view, a frame one
 * band tall, travels down from the Surface to the Section's band, as many bands as the Section sits deep
 * (`data-descent`), and then the Section's tile lights, once (`data-motion="descent"`). Its rest state is the end
 * state: the frame on the Section's band, the tile lit.
 */
export function DepthRuler({ sections, lit, zones, label, descend = true, className }: DepthRulerProps) {
  const bands = rulerBands(sections, lit);
  const descent = descentOf(sections, lit);
  return (
    <div
      data-depth-ruler
      data-motion={descend ? 'descent' : undefined}
      data-descent={descend ? descent : undefined}
      style={{ '--descent': descent } as CSSProperties}
      className={cn(styles.ruler, className)}
    >
      <ol aria-label={label} className={styles.bands}>
        {bands.map((band) => (
          <Band key={band.zone} band={band} words={zones[band.zone]} />
        ))}
      </ol>
      {descend && <span data-ruler-view aria-hidden="true" className={styles.view} />}
    </div>
  );
}

export interface DepthRailProps extends Pick<DepthRulerProps, 'sections' | 'lit'> {
  /** True keeps the rail to phones, where a section slide hides its whole ruler. */
  readonly phoneOnly?: boolean;
}

/**
 * The slim rail at a Slide's left edge (design guide, Iceberg): one tile per Section in its zone's colour, the
 * Slide's Section lit; on a phone a thin coloured strip, so depth still reads where the ruler's words do not fit.
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
          style={zoneLook(zone).style}
          className={cn(styles.railTile, on && styles.lit)}
        />
      ))}
    </div>
  );
}
