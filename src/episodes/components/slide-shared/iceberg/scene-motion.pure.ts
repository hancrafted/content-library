/*
 * The Scene's motion report (design-ADR 0025, Motion 6): `idle` off the active Slide, `playing` once it turns active,
 * `settled` once every once-animation in it has ended. Ambient loops never end, so they are never waited on.
 */
import type { SlideZone } from '@/episodes/lib/slide-zone.pure';

export type SceneMotion = 'idle' | 'playing' | 'settled';

/** Where a Scene's motion starts from in a zone: it plays only on the active Slide, and starts over on re-entry. */
export function sceneMotionIn(zone: SlideZone): Exclude<SceneMotion, 'settled'> {
  return zone === 'active' ? 'playing' : 'idle';
}

/** The animations a Scene waits on before it settles: every one that ends, never an infinite loop. */
export function onceAnimations<T extends { readonly iterations: number }>(timings: readonly T[]): readonly T[] {
  return timings.filter(({ iterations }) => Number.isFinite(iterations));
}
