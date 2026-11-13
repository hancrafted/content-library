import { cn } from '@/shared/lib/utils';
import styles from './depth-ruler.module.css';
import { rulerBands, type Zone } from './ruler.pure';
import { ZoneLabel, type ZoneLabelWords } from './zone-label';

/** Each zone's words: its plain name, its depth in metres and its scientific name, from the Slide's `i18n/`. */
export type ZoneWords = Readonly<Record<Zone, ZoneLabelWords>>;

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

/**
 * The whole depth ruler a section slide shows (design guide, Iceberg): the five zone bands from the Surface down, each
 * with its plain label and the ocean term beneath, one tile per Section on its band. On entry the view descends and
 * the Section's tile lights, once (`data-motion="descent"`); its rest state is the end state.
 */
export function DepthRuler({ sections, lit, zones, label, descend = true, className }: DepthRulerProps) {
  const bands = rulerBands(sections, lit);
  return (
    <div data-depth-ruler data-motion={descend ? 'descent' : undefined} className={cn(styles.ruler, className)}>
      <ol aria-label={label} className={styles.view}>
        {bands.map(({ zone, tiles }) => (
          <li key={zone} data-ruler-zone={zone} className={styles.band}>
            <span className="flex min-w-0 flex-col">
              <ZoneLabel words={zones[zone]} className={styles.label} />
              <span data-ocean-term className="text-caption opacity-80">
                {zones[zone].science}
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
        ))}
      </ol>
    </div>
  );
}

/**
 * The slim rail at a page Slide's left edge (design guide, Iceberg): one tile per Section in its zone's colour, the
 * Slide's Section lit. Decoration the table of contents already says in words, so it is wordless and hidden from
 * assistive tech.
 */
export function DepthRail({ sections, lit }: Pick<DepthRulerProps, 'sections' | 'lit'>) {
  const tiles = rulerBands(sections, lit).flatMap(({ zone, tiles: own }) => own.map((tile) => ({ zone, ...tile })));
  return (
    <div data-depth-rail aria-hidden="true" className={styles.rail}>
      {tiles.map(({ zone, section, lit: on }) => (
        <span
          key={section}
          data-section={section}
          data-rail-zone={zone}
          data-lit={on ? '' : undefined}
          className={cn(styles.railTile, on && styles.lit)}
        />
      ))}
    </div>
  );
}
