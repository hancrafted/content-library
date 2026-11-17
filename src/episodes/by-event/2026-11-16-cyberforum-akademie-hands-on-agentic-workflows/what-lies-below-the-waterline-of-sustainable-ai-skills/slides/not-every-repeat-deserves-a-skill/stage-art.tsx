import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { cn } from '@/shared/lib/utils';
import styles from './stage-art.module.css';
import { BINDER, CARD, CLIP, PIN, SHEET, WALL } from './stage-facets';

const BOXES = {
  sheet: '350 30 326 610',
  clip: '475 8 76 44',
  card: '706 36 270 524',
  pin: '830 36 22 20',
} as const;

const BINDER_FOOT = { x: 180, y: 500 } as const;

interface PieceProps {
  readonly className?: string;
}

export function WallArt({ className }: PieceProps) {
  return (
    <svg
      aria-hidden
      data-wall-art
      viewBox="0 0 1000 600"
      preserveAspectRatio="xMinYMax slice"
      className={cn(styles.art, className)}
    >
      <ToneFacets facets={WALL} />
    </svg>
  );
}

export function PaperArt({ piece, className }: PieceProps & { readonly piece: 'sheet' | 'card' }) {
  return (
    <svg
      aria-hidden
      data-paper-art={piece}
      viewBox={BOXES[piece]}
      preserveAspectRatio="none"
      className={cn(styles.art, className)}
    >
      <ToneFacets facets={piece === 'sheet' ? SHEET : CARD} />
    </svg>
  );
}

export function FastenerArt({ piece, className }: PieceProps & { readonly piece: 'clip' | 'pin' }) {
  return (
    <svg aria-hidden data-fastener={piece} viewBox={BOXES[piece]} className={cn(styles.art, className)}>
      <ToneFacets facets={piece === 'clip' ? CLIP : PIN} />
    </svg>
  );
}

export function StuffedBinder({ x, y, scale }: { readonly x: number; readonly y: number; readonly scale: number }) {
  return (
    <g
      data-binder
      transform={`translate(${x} ${y}) scale(${scale}) translate(${-BINDER_FOOT.x} ${-BINDER_FOOT.y})`}
      className={styles.art}
    >
      <ToneFacets facets={BINDER} />
    </g>
  );
}
