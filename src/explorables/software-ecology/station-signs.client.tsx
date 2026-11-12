'use client';

import { Glyph } from './factory-glyph-view';
import styles from './software-ecology.module.css';
import type { SignsProps } from './station-card-view';
import { ToolTip } from './toolbar-tip.client';

/*
 * The red signs above a station card (rework, churn, passing unread and the rest). Each names itself in the site's one
 * tooltip, on hover and on keyboard focus; a sign that is off is hidden and out of the tab order.
 */
export function StationSigns({ signs, r, words, targets }: SignsProps) {
  return (
    <div className={styles.signs}>
      {signs.map((k) => (
        <ToolTip key={k} tip={r.signs[k] ? words.signs[k] : ''}>
          <span
            className={styles.sign}
            data-sign={k}
            data-on={r.signs[k]}
            role="img"
            aria-label={words.signs[k]}
            aria-hidden={r.signs[k] ? undefined : true}
            tabIndex={r.signs[k] ? 0 : -1}
            {...targets?.[k]}
          >
            <Glyph name={k} className={styles.ico} />
          </span>
        </ToolTip>
      ))}
    </div>
  );
}
