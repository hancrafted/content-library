// decision: docs/adr/0025-scene-figures-are-deep-modules.md
import type { SlideZone } from '@/episodes/lib/slide-zone.pure';

export type SceneMotion = 'idle' | 'playing' | 'settled';

export function sceneMotionIn(zone: SlideZone): Exclude<SceneMotion, 'settled'> {
  return zone === 'active' ? 'playing' : 'idle';
}

export function onceAnimations<T extends { readonly iterations: number }>(timings: readonly T[]): readonly T[] {
  return timings.filter(({ iterations }) => Number.isFinite(iterations));
}
