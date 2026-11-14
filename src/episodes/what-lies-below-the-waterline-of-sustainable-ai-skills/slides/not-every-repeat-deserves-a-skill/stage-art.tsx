import { cn } from '@/shared/lib/utils';
import styles from './stage-art.module.css';
import { BINDER, CARD, CLIP, PIN, SHEET, WALL, type ArtFacet } from './stage-facets';

/** Facets in paint order, each a path its tone colours. */
function Facets({ facets }: { readonly facets: readonly ArtFacet[] }) {
  return facets.map(([tone, d], index) => <path key={index} data-tone={tone} d={d} />);
}

/** Where each lifted piece sits in the Spec's 1000 by 600 stage, as an SVG `viewBox`. */
const BOXES = {
  sheet: '350 30 326 610',
  clip: '475 8 76 44',
  card: '706 36 270 524',
  pin: '830 36 22 20',
} as const;

/** The binder's bottom-left corner in the Spec's stage, the point it stands on. */
const BINDER_FOOT = { x: 180, y: 500 } as const;

interface PieceProps {
  readonly className?: string;
}

/**
 * The faceted control-room wall of Spec Option 9a behind the whole stage, decoration only: it covers the stage box,
 * cropped rather than stretched, so its facets keep their shape at any width.
 */
export function WallArt({ className }: PieceProps) {
  return (
    <svg
      aria-hidden
      data-wall-art
      viewBox="0 0 1000 600"
      preserveAspectRatio="xMinYMax slice"
      className={cn(styles.art, className)}
    >
      <Facets facets={WALL} />
    </svg>
  );
}

/** A paper surface stretched to its card: the index sheet's or the check card's facets. */
export function PaperArt({ piece, className }: PieceProps & { readonly piece: 'sheet' | 'card' }) {
  return (
    <svg
      aria-hidden
      data-paper-art={piece}
      viewBox={BOXES[piece]}
      preserveAspectRatio="none"
      className={cn(styles.art, className)}
    >
      <Facets facets={piece === 'sheet' ? SHEET : CARD} />
    </svg>
  );
}

/** The clip the index sheet hangs from, or the pin holding the check card to the wall. */
export function FastenerArt({ piece, className }: PieceProps & { readonly piece: 'clip' | 'pin' }) {
  return (
    <svg aria-hidden data-fastener={piece} viewBox={BOXES[piece]} className={cn(styles.art, className)}>
      <Facets facets={piece === 'clip' ? CLIP : PIN} />
    </svg>
  );
}

/**
 * The fat ring binder of Spec Option 9a bursting with thin card tabs, the never-tested ones stamped red: an SVG group
 * standing on `(x, y)` in its Scene's units at `scale`.
 */
export function StuffedBinder({ x, y, scale }: { readonly x: number; readonly y: number; readonly scale: number }) {
  return (
    <g
      data-binder
      transform={`translate(${x} ${y}) scale(${scale}) translate(${-BINDER_FOOT.x} ${-BINDER_FOOT.y})`}
      className={styles.art}
    >
      <Facets facets={BINDER} />
    </g>
  );
}
