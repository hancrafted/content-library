import { bubbleField } from '@/shared/lib/bubble-field.pure';
import type { CSSProperties } from 'react';
import styles from './bubble-rise.module.css';

const FIELD = bubbleField(24);

/**
 * The `bubbles` transition's air bubbles: round, separate bubbles rising through the edge host, each climbing from
 * below its bottom past its top as the inherited `--surface-edge-progress` runs from 0 to 1. Pure CSS over a fixed
 * field, so it renders no frame state; the host hides it under reduced motion, in print and while suppressed. Its
 * colour is `--slide-transition-bubble`, by default the incoming surface, mixed with the foreground so it reads on any
 * surface, the same surface on both sides of the edge included.
 */
export function BubbleRise() {
  return (
    <div data-bubble-rise className={styles.field}>
      {FIELD.map(({ x, size, start, rise, phase }) => (
        <span
          key={`${x}-${size}`}
          data-bubble
          className={styles.bubble}
          style={
            {
              '--bubble-x': x,
              '--bubble-size': size,
              '--bubble-start': start,
              '--bubble-rise': rise,
              '--bubble-phase': phase,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
