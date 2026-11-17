import { Ship } from '@/episodes/components/slide-shared/deep-sea-expedition/ship';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import styles from './skill-scope-matrix.module.css';
import type { SquareFacet } from './square-facet';
import { SQUARE_FACETS } from './square-facets';

export type PictureKind = keyof typeof SQUARE_FACETS;

const WIDTH = 380;
const HEIGHT = 145;

const SHIPS: Record<PictureKind, readonly { x: number; y: number; scale: number }[]> = {
  notebook: [],
  toolkit: [],
  binder: [{ x: 249, y: 79, scale: 0.42 }],
  fleet: [
    { x: 238, y: 74.5, scale: 0.3 },
    { x: 302, y: 74.5, scale: 0.24 },
    { x: 357, y: 74.5, scale: 0.19 },
  ],
};

const Facets = ({ facets }: { readonly facets: readonly SquareFacet[] }) =>
  facets.map(({ tone, d }, index) => <path key={`${tone}-${index}`} data-tone={tone} d={d} />);

export interface SquarePictureProps {
  readonly kind: PictureKind;
  readonly children?: ReactNode;
}

export function SquarePicture({ kind, children }: SquarePictureProps) {
  const { back, front } = SQUARE_FACETS[kind];
  return (
    <div data-picture={kind} className={cn(styles.onPicture, 'relative aspect-[76/29] overflow-hidden rounded-md')}>
      <svg
        aria-hidden
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMax slice"
        className={cn(styles.picture, 'absolute inset-0 size-full')}
      >
        <Facets facets={back} />
        {SHIPS[kind].map(({ x, y, scale }) => (
          <Ship key={x} transform={`translate(${x} ${y}) scale(${scale})`} />
        ))}
        <Facets facets={front} />
      </svg>
      {children}
    </div>
  );
}
