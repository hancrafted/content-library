import type { CSSProperties, ReactNode } from 'react';
import styles from './travel.module.css';

export interface TravelProps {
  /** Where the figures start, as a CSS `translate` against the Scene's drawing: `-20% -10%`. */
  readonly from: string;
  /** Where they come to rest; their drawn place unless given. */
  readonly to?: string;
  /** How long the move takes, in milliseconds. */
  readonly duration?: number;
  /** How long after the Slide turns active the move starts, in milliseconds. */
  readonly delay?: number;
  readonly children: ReactNode;
}

const DEFAULT_DURATION_MS = 1600;

/**
 * Moves its figures across the Scene once, when the Slide turns active (design-ADR 0025, Motion 3): positions belong
 * to the Slide, so moving between them is this, never a figure's own `motion`. An SVG group inside `ZoneScene`; its
 * rest state is `to`, so a still frame and reduced motion show the figures where they arrive.
 */
export function Travel({ from, to = '0 0', duration = DEFAULT_DURATION_MS, delay = 0, children }: TravelProps) {
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
