// decision: FE-009 §4
import { useEffect, useState, type RefObject } from 'react';

const MOUNT = '[data-slot="slide-mount"]';
const REDUCE = '(prefers-reduced-motion: reduce)';

const activeOf = (mount: Element | null): boolean => !mount || mount.getAttribute('data-zone') === 'active';

const watchZone = (mount: Element | null, on: (v: boolean) => void): (() => void) => {
  on(activeOf(mount));
  if (!mount) return () => undefined;
  const mo = new MutationObserver(() => on(activeOf(mount)));
  mo.observe(mount, { attributes: true, attributeFilter: ['data-zone'] });
  return () => mo.disconnect();
};

const watchVisible = (on: (v: boolean) => void): (() => void) => {
  const f = () => on(!document.hidden);
  f();
  document.addEventListener('visibilitychange', f);
  return () => document.removeEventListener('visibilitychange', f);
};

const watchReduced = (on: (v: boolean) => void): (() => void) => {
  const mq = window.matchMedia(REDUCE),
    f = () => on(mq.matches);
  f();
  mq.addEventListener('change', f);
  return () => mq.removeEventListener('change', f);
};

export function usePlaying(stage: RefObject<HTMLElement | null>): { playing: boolean; reduced: boolean } {
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const offs = [
      watchZone(stage.current?.closest(MOUNT) ?? null, setActive),
      watchVisible(setVisible),
      watchReduced(setReduced),
    ];
    return () => offs.forEach((f) => f());
  }, [stage]);
  return { playing: active && visible && !reduced, reduced };
}
