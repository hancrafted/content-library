'use client';

import { ownSignals } from '@/shared/lib/owned-signals';
import type { SurfaceBoundary, SurfaceClock, SurfaceTone } from '@/shared/lib/surface-clock';
import { driveSurfaceClock } from '@/shared/lib/surface-clock-driver';
import { useEffect, useRef } from 'react';

/** Only runtime inputs cross the client boundary, never Slide declarations, kits or Scene functions. */
export interface SurfaceDescriptor {
  readonly id: string;
  readonly tone: SurfaceTone;
}

function pixels(value: string, name: string) {
  if (value.trim() === '') return 0;
  if (/^-?(?:\d+\.?\d*|\.\d+)px$/.test(value.trim())) return Number.parseFloat(value);
  if (value.trim() === '0') return 0;
  if (process.env.NODE_ENV !== 'production') console.warn(`[surface clock] Invalid ${name}: ${value}; using 0px`);
  return 0;
}

function readSurfaces(descriptors: readonly SurfaceDescriptor[], root: HTMLElement): SurfaceBoundary[] {
  const scroll = window.scrollY;
  const rootPadding = getComputedStyle(document.documentElement).scrollPaddingTop;
  const padding = rootPadding === 'auto' ? 0 : pixels(rootPadding, 'scroll-padding-top');
  const measurements = descriptors.map((descriptor) => {
    const node = document.getElementById(descriptor.id);
    if (!node || !root.contains(node)) return null;
    return { descriptor, node, top: node.getBoundingClientRect().top + scroll, css: getComputedStyle(node) };
  });
  return measurements.flatMap((measurement, index) => {
    if (!measurement) return [];
    const { descriptor, top, css } = measurement;
    const scope = measurements[index - 1]?.css;
    return [
      {
        ...descriptor,
        top,
        anchorOffset: pixels(css.scrollMarginTop, 'scroll-margin-top') + padding,
        startOffset: pixels(
          scope?.getPropertyValue('--slide-transition-start-offset') ?? '',
          '--slide-transition-start-offset',
        ),
        endOffset: pixels(
          scope?.getPropertyValue('--slide-transition-end-offset') ?? '',
          '--slide-transition-end-offset',
        ),
      },
    ];
  });
}

/** Discrete global tone and continuous local progress have distinct publication scopes. */
function publish(root: HTMLElement, surfaces: readonly SurfaceDescriptor[], clock: SurfaceClock) {
  const signals = ownSignals(document.documentElement);
  const writeTone = (tone: SurfaceTone) => signals.attribute('data-page-tone', tone);
  writeTone(clock.getSnapshot().tone);
  const unsubscribe = clock.subscribe((snapshot) => snapshot.tone, writeTone);
  const edges = surfaces.slice(0, -1).flatMap((surface, index) => {
    const node = document.getElementById(surface.id);
    if (!node || !root.contains(node)) return [];
    const owned = ownSignals(node);
    const unsubscribe = clock.subscribe(
      (snapshot) => snapshot.edges[index]?.progress,
      (progress) => {
        if (progress !== undefined) owned.property('--surface-edge-progress', String(progress));
      },
    );
    return [
      () => {
        unsubscribe();
        owned.dispose();
      },
    ];
  });
  return () => {
    unsubscribe();
    edges.forEach((dispose) => dispose());
    signals.dispose();
  };
}

function observeLayout(root: HTMLElement, surfaces: readonly SurfaceDescriptor[], refresh: () => void) {
  const resizeObserver = new ResizeObserver(refresh);
  for (const surface of surfaces) {
    const node = document.getElementById(surface.id);
    if (node && root.contains(node)) resizeObserver.observe(node);
  }
  const header = document.querySelector('[data-testid="site-header"]');
  if (header) resizeObserver.observe(header);
  const mutations = new MutationObserver(refresh);
  mutations.observe(root, { subtree: true, childList: true });
  root.addEventListener('surface-clock-refresh', refresh);
  document.fonts.addEventListener('loadingdone', refresh);
  let live = true;
  void document.fonts.ready.then(() => {
    if (live) refresh();
  });
  return () => {
    live = false;
    resizeObserver.disconnect();
    mutations.disconnect();
    root.removeEventListener('surface-clock-refresh', refresh);
    document.fonts.removeEventListener('loadingdone', refresh);
  };
}

function observe(
  root: HTMLElement,
  surfaces: readonly SurfaceDescriptor[],
  driver: ReturnType<typeof driveSurfaceClock>,
) {
  const localSignals = ownSignals(root);
  const refresh = () => driver.clock.requestRefresh();
  const visibility = () => localSignals.attribute('data-presentation-hidden', String(document.hidden));
  const stopLayout = observeLayout(root, surfaces, refresh);
  window.addEventListener('scroll', driver.scroll, { passive: true });
  window.addEventListener('resize', driver.resize);
  document.addEventListener('visibilitychange', visibility);
  visibility();
  return () => {
    stopLayout();
    window.removeEventListener('scroll', driver.scroll);
    window.removeEventListener('resize', driver.resize);
    document.removeEventListener('visibilitychange', visibility);
    localSignals.dispose();
  };
}

/** Page-owned attachment: cached stable wrappers, one passive scroll listener, no active-Slide authority. */
function attach(root: HTMLElement, surfaces: readonly SurfaceDescriptor[], samplingLine?: number) {
  const driver = driveSurfaceClock({
    readGeometry: () => ({
      surfaces: readSurfaces(surfaces, root),
      viewport: window.innerHeight,
      maximum: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
      samplingLine:
        samplingLine ?? document.querySelector('[data-testid="site-header"]')?.getBoundingClientRect().bottom ?? 0,
    }),
    readPosition: () => window.scrollY,
    frame: (run) => requestAnimationFrame(run),
    cancelFrame: (id) => cancelAnimationFrame(id),
    timer: (run, delay) => window.setTimeout(run, delay),
    cancelTimer: (id) => window.clearTimeout(id),
  });
  const stopPublishing = publish(root, surfaces, driver.clock);
  const stopObserving = observe(root, surfaces, driver);
  return () => {
    driver.dispose();
    stopPublishing();
    stopObserving();
  };
}
export function SurfaceClockAttachment({
  surfaces,
  samplingLine,
}: {
  surfaces: readonly SurfaceDescriptor[];
  samplingLine?: number;
}) {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = marker.current?.closest<HTMLElement>('[data-slot="episode-page"]');
    if (root) return attach(root, surfaces, samplingLine);
  }, [surfaces, samplingLine]);
  return <span hidden ref={marker} data-surface-clock />;
}
