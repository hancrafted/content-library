'use client';

import type { HeaderMode } from '@/episodes/components/slide-master/slide';
import { useArtLoader } from '@/episodes/hooks/use-art-loader';
import { SlideIdContext, useArtLoadsOf, useEntryOf, useZoneOf } from '@/episodes/hooks/use-slide-zone';
import { isMounted, keptHeight, type SlideEntry, type SlideZone } from '@/episodes/lib/slide-zone.pure';
import { cn } from '@/shared/lib/utils';
import { useEffect, useRef, type ReactNode, type Ref } from 'react';

function useMeasuredHeight(mounted: boolean) {
  const box = useRef<HTMLDivElement>(null);
  const height = useRef(0);
  useEffect(() => {
    const element = box.current;
    if (!mounted || !element) return;
    // The observer reports the first size right after layout, so mounting forces no synchronous layout read.
    const observer = new ResizeObserver(([entry]) => {
      if (entry) height.current = entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height;
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [mounted]);
  return { box, height };
}

interface SlideMountViewProps {
  id: string | null;
  zone: SlideZone;
  heldHeight: number;
  boxRef?: Ref<HTMLDivElement>;
  entry?: SlideEntry;
  children: ReactNode;
  className?: string;
}

/** Identity only: retained decoration and removable Scenes read the same existing page zone store. */
export function SlideIdentity({ id, children }: { id?: string | null; children: ReactNode }) {
  return <SlideIdContext value={id ?? null}>{children}</SlideIdContext>;
}

export function SlideMountView({ id, zone, heldHeight, boxRef, entry, children, className }: SlideMountViewProps) {
  const held = keptHeight(zone, heldHeight);
  return (
    <div
      ref={boxRef}
      data-slot="slide-mount"
      data-art-root
      data-zone={zone}
      data-entry={entry}
      className={cn('flex flex-1 flex-col', className)}
      style={held > 0 ? { minHeight: held } : undefined}
    >
      <SlideIdentity id={id}>{isMounted(zone) ? children : null}</SlideIdentity>
    </div>
  );
}

/**
 * The Slide frame's mount (FE-009 §4), inside the server-rendered wrapper.
 * Renders its children outside `far` only, and holds the last measured height
 * while they are gone, so unmounting never moves the scroll height. Provides
 * the Slide id (the Title slide has none and is never far), so
 * `useSlideZone()` below it reads this Slide's zone. On the shared header it
 * also carries the Slide's entrance state for the play-once CSS (design-ADR-0012).
 * It loads the Scene art its content draws (`<Art>`, design-ADR 0025) once the
 * Slide is seen outside `far`.
 */
export function SlideMount({
  id,
  mode,
  children,
  className,
}: {
  id?: string;
  mode: HeaderMode;
  children: ReactNode;
  className?: string;
}) {
  const zone = useZoneOf(id ?? null);
  const entry = useEntryOf(id ?? null);
  const { box, height } = useMeasuredHeight(isMounted(zone));
  useArtLoader(box, useArtLoadsOf(id ?? null));
  return (
    <SlideMountView
      id={id ?? null}
      zone={zone}
      heldHeight={height.current}
      boxRef={box}
      className={className}
      entry={mode === 'shared' ? entry : undefined}
    >
      {children}
    </SlideMountView>
  );
}
