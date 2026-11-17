import { PolyBubble } from '@/shared/components/core-components/poly-bubble/poly-bubble';
import { bubbleField } from '@/shared/lib/bubble-field.pure';
import type { CSSProperties } from 'react';
import styles from './bubble-rise.module.css';

const FIELD = bubbleField(40);
const SIDES = [6, 7, 8] as const;

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
