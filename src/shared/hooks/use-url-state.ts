import type { UrlState } from '@/shared/lib/url-state';
import { createContext, useContext, useSyncExternalStore, type MouseEvent } from 'react';

// decision: FE-001 §2
export const UrlStateContext = createContext<UrlState | null>(null);

export function useUrlState(): UrlState | null {
  return useContext(UrlStateContext);
}

const NO_SLIDE = () => null;
const NO_UNSUBSCRIBE = () => undefined;
const NEVER_NOTIFIES = () => NO_UNSUBSCRIBE;

// decision: FE-001 §2
export function useActiveSlide(): string | null {
  const service = useUrlState();
  return useSyncExternalStore(
    service ? service.subscribe : NEVER_NOTIFIES,
    service ? service.getSlide : NO_SLIDE,
    NO_SLIDE,
  );
}

export function useGlideTo(): (event: MouseEvent<HTMLAnchorElement>, id: string) => void {
  const url = useUrlState();
  return (event) => {
    const anchor = event.currentTarget;
    const handled = url?.followLink({
      href: anchor.href,
      button: event.button,
      metaKey: event.metaKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      shiftKey: event.shiftKey,
      defaultPrevented: event.defaultPrevented,
      download: anchor.hasAttribute('download'),
      target: anchor.target || document.querySelector('base')?.target,
    });
    if (handled) event.preventDefault();
  };
}
