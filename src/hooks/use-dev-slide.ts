import { useEffect, useSyncExternalStore } from 'react';
import { useActiveSlide } from './use-url-state';

/*
 * Dev-only relay for the design-system token editor. The editor sits in the site
 * header, outside the Episode page and its URL-state service (FE-001 §2), so it
 * cannot call `useActiveSlide()` itself. A reporter inside the page reads the
 * active Slide through that hook and hands the id to this relay; the editor reads
 * it back. The relay holds no state of its own beyond that hand-over, and nothing
 * here parses the hash or polls.
 */
let slide: string | null = null;
const listeners = new Set<() => void>();

function publish(next: string | null) {
  if (slide === next) return;
  slide = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const noSlide = () => null;

/** The Slide the open Episode page reports as active; `null` on every other page. */
export function useDevSlide(): string | null {
  return useSyncExternalStore(subscribe, () => slide, noSlide);
}

/** Inside an Episode page: reports the active Slide to the relay, and clears it when the page unmounts. */
export function useReportActiveSlide() {
  const active = useActiveSlide();
  useEffect(() => {
    publish(active);
    return () => publish(null);
  }, [active]);
}
