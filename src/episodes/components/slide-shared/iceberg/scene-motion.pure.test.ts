import { describe, expect, it } from 'vitest';
import { onceAnimations, sceneMotionIn } from './scene-motion.pure';

/*
 * When a Scene reports `data-motion="settled"`: browser checks wait on it (ARCH-003-testing §5), so it must come once
 * every once-animation of the Scene has ended, never wait on an ambient loop, and start over on re-entry.
 */

describe('success cases', () => {
  it('plays on the active Slide and rests idle elsewhere, so a re-entry plays again', () => {
    // ARRANGE
    const expected = ['idle', 'idle', 'playing'];
    // ACT
    const seen = (['far', 'near', 'active'] as const).map((zone) => sceneMotionIn(zone));
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('waits on the figure motions and emotes, never on the ambient loops', () => {
    // ARRANGE
    const travel = { name: 'travel', iterations: 1 };
    const emote = { name: 'emote', iterations: 1 };
    const wind = { name: 'wind', iterations: Infinity };
    const expected = [travel, emote];
    // ACT
    const waited = onceAnimations([travel, wind, emote]);
    // ASSERT
    expect(waited).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('waits on nothing when the Scene has only loops, so it settles at once', () => {
    // ARRANGE
    const expected: readonly unknown[] = [];
    // ACT
    const waited = onceAnimations([{ name: 'bubbles', iterations: Infinity }]);
    // ASSERT
    expect(waited).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('waits on a motion that repeats a few times, since it still ends', () => {
    // ARRANGE
    const scan = { name: 'scan', iterations: 3 };
    const expected = [scan];
    // ACT
    const waited = onceAnimations([scan]);
    // ASSERT
    expect(waited).toEqual(expected);
  });
});
