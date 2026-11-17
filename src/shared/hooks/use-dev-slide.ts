import { useEffect, useSyncExternalStore } from 'react';
import { useActiveSlide } from './use-url-state';

// decision: FE-001 §2
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

export function useDevSlide(): DevSlide | null {
  return useSyncExternalStore(subscribe, () => slide, noSlide);
}

export function useReportActiveSlide(folder: string) {
  const active = useActiveSlide();
  useEffect(() => {
    publish(active === null ? null : { id: active, folder });
    return () => publish(null);
  }, [active, folder]);
}
