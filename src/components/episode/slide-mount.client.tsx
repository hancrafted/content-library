'use client';

import { SlideIdContext, useZoneOf } from '@/hooks/use-slide-zone';
import { isMounted, keptHeight, type SlideZone } from '@/lib/slide-zone.pure';
import { useEffect, useRef, type ReactNode, type Ref } from 'react';

/** Remembers the box's height while it is mounted, so `far` can hold it. */
function useMeasuredHeight(mounted: boolean) {
  const box = useRef<HTMLDivElement>(null);
  const height = useRef(0);
  useEffect(() => {
    const element = box.current;
    if (!mounted || !element) return;
    const observer = new ResizeObserver(() => {
      height.current = element.getBoundingClientRect().height;
    });
    observer.observe(element);
    height.current = element.getBoundingClientRect().height;
    return () => observer.disconnect();
  }, [mounted]);
  return { box, height };
}

/** What a mount draws for a zone: content only outside `far`, the kept height while far. */
export function SlideMountView({
  id,
  zone,
  heldHeight,
  boxRef,
  children,
}: {
  id: string | null;
  zone: SlideZone;
  heldHeight: number;
  boxRef?: Ref<HTMLDivElement>;
  children: ReactNode;
}) {
  const held = keptHeight(zone, heldHeight);
  return (
    <div
      ref={boxRef}
      data-slot="slide-mount"
      data-zone={zone}
      className="flex flex-1 flex-col"
      style={held > 0 ? { minHeight: held } : undefined}
    >
      <SlideIdContext value={id}>{isMounted(zone) ? children : null}</SlideIdContext>
    </div>
  );
}

/**
 * The Slide frame's mount (FE-009 §4), inside the server-rendered wrapper.
 * Renders its children outside `far` only, and holds the last measured height
 * while they are gone, so unmounting never moves the scroll height. Provides
 * the Slide id (the Title slide has none and is never far), so
 * `useSlideZone()` below it reads this Slide's zone.
 */
export function SlideMount({ id, children }: { id?: string; children: ReactNode }) {
  const zone = useZoneOf(id ?? null);
  const { box, height } = useMeasuredHeight(isMounted(zone));
  return (
    <SlideMountView id={id ?? null} zone={zone} heldHeight={height.current} boxRef={box}>
      {children}
    </SlideMountView>
  );
}
