'use client';

import { useUrlState } from '@/shared/hooks/use-url-state';
import { inkScale, type INK_PROFILES } from '@/shared/lib/ink-transition.pure';
import { ownSignals } from '@/shared/lib/owned-signals';
import type { SurfaceBoundary, SurfaceClock, SurfaceTone } from '@/shared/lib/surface-clock';
import { driveSurfaceClock } from '@/shared/lib/surface-clock-driver';
import type { UrlState } from '@/shared/lib/url-state';
import { useEffect, useRef } from 'react';

/** Only runtime inputs cross the client boundary, never Slide declarations, kits or Scene functions. */
export interface SurfaceDescriptor {
  readonly effect?: keyof typeof INK_PROFILES;
  readonly id: string;
  readonly tone: SurfaceTone;
}

function pixels(value: string, name: string) {
  if (value.trim() === '') return 0;
  if (/^-?(?:\d+\.?\d*|\.\d+)px$/.test(value.trim()) && Number.isFinite(Number.parseFloat(value)))
    return Number.parseFloat(value);
  if (value.trim() === '0') return 0;
  if (process.env.NODE_ENV !== 'production') console.warn(`[surface clock] Invalid ${name}: ${value}; using 0px`);
  return 0;
}

/** Native root scroll-padding percentages use the scrollport height, as does the navigation authority. */
function rootPaddingPixels(value: string) {
  if (value.endsWith('%')) return (Number.parseFloat(value) / 100) * window.innerHeight;
  return value === 'auto' ? 0 : pixels(value, 'scroll-padding-top');
}

function readSurfaces(descriptors: readonly SurfaceDescriptor[], root: HTMLElement): SurfaceBoundary[] {
  const scroll = window.scrollY;
  const rootPadding = getComputedStyle(document.documentElement).scrollPaddingTop;
  const padding = rootPaddingPixels(rootPadding);
  const measurements = descriptors.map((descriptor) => {
    const node = document.getElementById(descriptor.id);
    if (!node || !root.contains(node)) return null;
    const edge = node.querySelector<HTMLElement>(':scope > [data-transition-edge]');
    return {
      descriptor,
      node,
      top: node.getBoundingClientRect().top + scroll,
      css: getComputedStyle(node),
      scope: edge ? getComputedStyle(edge) : undefined,
    };
  });
  return measurements.flatMap((measurement, index) => {
    if (!measurement) return [];
    const { descriptor, top, css } = measurement;
    const scope = rangeScope(measurements[index - 1]);
    return [
      {
        ...descriptor,
        top,
        anchorOffset: pixels(css.scrollMarginTop, 'scroll-margin-top') + padding,
        ...rangeOffsets(scope),
      },
    ];
  });
}

function rangeScope(
  measurement:
    { descriptor: SurfaceDescriptor; scope?: CSSStyleDeclaration; css: CSSStyleDeclaration } | null | undefined,
) {
  return measurement?.descriptor.effect ? measurement.scope : measurement?.css;
}

function rangeOffsets(scope?: CSSStyleDeclaration) {
  const read = (name: string) => pixels(scope?.getPropertyValue(name) ?? '', name);
  return { startOffset: read('--slide-transition-start-offset'), endOffset: read('--slide-transition-end-offset') };
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
    return [publishEdge(node, surface, { clock, index })];
  });
  return () => {
    unsubscribe();
    edges.forEach((dispose) => dispose());
    signals.dispose();
  };
}

function publishEdge(
  node: HTMLElement,
  surface: SurfaceDescriptor,
  { clock, index }: { clock: SurfaceClock; index: number },
) {
  const owned = ownSignals(node);
  const host = node.querySelector<HTMLElement>(':scope > [data-transition-edge]');
  const ink = host?.querySelector<HTMLElement>('[data-ink-scale]');
  const effectSignals = host ? ownSignals(host) : undefined;
  const inkSignals = ink ? ownSignals(ink) : undefined;
  const render = (progress: number | undefined) => {
    if (progress === undefined) return;
    owned.property('--surface-edge-progress', String(progress));
    if (inkSignals && surface.effect) inkSignals.property('transform', `scaleY(${inkScale(surface.effect, progress)})`);
  };
  const suppress = (value: boolean) => effectSignals?.attribute('data-transition-suppressed', String(value));
  render(clock.getSnapshot().edges[index]?.progress);
  suppress(clock.getSnapshot().suppressed);
  const unsubscribe = clock.subscribe((snapshot) => snapshot.edges[index]?.progress, render);
  const stopSuppression = clock.subscribe((snapshot) => snapshot.suppressed, suppress);
  return () => {
    unsubscribe();
    stopSuppression();
    effectSignals?.dispose();
    inkSignals?.dispose();
    owned.dispose();
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
function attach(
  root: HTMLElement,
  surfaces: readonly SurfaceDescriptor[],
  { navigation, samplingLine }: { navigation: UrlState | null; samplingLine?: number },
) {
  const driver = driveSurfaceClock({
    navigation: navigation ?? undefined,
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
  const navigation = useUrlState();
  useEffect(() => {
    const root = marker.current?.closest<HTMLElement>('[data-slot="episode-page"]');
    if (root) return attach(root, surfaces, { navigation, samplingLine });
  }, [surfaces, samplingLine, navigation]);
  return <span hidden ref={marker} data-surface-clock />;
}
