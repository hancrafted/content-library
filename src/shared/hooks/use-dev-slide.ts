import { useEffect, useSyncExternalStore } from 'react';
import { useActiveSlide } from './use-url-state';

/*
 * Dev-only relay for the design-system token editor. The editor sits in the site
 * header, outside the Episode page and its URL-state service (FE-001 §2), so it
 * cannot call `useActiveSlide()` itself. A reporter inside the page reads the
 * active Slide through that hook and hands its id, with the source folder the
 * page's Slides sit in, to this relay; the editor reads them back. The relay holds
 * no state of its own beyond that hand-over, and nothing here parses the hash or polls.
 */

/** The active Slide as the open page reports it: its id, and the source folder its page's Slides sit in. */
export interface DevSlide {
  readonly id: string;
  readonly folder: string;
}

let slide: DevSlide | null = null;
const listeners = new Set<() => void>();

const sameSlide = (a: DevSlide | null, b: DevSlide | null) =>
  a === b || (a !== null && b !== null && a.id === b.id && a.folder === b.folder);

function publish(next: DevSlide | null) {
  if (sameSlide(slide, next)) return;
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
export function useDevSlide(): DevSlide | null {
  return useSyncExternalStore(subscribe, () => slide, noSlide);
}

/**
 * Inside an Episode page: reports the active Slide, and the source folder the page's Slides sit in, to the relay, and
 * clears it when the page unmounts.
 */
export function useReportActiveSlide(folder: string) {
  const active = useActiveSlide();
  useEffect(() => {
    publish(active === null ? null : { id: active, folder });
    return () => publish(null);
  }, [active, folder]);
}
