import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import type { ReactNode } from 'react';
import styles from './room-art.module.css';
import { ROOM } from './room-facets';

const CABLE = { x: 313, top: 40, rail: 74 } as const;

export function RoomArt({ children }: { readonly children?: ReactNode }) {
  return (
    <g data-room-art className={styles.art}>
      <ToneFacets facets={ROOM} />
      <line
        data-cable
        x1={CABLE.x}
        y1={CABLE.top}
        x2={CABLE.x}
        y2={CABLE.rail}
        data-tone="hull"
        className={styles.cable}
      />
      {children}
    </g>
  );
}
