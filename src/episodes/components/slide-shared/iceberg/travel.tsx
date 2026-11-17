import type { CSSProperties, ReactNode } from 'react';
import styles from './travel.module.css';

export interface TravelProps {
  readonly from: string;
  readonly to?: string;
  readonly duration?: number;
  readonly delay?: number;
  readonly children: ReactNode;
}

const DEFAULT_DURATION_MILLISECONDS = 1600;

// decision: docs/decision-records/0025-scene-figures-are-deep-modules.md
export function Travel({
  from,
  to = '0 0',
  duration = DEFAULT_DURATION_MILLISECONDS,
  delay = 0,
  children,
}: TravelProps) {
  const style = {
    '--travel-from': from,
    '--travel-to': to,
    '--travel-duration': `${duration}ms`,
    '--travel-delay': `${delay}ms`,
  } as CSSProperties;
  return (
    <g data-travel data-motion="travel" className={styles.travel} style={style}>
      {children}
    </g>
  );
}
