'use client';

import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef } from 'react';
import { mountHeaderInk } from './header-ink';
import styles from './header.module.css';

/** Decorative ink only; route selection and link semantics remain with the navigation. */
export function HeaderInk() {
  const layer = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();
  useLayoutEffect(() => {
    if (layer.current) return mountHeaderInk(layer.current);
  }, [pathname]);
  return (
    <span ref={layer} aria-hidden="true" data-testid="header-ink" className={styles.ink}>
      <span className={styles.inkPart} />
      <span className={styles.inkPart} />
    </span>
  );
}
