import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import styles from './skill-scope-matrix.module.css';

export type PictureKind = 'notebook' | 'toolkit' | 'binder' | 'fleet';

/** The picture's drawing space: wide and low, a strip under the square's words. */
const WIDTH = 400;
const HEIGHT = 140;
const SURFACE = 72;

function Desk() {
  return (
    <g>
      <polygon data-tone="desk-lit" points={`0,108 ${WIDTH},108 ${WIDTH},116 0,116`} />
      <polygon data-tone="desk" points={`0,116 ${WIDTH},116 ${WIDTH},${HEIGHT} 0,${HEIGHT}`} />
      <polygon data-tone="desk-shade" points={`240,116 ${WIDTH},116 ${WIDTH},${HEIGHT} 300,${HEIGHT}`} />
    </g>
  );
}

function Sea() {
  return (
    <g>
      <polygon data-tone="sky" points={`0,0 ${WIDTH},0 ${WIDTH},${SURFACE} 0,${SURFACE}`} />
      <polygon data-tone="sky-lit" points={`0,0 180,0 60,${SURFACE} 0,${SURFACE}`} />
      <polygon data-tone="sea" points={`0,${SURFACE} ${WIDTH},${SURFACE} ${WIDTH},${HEIGHT} 0,${HEIGHT}`} />
      <polygon data-tone="sea-lit" points={`0,${SURFACE} 220,${SURFACE} 90,${HEIGHT} 0,${HEIGHT}`} />
    </g>
  );
}

/** Ruled lines on a sheet or a page, as many as asked, from `y` down. */
function Lines({ x, y, width, count }: { x: number; y: number; width: number; count: number }) {
  return Array.from({ length: count }, (_, index) => (
    <line key={index} data-tone="rule" x1={x} x2={x + width} y1={y + index * 10} y2={y + index * 10} strokeWidth={2} />
  ));
}

const DRAWINGS: Record<PictureKind, () => ReactNode> = {
  // The captain's own notebook open on the desk, its pages scribbled, a pencil beside it.
  notebook: () => (
    <>
      <Desk />
      <polygon data-tone="cover" points="24,40 206,36 206,110 24,110" />
      <polygon data-tone="page-lit" points="30,42 118,48 118,106 30,104" />
      <polygon data-tone="page" points="118,48 200,40 200,104 118,106" />
      <g data-tone="scribble">
        <Lines x={40} y={58} width={66} count={4} />
      </g>
      <polygon data-tone="pencil" points="300,104 368,86 372,92 304,108" />
    </>
  ),
  // A card box in the captain's colour beside the pinned dive plan.
  toolkit: () => (
    <>
      <Desk />
      <polygon data-tone="box-lit" points="40,62 220,62 210,108 40,108" />
      <polygon data-tone="box" points="220,62 240,54 236,100 210,108" />
      <polygon data-tone="box-top" points="40,62 60,54 240,54 220,62" />
      {[70, 110, 150, 190].map((x) => (
        <rect key={x} data-tone="tab" x={x} y={44} width={22} height={12} />
      ))}
      <polygon data-tone="page-lit" points="270,22 360,26 356,104 268,100" />
      <rect data-tone="pin" x={306} y={16} width={12} height={10} />
      <g data-tone="rule">
        <Lines x={282} y={58} width={58} count={4} />
      </g>
    </>
  ),
  // The project binder with its supporting sheets, the ship on the Surface water behind it.
  binder: () => (
    <>
      <Sea />
      <Ship transform={`translate(290 ${SURFACE + 6}) scale(0.42)`} />
      <polygon data-tone="binder-lit" points="40,22 118,22 118,128 40,128" />
      <polygon data-tone="binder" points="118,22 128,28 128,132 118,128" />
      <rect data-tone="page-lit" x={56} y={36} width={46} height={12} />
      {[44, 64, 84].map((y) => (
        <rect key={y} data-tone="tab" x={128} y={y} width={10} height={14} />
      ))}
    </>
  ),
  // The fleet manual, three ships of the fleet on the water behind it.
  fleet: () => (
    <>
      <Sea />
      {[215, 285, 355].map((x) => (
        <Ship key={x} transform={`translate(${x} ${SURFACE + 4}) scale(0.2)`} />
      ))}
      <polygon data-tone="manual-lit" points="30,20 120,20 120,132 30,132" />
      <polygon data-tone="manual" points="120,20 132,26 132,136 120,132" />
      <rect data-tone="gilt" x={44} y={40} width={62} height={4} />
      <rect data-tone="gilt" x={44} y={108} width={62} height={4} />
    </>
  ),
};

export interface SquarePictureProps {
  readonly kind: PictureKind;
  /** The HTML on the drawing: its labels, the scribbled card, the owner tag. */
  readonly children?: ReactNode;
}

/**
 * The small project picture under a square's words (Option 18a): one drawing per square, its labels over it. Too
 * narrow for its labels' corners, the picture stacks them in flow over the drawing instead (its CSS module).
 */
export function SquarePicture({ kind, children }: SquarePictureProps) {
  return (
    <div data-picture={kind} className={cn(styles.onPicture, 'relative aspect-[20/7] overflow-hidden rounded-md')}>
      <svg
        aria-hidden
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMax slice"
        className={cn(styles.picture, 'absolute inset-0 size-full')}
      >
        {DRAWINGS[kind]()}
      </svg>
      {children}
    </div>
  );
}
