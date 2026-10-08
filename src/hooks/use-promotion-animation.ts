import { createPromotionTimeline } from '@/hooks/promotion-timeline';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useEffect, useRef, type RefObject } from 'react';

type Animation = ReturnType<typeof createPromotionTimeline>;
const ANIMATED_VIEW =
  '(min-width: 1024px) and (prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)';

function mountAnimation(element: HTMLElement, animation: RefObject<Animation | null>) {
  const active = createPromotionTimeline(element);
  animation.current = active;
  // Resizing during flight must not strand a word at an obsolete caption position.
  window.addEventListener('resize', active.finish);
  window.addEventListener('beforeprint', active.finish);
  return () => {
    window.removeEventListener('resize', active.finish);
    window.removeEventListener('beforeprint', active.finish);
    active.settle();
    animation.current = null;
  };
}

export function usePromotionAnimation(root: RefObject<HTMLElement | null>, accelerated: boolean) {
  const animation = useRef<Animation | null>(null);
  useGSAP(
    () => {
      const element = root.current;
      if (!element) return;
      const media = gsap.matchMedia();
      media.add(ANIMATED_VIEW, () => mountAnimation(element, animation));
      return () => media.revert();
    },
    { scope: root },
  );
  useEffect(() => {
    animation.current?.drain.timeScale(accelerated ? 2.8 : 1);
  }, [accelerated]);
  return {
    burst: () => animation.current?.burst(),
    finish: () => animation.current?.finish(),
  };
}
