import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { SCENE_HEIGHT } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { cn } from '@/shared/lib/utils';
import styles from './library-art.module.css';
import { ABYSS, type ArtFacet, BINDER, DARK_CORNER, HALO } from './library-facets';

const SPEC_SCENE_HEIGHT = 720;

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

export const ART_CLASS = styles.art;
export const CORNER_INK = styles.cornerInk;

export function AbyssBand() {
  return (
    <g aria-hidden className={styles.art} transform={`scale(1 ${SCENE_HEIGHT / SPEC_SCENE_HEIGHT})`}>
      <ToneFacets facets={ABYSS} />
    </g>
  );
}

export function HaloArt({ className }: { readonly className?: string }) {
  return <Stretched facets={HALO} width={120} height={600} className={className} />;
}

export function BinderArt() {
  return <Stretched facets={BINDER} width={640} height={620} />;
}

export function DarkCornerArt() {
  return <Stretched facets={DARK_CORNER} width={240} height={200} />;
}
