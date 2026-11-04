import styles from '@/shared/components/animations/magnetic-ink.module.css';
import { createContext, useContext, useEffect, useRef, type RefObject } from 'react';
import type { InkBrowser, InkOptions } from './magnetic-ink-browser';
import { bindInkHost } from './magnetic-ink-host';

export const InkPageContext = createContext<InkBrowser | null>(null);

/** Custom client hosts opt in through a known host reference, never selector discovery. */
export function useMagneticInk(host: RefObject<HTMLElement | null>, options: InkOptions) {
  const page = useContext(InkPageContext);
  const latest = useRef(options);
  latest.current = options;
  useEffect(() => {
    const element = host.current;
    if (!element || !page) return;
    element.classList.add(styles.surface);
    element.dataset.inkKind = latest.current.kind;
    const dispose = bindInkHost(page, element, () => latest.current);
    return () => {
      dispose();
      element.classList.remove(styles.surface);
      delete element.dataset.inkKind;
    };
  }, [page, host]);
}
