import { SCENE_HEIGHT, SCENE_WIDTH } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import type { ReactNode } from 'react';
import styles from './shallows-art.module.css';

const SPEC = { width: 560, height: 330, waterline: 112, bed: 280 } as const;
const SCALE = SCENE_WIDTH / SPEC.width;
const TOP = SCENE_HEIGHT - SPEC.height * SCALE;

export const atSpec = (x: number, y: number) => ({ x: x * SCALE, y: TOP + y * SCALE });

export const SHALLOWS = { waterline: atSpec(0, SPEC.waterline).y, bed: atSpec(0, SPEC.bed).y } as const;

export const SHALLOWS_ASPECT = 'aspect-[56/33]';

export function ShallowsArt({ children }: { readonly children?: ReactNode }) {
  return (
    <g aria-hidden data-shallows-art className={styles.art} transform={`translate(0 ${TOP}) scale(${SCALE})`}>
      {children}
    </g>
  );
}
