import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { SCENE_HEIGHT } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { cn } from '@/shared/lib/utils';
import styles from './library-art.module.css';
import { ABYSS, type ArtFacet, BINDER, DARK_CORNER, HALO } from './library-facets';

/** The Spec's Scene is 1200 by 720; the Abyss band stretches to the Scene's 800 units of height. */
const SPEC_SCENE_HEIGHT = 720;

/** A part of the drawing stretched over its HTML box, as the Spec draws it (`preserveAspectRatio="none"`). */
function Stretched({
  facets,
  width,
  height,
  className,
}: {
  readonly facets: readonly ArtFacet[];
  readonly width: number;
  readonly height: number;
  readonly className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn(styles.art, 'absolute inset-0 size-full', className)}
    >
      <ToneFacets facets={facets} />
    </svg>
  );
}

/** The ink and tones of the drawing, for the HTML that sits on it: the dark corner's light words. */
export const ART_CLASS = styles.art;
export const CORNER_INK = styles.cornerInk;

/**
 * The Abyss band under the Midnight water, where the robot hangs (Spec Option 21a, feedback 3, decision 46): SVG in
 * the Scene's 1200 by 800 space, the Spec's 720 units of height stretched to it.
 */
export function AbyssBand() {
  return (
    <g aria-hidden className={styles.art} transform={`scale(1 ${SCENE_HEIGHT / SPEC_SCENE_HEIGHT})`}>
      <ToneFacets facets={ABYSS} />
    </g>
  );
}

/** The zoom beam's faceted halo, stretched over the column between the square and the page. */
export function HaloArt({ className }: { readonly className?: string }) {
  return <Stretched facets={HALO} width={120} height={600} className={className} />;
}

/** The fleet manual's binder behind the front page: covers, index tabs, faceted page and rings. */
export function BinderArt() {
  return <Stretched facets={BINDER} width={640} height={620} />;
}

/** The page's lower corner, left dark in three faceted tones. */
export function DarkCornerArt() {
  return <Stretched facets={DARK_CORNER} width={240} height={200} />;
}
