import { bubbleField } from '@/shared/lib/bubble-field.pure';
import type { CSSProperties } from 'react';
import styles from './bubble-rise.module.css';
import { PolyBubble } from './poly-bubble';

/** About forty bubbles of mixed sizes (Iceberg feedback-2 grill, decision 12). */
const FIELD = bubbleField(40);
const SIDES = [6, 7, 8] as const;

/**
 * Short property names on purpose: forty bubbles ride every Section edge, twice over in the page (HTML and its RSC
 * payload). `--x` left in % of the host, `--s` size in px, `--b` the progress it enters at, `--r` host heights it
 * climbs per unit of progress, `--p` its sway's phase (`bubble-field.pure.ts`).
 *
 * The `bubbles` transition's air bubbles: faceted `PolyBubble`s rising through the edge host, each climbing from
 * below its bottom past its top as the inherited `--surface-edge-progress` runs from 0 to 1. Each moves on its own by
 * transform only, over a fixed field, so it renders no frame state; the host hides it under reduced motion, in print
 * and while suppressed. Its tint is `--slide-transition-bubble`, by default the incoming surface.
 */
export function BubbleRise() {
  return (
    <div data-bubble-rise className={styles.field}>
      {FIELD.map(({ x, size, start, rise, phase }, index) => (
        <PolyBubble
          key={`${x}-${size}`}
          sides={SIDES[index % SIDES.length]}
          style={{ '--x': x, '--s': size, '--b': start, '--r': rise, '--p': phase } as CSSProperties}
        />
      ))}
    </div>
  );
}
