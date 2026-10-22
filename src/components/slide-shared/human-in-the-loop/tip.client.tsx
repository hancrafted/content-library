'use client';

import { useEffect, useState, type ReactNode } from 'react';
import styles from './human-in-the-loop.module.css';

/*
 * The one tooltip of the visual (toolbar icons, BRIEF circles, prompt icons, the Short toggle, the modal X). It shows
 * on hover and on keyboard focus, stays while the pointer moves onto it, and Escape dismisses it without moving the
 * pointer or focus (WCAG 1.4.13). The host wraps the control; the control keeps its own accessible name, so the
 * bubble is hidden from assistive technology and never carries information the name does not.
 */

interface TipProps {
  readonly text: string;
  /** The bubble hangs below the control, or above it. */
  readonly place?: 'below' | 'above';
  /** Which edge of the control the bubble lines up with; `end` keeps a control at the right edge from widening the page. */
  readonly align?: 'start' | 'center' | 'end';
  readonly children: ReactNode;
}

/** While a tip shows, Escape dismisses it first and never reaches the dialog or anything else behind it. */
function useDismissOnEscape(shown: boolean, dismiss: () => void) {
  useEffect(() => {
    if (!shown) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      dismiss();
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [shown, dismiss]);
}

export function Tip({ text, place = 'below', align = 'center', children }: TipProps) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const shown = (hover || focus) && !dismissed;
  useDismissOnEscape(shown, () => setDismissed(true));
  return (
    <span
      className={styles.tipHost}
      data-tip-host=""
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setDismissed(false);
      }}
      onFocus={() => setFocus(true)}
      onBlur={() => {
        setFocus(false);
        setDismissed(false);
      }}
    >
      {children}
      <span aria-hidden="true" className={styles.tip} data-place={place} data-align={align} data-shown={shown}>
        <span className={`${styles.tipText} text-caption font-normal`} data-tip-text="">
          {text}
        </span>
      </span>
    </span>
  );
}
