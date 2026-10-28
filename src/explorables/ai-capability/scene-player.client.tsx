'use client';

import { prefersReducedMotion } from '@/shared/hooks/prefers-reduced-motion';
import { useRevealedOnView } from '@/shared/hooks/use-revealed-on-view';
import { useCallback, useEffect, useState, type RefObject } from 'react';
import { LEVELS, SCENES, finalFrame, type Frame, type Level } from './scene-frames.pure';

/** Where the player is: the levels still to play in turn, and the frame the playing one shows. */
interface Play {
  readonly queue: readonly Level[];
  readonly index: number;
}

const AT_REST: Play = { queue: [], index: 0 };

/** The next step of a scene: its next frame, its first again while lit, or the next level in turn. */
function advance(play: Play, looping: boolean): Play {
  const playing = play.queue[0];
  if (playing === undefined) return play;
  if (play.index + 1 < SCENES[playing].length) return { ...play, index: play.index + 1 };
  if (looping) return { ...play, index: 0 };
  return { queue: play.queue.slice(1), index: 0 };
}

/** Each level's frame: the playing one's current frame, every other one at rest on its final frame. */
function framesOf(play: Play): Record<Level, Frame> {
  const playing = play.queue[0];
  return Object.fromEntries(
    LEVELS.map((each) => [each, each === playing ? (SCENES[each][play.index] ?? finalFrame(each)) : finalFrame(each)]),
  ) as Record<Level, Frame>;
}

/**
 * The scene player. At rest every scene shows its final frame, as the static export does. With `autoplay` the scenes
 * play once in turn when the timeline scrolls into view; a lit level loops its own scene; `playAll` plays them in
 * turn again; `playOne` plays one level's scene once, then rests. Under reduced motion nothing plays and every scene
 * stays at rest.
 */
export function useScenePlayer(ref: RefObject<Element | null>, autoplay: boolean, lit: Level | null) {
  const [play, setPlay] = useState<Play>(AT_REST);
  const revealed = useRevealedOnView(ref);
  const playAll = useCallback(() => {
    if (!prefersReducedMotion()) setPlay({ queue: LEVELS, index: 0 });
  }, []);
  const playOne = useCallback((level: Level) => {
    if (!prefersReducedMotion()) setPlay({ queue: [level], index: 0 });
  }, []);
  useEffect(() => {
    if (revealed && autoplay) playAll();
  }, [revealed, autoplay, playAll]);
  useEffect(() => {
    if (lit !== null && !prefersReducedMotion()) setPlay({ queue: [lit], index: 0 });
    else setPlay((current) => (current.queue.length > 1 ? current : AT_REST));
  }, [lit]);
  const playing = play.queue[0];
  const frame = playing === undefined ? undefined : SCENES[playing][play.index];
  useEffect(() => {
    if (frame === undefined) return;
    const timer = window.setTimeout(
      () => setPlay((current) => advance(current, lit !== null && current.queue.length === 1)),
      frame.ms,
    );
    return () => window.clearTimeout(timer);
  }, [frame, lit]);
  return { frames: framesOf(play), playing: play.queue[0] ?? null, playAll, playOne };
}
