/*
 * The maths of the Explorable hero's Message drift: a field of faint bubbles and, every few seconds, one subject beat in
 * the accent colour. Pure, so the timeline, the end state and the layout test without a canvas.
 */

/** Which Explorable's story the beat tells. */
export type Story = 'context-window' | 'human-in-the-loop' | 'ai-disciplines';

/** One ambient cycle, the gap between subject beats and a beat's length, in seconds. */
export const LOOP_SECONDS = 18;
export const BEAT_EVERY_SECONDS = 6;
export const BEAT_SECONDS = 1.5;
/** Foreground ink's composite opacity for the ambient field: never above 12%. */
export const FIELD_INK = 0.12;
/** The beat's progress when it has run its course: the composed end state under reduced motion. */
export const END_PROGRESS = 1;
/** Where in the loop the static frame of reduced motion sits. */
export const STATIC_SECONDS = LOOP_SECONDS * 0.28;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
/** Smoothstep: no snapping growth, no bounce. */
export const ease = (value: number) => {
  const p = clamp(value);
  return p * p * (3 - 2 * p);
};
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/** Where the loop's subject beat is at `seconds`: how far it has run (0 to 1) and how strongly it shows. */
export function beatOf(seconds: number): { progress: number; strength: number } {
  const beatTime = (seconds + BEAT_EVERY_SECONDS - 2) % BEAT_EVERY_SECONDS;
  return {
    progress: clamp(beatTime / BEAT_SECONDS),
    strength: ease(beatTime / 0.2) * (1 - ease((beatTime - 1.2) / 0.3)),
  };
}

/** Ambient bubbles, in proportion to the hero's area, five to twelve. */
export function bubbleCountOf(width: number, height: number): number {
  return Math.max(5, Math.min(12, Math.round((width * height) / 100000)));
}

/** A rectangle in hero coordinates. */
export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Where the art lives: beside the copy, or in the space above it (`compact`). */
export interface Area {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly compact: boolean;
}

/**
 * The art's area from the hero's height, the headline and lede boxes, and `right`, the left edge of the pause button,
 * which sits at the Foreground's right inset and so clears an open drawer: beside the copy when 220px is left, else above.
 */
export function areaOf(hero: {
  width: number;
  height: number;
  text: readonly Box[];
  top: number;
  right: number;
}): Area {
  const { height, text, top, right } = hero;
  const textRight = Math.max(...text.map((box) => box.x + box.width));
  const copyTop = Math.min(...text.map((box) => box.y));
  const room = right - 12 - textRight;
  if (room >= 220)
    return { x: textRight + 24, y: top + 4, w: room, h: Math.max(180, height - top - 270), compact: false };
  return { x: 24, y: top, w: right - 12 - 24, h: Math.max(24, copyTop - top - 20), compact: true };
}

/** What the page lets the background do now. */
export type Motion = 'running' | 'reduced' | 'paused' | 'hidden' | 'offscreen';

/** The loop runs only when motion is allowed, not paused, the tab is visible and the Slide is active. */
export function motionOf(state: { reduced: boolean; paused: boolean; hidden: boolean; active: boolean }): Motion {
  if (state.reduced) return 'reduced';
  if (state.paused) return 'paused';
  if (state.hidden) return 'hidden';
  return state.active ? 'running' : 'offscreen';
}

/** A timeline that counts only the time it runs: `stop` forgets the last frame, so a resume does not jump. */
export function createClock(): { tick: (now: number) => number; stop: () => void } {
  let elapsed = 0;
  let last: number | null = null;
  return {
    tick(now) {
      if (last !== null) elapsed += (now - last) / 1000;
      last = now;
      return elapsed;
    },
    stop() {
      last = null;
    },
  };
}

/** Where the subject bubble is at beat `progress`, and what it carries; `alpha` is before the beat's strength. */
export interface Pose {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly alpha: number;
  /** How much of the orange check is drawn, 0 to 1. */
  readonly check: number;
  /** Attached chips, 0 to 4, the last one easing in. */
  readonly chips: number;
  /** Blur in pixels. */
  readonly blur: number;
}

const CHECKPOINT = 0.49;

/** The y of the Human bubble's checkpoint line. */
export const checkpointOf = (area: Area) => area.y + area.h * CHECKPOINT;

/** What a story's beat is drawn in: its progress, the art's area and the bubble's height. */
export interface Scene {
  readonly story: Story;
  readonly progress: number;
  readonly area: Area;
  readonly size: number;
}

type Placed = Omit<Pose, 'x' | 'width'>;

const NONE = { check: 0, chips: 0, blur: 0 } as const;

/** The Context bubble rises into the middle, blurs and dims until it is gone: forgotten. */
function contextBeat({ progress, area }: Scene): Placed {
  const middle = ease(progress);
  return {
    ...NONE,
    y: mix(area.y + area.h * 0.86, area.y + area.h * 0.48, middle),
    alpha: (1 - middle) * 0.75,
    blur: middle * (area.compact ? 1.2 : 4),
  };
}

/** The Human bubble rises to the checkpoint, holds while its check draws on, then continues upward. */
function humanBeat({ progress, area }: Scene): Placed {
  const checkpoint = checkpointOf(area);
  let y = mix(checkpoint, area.y + area.h * 0.14, ease((progress - 0.66) / 0.34));
  if (progress < 0.66) y = checkpoint;
  if (progress < 0.3) y = mix(area.y + area.h * 0.85, checkpoint, ease(progress / 0.3));
  return { ...NONE, y, alpha: 0.6, check: ease((progress - 0.38) / 0.22) };
}

/** The Disciplines bubble climbs one tier per quarter of the beat and gains a chip as it settles on each. */
function disciplinesBeat({ progress, area }: Scene): Placed {
  const step = Math.min(3, Math.floor(progress * 4));
  const local = ease(Math.min(1, (progress * 4 - step) / 0.65));
  const previousTier = step === 0 ? 0.98 : 0.85 - (step - 1) * 0.24;
  return {
    ...NONE,
    y: area.y + area.h * mix(previousTier, 0.85 - step * 0.24, local),
    alpha: 0.8,
    chips: Math.min(4, step + ease((local - 0.65) / 0.35)),
  };
}

const BEATS = { 'context-window': contextBeat, 'human-in-the-loop': humanBeat, 'ai-disciplines': disciplinesBeat };

/** The subject bubble of one story at beat `progress`. Nothing visible once the Context bubble has dissolved. */
export function beatPoseOf(scene: Scene): Pose {
  const placed = BEATS[scene.story](scene);
  const grown = scene.story === 'ai-disciplines' ? placed.chips * scene.size * 0.12 : 0;
  return { ...placed, x: scene.area.x + scene.area.w * 0.53, width: scene.size * 2.6 + grown };
}
