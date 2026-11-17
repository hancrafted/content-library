'use client';

import { useEffect, useState, type ReactNode } from 'react';
import styles from './tip.module.css';

interface TipProps {
  readonly text: ReactNode;
  readonly place?: 'below' | 'above';
  readonly align?: 'start' | 'center' | 'end';
  readonly className?: string;
  readonly children: ReactNode;
}

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

export function Tip({ text, place = 'below', align = 'center', className, children }: TipProps) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const shown = (hover || focus) && !dismissed;
  useDismissOnEscape(shown, () => setDismissed(true));
  return (
    <span
      className={className ? `${styles.tipHost} ${className}` : styles.tipHost}
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
